
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// ====================================================================
//  Definição de Tipos e Schemas para o Flow
// ====================================================================

const ManageUserInputSchema = z.object({
    action: z.enum(['create', 'update', 'delete']),
    uid: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    password: z.string().min(6).optional().nullable(),
    displayName: z.string().optional().nullable(),
});

type ManageUserInput = z.infer<typeof ManageUserInputSchema>;

const UserRecordSchema = z.object({
    uid: z.string(),
    email: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
});

type UserRecordOutput = z.infer<typeof UserRecordSchema>;

// ====================================================================
//  Inicialização Segura e Isolada do Firebase Admin
// ====================================================================

function initializeFirebaseAdmin() {
    // Se o app já foi inicializado, retorna a instância existente para evitar erros.
    if (admin.apps.length > 0 && admin.apps[0]) {
        return admin.apps[0];
    }

    // As credenciais são recuperadas de variáveis de ambiente seguras no servidor.
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountString) {
        throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT não está definida.');
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch(error: any) {
        console.error("Falha ao analisar as credenciais do Firebase. Verifique a variável de ambiente.", error);
        throw new Error("As credenciais do Firebase fornecidas são inválidas.");
    }
}

// ====================================================================
//  Lógica do Flow (O Intermediário)
// ====================================================================

const manageUserFlow = ai.defineFlow(
  {
    name: 'manageUserFlow',
    inputSchema: ManageUserInputSchema,
    outputSchema: UserRecordSchema.nullable(), // Pode retornar nulo para ação de delete
  },
  async (input) => {
    
    initializeFirebaseAdmin();
    const auth = admin.auth();

    const { action, uid, email, password, displayName } = input;

    try {
        switch (action) {
            case 'create':
                if (!email || !password) {
                    throw new Error("Email e senha são obrigatórios para criar um usuário.");
                }
                const newUser = await auth.createUser({
                    email,
                    password,
                    displayName,
                });
                return { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };

            case 'update':
                if (!uid) {
                    throw new Error("UID é obrigatório para atualizar um usuário.");
                }
                const updatePayload: any = {};
                if (displayName) updatePayload.displayName = displayName;
                if (email) updatePayload.email = email;
                if (password) updatePayload.password = password;

                const updatedUser = await auth.updateUser(uid, updatePayload);
                return { uid: updatedUser.uid, email: updatedUser.email, displayName: updatedUser.displayName };

            case 'delete':
                if (!uid) {
                    throw new Error("UID é obrigatório para deletar um usuário.");
                }
                await auth.deleteUser(uid);
                return null; // Ação de delete não retorna um usuário.

            default:
                throw new Error("Ação inválida.");
        }
    } catch(error: any) {
        console.error(`Erro ao executar ação '${action}' no Firebase Auth:`, error);
        // Retorna uma mensagem de erro mais amigável para a UI
        throw new Error(error.message || `Falha ao ${action} usuário.`);
    }
  }
);


// ====================================================================
//  Função de Exportação (Wrapper)
// ====================================================================

/**
 * Ponto de entrada para gerenciar usuários no Firebase Authentication.
 * Esta é a função que será chamada pelas server actions.
 * @param {ManageUserInput} input - Os dados para a operação.
 * @returns {Promise<UserRecordOutput | null>} O registro do usuário ou nulo.
 */
export async function manageUserInAuth(input: ManageUserInput): Promise<UserRecordOutput | null> {
  return manageUserFlow(input);
}
