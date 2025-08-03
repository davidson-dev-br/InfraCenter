
import { config } from 'dotenv';
config();

import * as admin from 'firebase-admin';

// Configuração do App Web do Firebase, usada como fallback se as credenciais de serviço não forem encontradas.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Em um ambiente do Google Cloud (como o App Hosting), as credenciais são detectadas automaticamente.
// Para desenvolvimento local, usamos as variáveis de ambiente.
const hasLocalCredentials = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;

// Só inicializamos o app se ele ainda não tiver sido inicializado.
if (!admin.apps.length) {
    try {
        if (hasLocalCredentials) {
            // Ambiente de Desenvolvimento Local: Usa as credenciais do .env
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: firebaseConfig.projectId,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
                databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            });
        } else {
            // Ambiente de Produção (Google Cloud): Usa as credenciais padrão do ambiente.
            admin.initializeApp({
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket
            });
        }
    } catch (error) {
        console.error("Erro CRÍTICO ao inicializar o Firebase Admin:", error);
    }
}


export const auth = admin.apps.length ? admin.auth() : null;
export const db = admin.apps.length ? admin.firestore() : null;
