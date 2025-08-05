import * as admin from 'firebase-admin';
import 'server-only';
import { getServiceAccount } from './firebase-credentials';

/**
 * Ponto de entrada para obter o serviço de autenticação do Firebase Admin.
 * Garante que o SDK esteja inicializado antes de retornar o serviço de autenticação.
 * Esta função é agora o único ponto de inicialização e acesso.
 * @returns O serviço de autenticação do Firebase Admin.
 */
export function getFirebaseAuth() {
    // Se o app já foi inicializado, apenas retorne a instância de auth existente.
    if (admin.apps.length > 0 && admin.apps[0]) {
        return admin.auth(admin.apps[0]);
    }
    
    try {
        console.log("Tentando inicializar o Firebase Admin SDK com objeto de credenciais...");
        
        // Agora chamamos a função para obter as credenciais.
        const serviceAccount = getServiceAccount();

        // Inicializa o app com as credenciais importadas diretamente.
        const app = admin.initializeApp({
            // O tipo de 'serviceAccount' precisa ser convertido para ServiceAccount
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        
        console.log("Firebase Admin SDK inicializado com sucesso.");
        // Retorna o serviço de autenticação do app recém-criado.
        return admin.auth(app);

    } catch (error: any) {
        console.error("FALHA CRÍTICA na inicialização do Firebase Admin:", error.stack);
        throw new Error(`Falha crítica ao inicializar o Firebase Admin SDK: ${error.message}`);
    }
}
