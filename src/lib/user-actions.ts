
'use server';

import { revalidatePath } from 'next/cache';
import { _getUsers, _getUserByEmail, _updateUserInDb, User, _deleteUser, _ensureDatabaseSchema, _getUserById } from "./user-service";
import { logAuditEvent } from './audit-actions';

async function getAdminUser() {
    // Esta função simula a obtenção do usuário administrador que está executando a ação.
    // Em um cenário real, você obteria isso da sessão.
    return { id: 'admin_user', displayName: 'Admin' };
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

export async function getUserById(id: string): Promise<User | null> {
    if (!id) return null;
    return _getUserById(id);
}


export async function updateUser(userData: Partial<User>): Promise<User> {
    const adminUser = await getAdminUser();
    
    // A verificação de existência agora é baseada no e-mail para lidar com a vinculação de contas.
    const isCreating = !(await _getUserByEmail(userData.email!));

    try {
        const savedUser = await _updateUserInDb(userData as User);
        
        if (adminUser) {
            await logAuditEvent({
                action: isCreating ? 'USER_CREATED' : 'USER_UPDATED',
                entityType: 'User',
                entityId: savedUser.id,
                details: { data: userData }
            });
        }
        
        revalidatePath('/users');
        return savedUser;

    } catch (error: any) {
        console.error(`Falha na operação de ${isCreating ? 'criação' : 'atualização'} do usuário:`, error);
        throw new Error(error.message);
    }
}


export async function deleteUser(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("O ID do usuário é obrigatório para a exclusão.");
    }
    
    const adminUser = await getAdminUser();
    const userToDelete = await _getUserById(userId); 
    
    if (userToDelete) {
        await _deleteUser(userToDelete.id);

        if (adminUser) {
            await logAuditEvent({
                action: 'USER_DELETED',
                entityType: 'User',
                entityId: userId,
                details: { email: userToDelete.email, displayName: userToDelete.displayName }
            });
        }
        
        revalidatePath('/users');
    } else {
        console.warn(`Tentativa de exclusão de usuário não encontrado no banco de dados: ${userId}`);
        throw new Error('Usuário não encontrado no banco de dados para exclusão.');
    }
}
