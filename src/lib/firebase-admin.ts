import * as admin from 'firebase-admin';
import 'server-only';

// Variável para armazenar a instância do app inicializado e evitar múltiplas inicializações.
let app: admin.app.App | null = null;

/**
 * Inicializa o Firebase Admin SDK se ainda não tiver sido inicializado.
 * Esta função é projetada para ser chamada de forma "preguiçosa" (lazy),
 * apenas quando o serviço for realmente necessário.
 * @returns A instância do app Firebase Admin inicializado.
 */
function initializeFirebaseAdmin() {
    // Se o app já foi inicializado, retorna a instância existente.
    if (app) {
        return app;
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // A chave privada no .env tem quebras de linha como '\\n', precisamos converter para '\n'.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Verificação explícita para garantir que todas as credenciais foram carregadas do .env
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Credenciais de serviço do Firebase Admin estão ausentes ou incompletas. Verifique seu arquivo .env.local na raiz do projeto.");
    }

    try {
        // Inicializa o app com as credenciais de serviço.
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK inicializado com sucesso.");
        return app;
    } catch (error: any) {
        // Se a inicialização falhar mesmo com as credenciais presentes, lança um erro detalhado.
        throw new Error(`Falha crítica ao inicializar o Firebase Admin SDK: ${error.message}`);
    }
}

/**
 * Ponto de entrada para obter o serviço de autenticação do Firebase Admin.
 * Garante que o SDK esteja inicializado antes de retornar o serviço de autenticação.
 * @returns O serviço de autenticação do Firebase Admin.
 */
export function getFirebaseAuth() {
    // Garante que a inicialização ocorra antes de tentar obter o serviço de auth.
    const firebaseApp = initializeFirebaseAdmin();
    return admin.auth(firebaseApp);
}
