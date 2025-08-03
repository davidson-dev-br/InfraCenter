
'use server';

import { getAuth, UserRecord } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User, _deleteUser, ensureDatabaseSchema as _ensureDatabaseSchema, _getUserById } from "./user-service";
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


export async function updateUser(userData: Partial<User>): Promise<User> {
    const adminUser = await getAdminUser();
    
    // Agora a ação updateUser serve tanto para criar um novo registro (se o ID não existir)
    // quanto para atualizar um existente. O UID do Firebase é a chave.
    if (!userData.id) {
        throw new Error('O UID do Firebase (como id) é obrigatório para criar ou atualizar um usuário.');
    }
    
    // Atualiza/Cria o registro no banco de dados SQL
    const updatedUser = await _updateUser(userData as User);

    // Log de auditoria
    if (adminUser) {
        // Verifica se é uma criação (o usuário não existia antes da chamada)
        const userExisted = !!(await _getUserById(userData.id)); 
        
        if (!userExisted) {
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
        // A remoção da autenticação do Firebase é manual pelo console.
        // Apenas deletamos do nosso banco de dados.
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
