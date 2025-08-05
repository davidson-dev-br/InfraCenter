
'use server';

import { getAuth, UserRecord } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User, _deleteUser, _ensureDatabaseSchema, _getUserById } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { getFirebaseAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

async function getAdminUser() {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const auth = await getFirebaseAuth();
            const decodedToken = await auth.verifyIdToken(idToken);
            if (decodedToken.email) {
                return await _getUserByEmail(decodedToken.email);
            }
        } catch (error) {
            console.error("Erro ao verificar o token de autenticação do administrador:", error);
            return null;
        }
    }
    return null;
}

export async function ensureDatabaseSchema(): Promise<string> {
    return _ensureDatabaseSchema();
}

export async function getUsers(): Promise<User[]> {
    return _getUsers();
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return _getUserByEmail(email);
}


export async function updateUser(userData: Partial<User> & { password?: string }): Promise<User> {
    const adminUser = await getAdminUser();
    
    // Se um ID de usuário for fornecido, primeiro tentamos uma atualização.
    if (userData.id) {
       const userToUpdate = await _getUserById(userData.id);
       if (userToUpdate) {
            // Log de auditoria antes da atualização
             if (adminUser) {
                 await logAuditEvent({
                    action: 'USER_UPDATED',
                    entityType: 'User',
                    entityId: userData.id,
                    details: {
                        old: { role: userToUpdate.role, permissions: userToUpdate.permissions, accessibleBuildingIds: userToUpdate.accessibleBuildingIds, email: userToUpdate.email, displayName: userToUpdate.displayName },
                        new: { role: userData.role, permissions: userData.permissions, accessibleBuildingIds: userData.accessibleBuildingIds, email: userData.email, displayName: userData.displayName }
                    }
                });
             }
             // A função _updateUser fará a mesclagem e salvará no banco.
             return await _updateUser({ ...userToUpdate, ...userData });
       }
    }
    
    // Se não for uma atualização (sem ID ou usuário não encontrado), é uma criação.
    if (userData.password && userData.email && userData.displayName) {
        try {
            const auth = await getFirebaseAuth();
            const newUserRecord = await auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName,
            });
            // Usamos o UID retornado pelo Firebase como nosso ID primário.
            userData.id = newUserRecord.uid;

            // Log de auditoria para criação
             if (adminUser) {
                await logAuditEvent({
                    action: 'USER_CREATED',
                    entityType: 'User',
                    entityId: userData.id,
                    details: { email: userData.email, role: userData.role }
                });
            }
            
            // A função _updateUser criará o registro no nosso banco de dados.
            return await _updateUser(userData as User);

        } catch (error: any) {
            console.error("Erro ao criar usuário no Firebase Auth:", error);
            if (error.code === 'auth/email-already-exists') {
                throw new Error('Este e-mail já está em uso no sistema de autenticação.');
            }
            throw new Error(`Falha ao criar o usuário no serviço de autenticação: ${error.message}`);
        }
    }

    throw new Error('Dados insuficientes para criar ou atualizar usuário. ID (para atualização) ou E-mail/Senha (para criação) são necessários.');
}


export async function deleteUser(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("O ID do usuário é obrigatório para a exclusão.");
    }

    const adminUser = await getAdminUser();
    const userToDelete = await _getUserById(userId); 

    if (userToDelete) {
        // A remoção da autenticação do Firebase é manual pelo console.
        // Apenas deletamos do nosso banco de dados.
        await _deleteUser(userToDelete.id);

        if (adminUser) {
            await logAuditEvent({
                action: 'USER_DELETED',
                entityType: 'User',
                entityId: userId,
                details: { 
                  email: userToDelete.email, 
                  displayName: userToDelete.displayName
                }
            });
        }
    } else {
        console.warn(`Tentativa de exclusão de usuário não encontrado no banco de dados: ${userId}`);
    }
}
