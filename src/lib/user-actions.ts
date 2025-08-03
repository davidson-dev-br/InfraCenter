
'use server';

import { getAuth, UserRecord } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User, _deleteUser, ensureDatabaseSchema as _ensureDatabaseSchema, _getUserById } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { getFirebaseAuth } from './firebase-admin';
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

export async function updateUser(userData: Partial<User>): Promise<User> {
    const adminUser = await getAdminUser();
    const isCreating = !userData.id;
    let authRecord: UserRecord | undefined = undefined;

    if (isCreating && userData.email && userData.password) {
        // Fluxo de criação de usuário
        try {
            const auth = getFirebaseAuth();
            authRecord = await auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName || undefined,
            });
            // O UID do Firebase se torna o ID no nosso banco de dados
            userData.id = authRecord.uid;
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                throw new Error('Este e-mail já está em uso por outro usuário.');
            }
            throw new Error(`Falha ao criar usuário na autenticação: ${error.message}`);
        }
    } else if (!isCreating && userData.id) {
        // Fluxo de atualização de usuário existente
    } else {
        throw new Error('Dados insuficientes para criar ou atualizar usuário.');
    }
    
    // Atualiza/Cria o registro no banco de dados SQL
    const updatedUser = await _updateUser(userData as User);

    // Log de auditoria
    if (adminUser) {
        if (isCreating) {
             await logAuditEvent({
                action: 'USER_CREATED',
                entityType: 'User',
                entityId: updatedUser.id,
                details: {
                    email: updatedUser.email,
                    role: updatedUser.role,
                }
            });
        } else {
             const userBeforeUpdate = await _getUserById(userData.id!);
             await logAuditEvent({
                action: 'USER_UPDATED',
                entityType: 'User',
                entityId: updatedUser.id,
                details: {
                    old: userBeforeUpdate ? { role: userBeforeUpdate.role, permissions: userBeforeUpdate.permissions, accessibleBuildingIds: userBeforeUpdate.accessibleBuildingIds } : {},
                    new: { role: updatedUser.role, permissions: updatedUser.permissions, accessibleBuildingIds: updatedUser.accessibleBuildingIds }
                }
            });
        }
    }
    
    return updatedUser;
}


export async function deleteUser(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("O ID do usuário é obrigatório para a exclusão.");
    }

    const adminUser = await getAdminUser();
    const userToDelete = await _getUserById(userId); 

    if (userToDelete) {
        // Deleta do Firebase Auth
        try {
            const auth = getFirebaseAuth();
            await auth.deleteUser(userId);
        } catch (error: any) {
            console.error(`Falha ao deletar usuário ${userId} do Firebase Auth: ${error.message}`);
            // Continuamos para deletar do DB local mesmo se falhar aqui, para evitar registros órfãos
        }
        
        // Deleta do banco de dados local
        await _deleteUser(userToDelete.id);
    }

    if (adminUser && userToDelete) {
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
}
