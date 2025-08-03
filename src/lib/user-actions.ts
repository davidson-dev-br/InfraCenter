
'use server';

import { getAuth } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User, _deleteUser, ensureDatabaseSchema as _ensureDatabaseSchema, _getUserById } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { getFirebaseAuth } from './firebase-admin';
import { headers } from 'next/headers';


// Com grandes poderes vêm grandes responsabilidades. Esta função tem grandes poderes.
async function getAdminUser() {
    // Esta função busca o usuário que está realizando a ação.
    // Em um cenário de produção, isso seria derivado de uma sessão validada.
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
            // Retorna null se o token for inválido, para que a operação falhe de forma segura.
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

export async function updateUser(userData: Partial<User> & { id?: string }): Promise<User> {
    const adminUser = await getAdminUser();
    
    // Determina se é uma operação de criação ou atualização
    const userToUpdate = userData.email ? await _getUserByEmail(userData.email) : null;
    const isCreating = !userToUpdate;

    if (isCreating && userData.email && userData.password) {
        // --- Fluxo de Criação ---
        const auth = getFirebaseAuth();
        const userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
        });
        
        userData.id = userRecord.uid; // Garante que o ID do DB seja o UID do Firebase

    } else if (!isCreating && userToUpdate) {
        // --- Fluxo de Atualização ---
        userData.id = userToUpdate.id; // Garante que o ID seja o correto
    } else {
        throw new Error("Dados do usuário incompletos para a operação.");
    }
    
    const updatedUser = await _updateUser(userData as User);

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
        // Deleta do Firebase Auth
        const auth = getFirebaseAuth();
        await auth.deleteUser(userToDelete.id);
        
        // Deleta do banco de dados local
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
              note: 'Usuário removido da autenticação e do banco de dados da aplicação.' 
            }
        });
    }
}
