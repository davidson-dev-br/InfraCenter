
import { config } from 'dotenv';
config();

import * as admin from 'firebase-admin';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Adiciona uma verificação para garantir que as variáveis de ambiente existam antes de inicializar.
const hasAdminConfig = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;

if (!admin.apps.length && hasAdminConfig) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: firebaseConfig.projectId,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
        });
    } catch (error) {
        console.error("Erro ao inicializar o Firebase Admin:", error);
    }
}


export const auth = admin.apps.length ? admin.auth() : null;
export const db = admin.apps.length ? admin.firestore() : null;
