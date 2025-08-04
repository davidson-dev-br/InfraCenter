
'use server';

import { getFirebaseAuth } from '@/lib/firebase-admin';

interface TestResult {
    success: boolean;
    message: string;
    details?: string;
}

/**
 * Server Action para testar a inicialização do Firebase Admin SDK.
 * Tenta obter a instância de autenticação e retorna um resultado de sucesso ou falha.
 */
export async function testFirebaseAdminInit(): Promise<TestResult> {
    try {
        console.log("Tentando inicializar o Firebase Admin SDK...");
        const auth = getFirebaseAuth();
        console.log("getFirebaseAuth() chamado com sucesso.");

        // Para realmente testar a conexão, tentamos uma operação simples de leitura.
        // Tentar buscar um usuário inexistente é uma forma segura de verificar.
        await auth.getUserByEmail('test-sdk-init@example.com').catch(error => {
            // Ignoramos o erro "user-not-found", pois isso significa que a API funcionou.
            if (error.code !== 'auth/user-not-found') {
                throw error; // Lança outros erros (ex: permissão negada)
            }
        });
        
        console.log("Operação de teste com o SDK concluída com sucesso.");

        return { 
            success: true, 
            message: "Firebase Admin SDK inicializado e funcionando corretamente.",
            details: "A conexão com os serviços do Firebase foi estabelecida e uma operação de teste foi executada com sucesso."
        };

    } catch (error: any) {
        console.error("FALHA na inicialização do Firebase Admin SDK:", error);
        return { 
            success: false, 
            message: "Erro ao inicializar ou usar o Firebase Admin SDK.",
            details: error.stack || error.message || "Erro desconhecido."
        };
    }
}
