
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

const hasLocalCredentials = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;

async function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return;
    }

    try {
        if (hasLocalCredentials) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: firebaseConfig.projectId,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
                databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            });
        } else {
            admin.initializeApp({
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket
            });
        }
        console.log("Firebase Admin SDK inicializado com sucesso.");
    } catch (error) {
        console.error("Erro CRÍTICO ao inicializar o Firebase Admin:", error);
    }
}

// Em vez de exportar 'auth' diretamente, exportamos uma função que garante a inicialização.
export async function getFirebaseAuth() {
    await initializeFirebaseAdmin();
    return admin.auth();
}
