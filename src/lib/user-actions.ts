
'use server';

import { getAuth } from 'firebase-admin/auth';
import { _getUsers, _getUserByEmail, _updateUser, User, _deleteUser, ensureDatabaseSchema as _ensureDatabaseSchema } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { getFirebaseAuth } from './firebase-admin';

// Com grandes poderes vêm grandes responsabilidades. Esta função tem grandes poderes.
async function getAdminUser() {
    // This is a placeholder for getting the currently logged-in admin user.
    // In a real app, you'd get this from the session.
    // For now, let's assume a mock admin for logging purposes.
    // In a server action, there is no direct concept of "the user" without passing it in.
    // This is a limitation we'll work around for now.
    const mockAdminEmail = "dconceicao_fundamentos@timbrasil.com";
    try {
        const user = await _getUserByEmail(mockAdminEmail);
        return user;
    } catch(e){
        return null;
    }
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

export async function updateUser(userData: Partial<User> & ({ email: string } | { id: string })): Promise<User> {
    const adminUser = await getAdminUser();
    const isCreating = !('id' in userData && userData.id);

    // Capture state before the update for detailed logging
    let oldState: User | null = null;
    if (!isCreating && 'id' in userData) {
        // If we are updating, we need the old state for logging.
        // We find the user by ID and then use their email to get the full old state.
        const existingUser = await _updateUser({ id: userData.id }); // A bit inefficient, but gets the email
        if (existingUser?.email) {
            oldState = await _getUserByEmail(existingUser.email);
        }
    } else if (!isCreating && 'email' in userData) {
        oldState = await _getUserByEmail(userData.email);
    }
    
    // Se estiver criando um novo usuário, primeiro cria a conta no Firebase Auth.
    if (isCreating && 'email' in userData && userData.email) {
        try {
            const auth = getFirebaseAuth();
            await auth.createUser({
                email: userData.email,
                password: 'tim@123456', // Senha padrão para novos usuários
                displayName: userData.displayName || undefined,
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                // Se o usuário já existe no Firebase Auth mas não no nosso DB,
                // podemos optar por apenas logar ou tentar sincronizar.
                // Por enquanto, vamos lançar um erro claro.
                throw new Error('Este e-mail já está registrado no serviço de autenticação.');
            }
            console.error("Erro ao criar usuário no Firebase Auth:", error);
            throw new Error(`Falha ao criar usuário no Firebase Auth: ${error.message}`);
        }
    }

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
                    old: oldState ? { role: oldState.role, permissions: oldState.permissions, accessibleBuildingIds: oldState.accessibleBuildingIds, preferences: oldState.preferences } : {},
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
    const userToDelete = await _updateUser({ id: userId }); // Um jeito de pegar o usuário pelo ID

    // Deleta do Firebase Auth
    try {
        const auth = getFirebaseAuth();
        await auth.deleteUser(userToDelete.id);
    } catch (error: any) {
        // Se o usuário não for encontrado no Firebase Auth, apenas logamos e continuamos para apagar do DB local.
        if (error.code === 'auth/user-not-found') {
            console.warn(`Usuário com ID ${userId} não encontrado no Firebase Auth, mas a exclusão prosseguirá no banco de dados local.`);
        } else {
            console.error(`Erro ao excluir usuário ${userId} do Firebase Auth:`, error);
            throw new Error(`Falha ao excluir usuário do Firebase Auth: ${error.message}`);
        }
    }

    // Deleta do banco de dados local
    await _deleteUser(userId);

    // Loga o evento de auditoria
    if (adminUser && userToDelete) {
        await logAuditEvent({
            action: 'USER_DELETED',
            entityType: 'User',
            entityId: userId,
            details: { email: userToDelete.email, displayName: userToDelete.displayName }
        });
    }
}
