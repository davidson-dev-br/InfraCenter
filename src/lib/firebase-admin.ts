
'use server';

import * as admin from 'firebase-admin';

// Esta função agora é o único ponto de entrada para acessar o SDK Admin.
// Ela encapsula a lógica de inicialização para garantir que o SDK
// seja inicializado apenas uma vez.

/**
 * Retorna a instância de autenticação do Firebase Admin SDK,
 * inicializando o app se necessário.
 */
export async function getFirebaseAuth() {
    if (admin.apps.length === 0) {
        console.log("Inicializando Firebase Admin SDK...");
        try {
            // As credenciais são recuperadas de variáveis de ambiente seguras no servidor.
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!serviceAccountString) {
                // Se a variável não estiver definida, simplesmente não inicialize.
                // Isso permite que o app funcione sem o SDK Admin em ambientes onde ele não é necessário.
                console.warn("FIREBASE_SERVICE_ACCOUNT não está definida. O Firebase Admin SDK não será inicializado.");
                return null;
            }
            const serviceAccount = JSON.parse(serviceAccountString);
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
             console.log("Firebase Admin SDK inicializado com sucesso.");
        } catch(error: any) {
            console.error("Falha ao inicializar o Firebase Admin SDK:", error.message);
            // Retorna null para não quebrar a aplicação.
            return null;
        }
    }
    // Retorna a instância de auth se o app foi inicializado, senão null.
    return admin.apps.length > 0 ? admin.auth() : null;
}
