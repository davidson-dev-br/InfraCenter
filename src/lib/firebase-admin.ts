
'use server';

import * as admin from 'firebase-admin';

// Esta função agora é o único ponto de entrada para acessar o SDK Admin.
// Ela encapsula a lógica de inicialização para garantir que o SDK
// seja inicializado apenas uma vez.

/**
 * Retorna a instância de autenticação do Firebase Admin SDK,
 * inicializando o app se necessário.
 */
export function getFirebaseAuth() {
    if (admin.apps.length === 0) {
        console.log("Inicializando Firebase Admin SDK...");
        try {
            // As credenciais são recuperadas de variáveis de ambiente seguras no servidor.
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!serviceAccountString) {
                throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT não está definida.');
            }
            const serviceAccount = JSON.parse(serviceAccountString);
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
             console.log("Firebase Admin SDK inicializado com sucesso.");
        } catch(error: any) {
            console.error("Falha crítica ao inicializar o Firebase Admin SDK:", error.message);
            // Lançar o erro é importante para que as chamadas falhem em vez de continuar com um SDK não funcional.
            throw new Error(`Falha crítica ao inicializar o Firebase Admin SDK: ${error.message}`);
        }
    }
    return admin.auth();
}
