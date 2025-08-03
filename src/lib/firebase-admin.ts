

import { config } from 'dotenv';
config();

import * as admin from 'firebase-admin';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    // Tenta usar as credenciais de serviço do ambiente (padrão em Cloud Functions, App Engine, etc.)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
        });
    }

    // Fallback para credenciais manuais (ambiente de desenvolvimento local)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
         return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: firebaseConfig.projectId,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
        });
    }

    // Último recurso: inicialização sem credenciais explícitas (pode funcionar em alguns ambientes)
    return admin.initializeApp({
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
    });
}

// Inicializa imediatamente ao carregar o módulo
initializeFirebaseAdmin();

// Exporta uma função que retorna a instância de autenticação do app já inicializado.
export function getFirebaseAuth() {
    return admin.auth();
}
