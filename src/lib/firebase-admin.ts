
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Força o carregamento das variáveis de ambiente do arquivo .env
config();

// Variável para armazenar a instância do app inicializado.
let app: admin.app.App | null = null;

function initializeFirebaseAdmin() {
    // Se o aplicativo já estiver inicializado, retorne-o.
    if (admin.apps.length > 0 && admin.apps[0]) {
        app = admin.apps[0];
        return app;
    }
    
    // As credenciais agora são lidas automaticamente do arquivo .env.
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // O Firebase armazena a chave privada com "\\n" para quebras de linha.
        // Precisamos substituir isso por quebras de linha reais ("\n").
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    // Verifica se todas as credenciais necessárias estão presentes.
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.error("Credenciais de serviço do Firebase estão ausentes. Verifique suas variáveis de ambiente no arquivo .env");
        return null;
    }

    // Inicializa o app com as credenciais de serviço.
    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    return app;
}

// Exporta uma função que garante a inicialização e retorna a instância de autenticação.
// Este é o único ponto de entrada para acessar o serviço de admin.
export function getFirebaseAuth() {
    // Se o app não foi inicializado ainda, inicializa agora (Lazy Initialization).
    if (!app) {
        initializeFirebaseAdmin();
    }
    
    // Se, mesmo após a tentativa, a inicialização falhou (ex: credenciais faltando),
    // lançamos um erro claro.
    if (!app) {
        throw new Error("A inicialização do Firebase Admin falhou. Verifique as credenciais de serviço do projeto.");
    }
    
    return admin.auth(app);
}
