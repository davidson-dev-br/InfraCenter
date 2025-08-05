
'use server';

import { revalidatePath } from 'next/cache';
import { _getUsers, _getUserByEmail, _updateUserInDb, User, _deleteUser, _ensureDatabaseSchema, _getUserById } from "./user-service";
import { logAuditEvent } from './audit-actions';
import { headers } from 'next/headers';
import { manageUserInAuth } from '@/ai/flows/user-management';

async function getAdminUser() {
    // Esta função simula a obtenção do usuário administrador que está executando a ação.
    // Em um cenário real, você obteria isso da sessão.
    // Por enquanto, usaremos um placeholder ou buscaremos com base em um token se disponível.
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


export async function updateUser(userData: Partial<User> & { password?: string }): Promise<User> {
    const adminUser = await getAdminUser();
    
    // 1. Determina a ação: criar ou atualizar
    const isCreating = !userData.id;

    try {
        // 2. Chama o fluxo Genkit para lidar com o Firebase Auth
        // O fluxo retorna o registro do usuário do Auth, incluindo o UID para novos usuários.
        const authUserRecord = await manageUserInAuth({
            action: isCreating ? 'create' : 'update',
            uid: userData.id,
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
        });

        if (!authUserRecord || !authUserRecord.uid) {
            throw new Error("Falha ao processar o usuário no serviço de autenticação.");
        }

        // 3. Prepara os dados para salvar no nosso banco de dados
        const dbData = {
            ...userData,
            id: authUserRecord.uid, // Garante que estamos usando o UID do Firebase como ID
            email: authUserRecord.email, // Usa o email retornado pelo Auth
            displayName: authUserRecord.displayName, // Usa o nome retornado pelo Auth
        };
        
        // 4. Salva no banco de dados local (SQL)
        const savedUser = await _updateUserInDb(dbData);
        
        // 5. Log de auditoria
        if (adminUser) {
            await logAuditEvent({
                action: isCreating ? 'USER_CREATED' : 'USER_UPDATED',
                entityType: 'User',
                entityId: savedUser.id,
                details: { data: dbData }
            });
        }
        
        revalidatePath('/users');
        return savedUser;

    } catch (error: any) {
        console.error(`Falha na operação de ${isCreating ? 'criação' : 'atualização'} do usuário:`, error);
        // A mensagem de erro agora virá diretamente do fluxo Genkit ou do DB.
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
        // 1. Deleta do nosso banco de dados primeiro
        await _deleteUser(userToDelete.id);

        // 2. Chama o fluxo Genkit para deletar do Firebase Auth
        await manageUserInAuth({ action: 'delete', uid: userId });

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
    }
}
