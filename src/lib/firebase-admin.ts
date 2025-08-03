
import { config } from 'dotenv';
config();

import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
    // Se o aplicativo já estiver inicializado, retorne-o.
    if (admin.apps.length > 0) {
        return admin.app();
    }
    
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // O Firebase armazena a chave privada com "\\n" para quebras de linha.
        // Precisamos substituir isso por quebras de linha reais ("\n").
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    // Verifica se todas as credenciais necessárias estão presentes.
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.error("Credenciais de serviço do Firebase estão ausentes. Verifique suas variáveis de ambiente.");
        // Em vez de lançar um erro que quebra a aplicação, retornamos sem inicializar.
        // As funções que dependem do admin auth precisarão tratar o caso de falha.
        return null;
    }

    // Inicializa o app com as credenciais de serviço.
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// Inicializa imediatamente ao carregar o módulo
initializeFirebaseAdmin();

// Exporta uma função que retorna a instância de autenticação do app já inicializado.
// Lança um erro se a inicialização falhou, garantindo que o chamador saiba do problema.
export function getFirebaseAuth() {
    if (!admin.apps.length || !admin.app()) {
        throw new Error("A inicialização do Firebase Admin falhou. Verifique as credenciais de serviço do projeto.");
    }
    return admin.auth();
}
