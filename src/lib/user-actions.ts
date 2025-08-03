
'use server';

import { getAuth } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User, _deleteUser, ensureDatabaseSchema as _ensureDatabaseSchema, _getUserById } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { getFirebaseAuth } from './firebase-admin';
import { headers } from 'next/headers';

async function getAdminUser() {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const auth = getFirebaseAuth();
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

export async function updateUser(userData: Partial<User> & { id: string }): Promise<User> {
    const adminUser = await getAdminUser();
    
    // A lógica agora é mais simples: ela sempre espera um ID (Firebase UID).
    // Se o usuário com esse ID não existe, ele cria. Se existe, atualiza.
    const userToUpdate = await _getUserById(userData.id);
    const isCreating = !userToUpdate;
    
    const updatedUser = await _updateUser(userData);

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
             await logAuditEvent({
                action: 'USER_UPDATED',
                entityType: 'User',
                entityId: updatedUser.id,
                details: {
                    old: userToUpdate ? { role: userToUpdate.role, permissions: userToUpdate.permissions, accessibleBuildingIds: userToUpdate.accessibleBuildingIds, preferences: userToUpdate.preferences } : {},
                    new: { role: updatedUser.role, permissions: updatedUser.permissions, accessibleBuildingIds: updatedUser.accessibleBuildingIds, preferences: updatedUser.preferences }
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
        // Agora, apenas deletamos do banco de dados local.
        await _deleteUser(userToDelete.id);
    }

    if (adminUser && userToDelete) {
        await logAuditEvent({
            action: 'USER_DELETED_FROM_DB',
            entityType: 'User',
            entityId: userId,
            details: { 
              email: userToDelete.email, 
              displayName: userToDelete.displayName, 
              note: 'Usuário removido da aplicação. A remoção do Firebase Auth deve ser manual.' 
            }
        });
    }
}
