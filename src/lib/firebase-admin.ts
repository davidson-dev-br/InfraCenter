
import * as admin from 'firebase-admin';
import 'server-only';

/**
 * Inicializa o Firebase Admin SDK de forma segura, garantindo que as credenciais
 * sejam carregadas antes do uso. Esta função é o ponto central para interagir
 * com os serviços de admin do Firebase.
 * 
 * @returns A instância do app Firebase Admin inicializado.
 */
function initializeFirebaseAdmin() {
    // A biblioteca firebase-admin já gerencia a inicialização única.
    // Se já houver apps inicializados, retornamos o primeiro (padrão) para evitar erros.
    if (admin.apps.length > 0) {
        return admin.app();
    }

    // Monta o objeto de credenciais a partir das variáveis de ambiente.
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // A chave privada no .env pode vir com literais '\\n'. Substituímos por quebras de linha reais.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Verificação explícita para garantir que todas as credenciais foram carregadas do .env.
    // Se alguma estiver faltando, lança um erro claro e informativo.
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Credenciais de serviço do Firebase Admin estão ausentes ou incompletas no arquivo .env. Verifique se as variáveis FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL e NEXT_PUBLIC_FIREBASE_PROJECT_ID estão definidas.");
    }

    try {
        // Inicializa o app com as credenciais de serviço.
        console.log("Tentando inicializar o Firebase Admin SDK...");
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK inicializado com sucesso.");
        return app;
    } catch (error: any) {
        // Se a inicialização falhar mesmo com as credenciais presentes, lança um erro detalhado.
        console.error("FALHA CRÍTICA na inicialização do Firebase Admin:", error.message);
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
