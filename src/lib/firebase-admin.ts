
'use server';

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

    const serviceAccount = {
      projectId: firebaseConfig.projectId,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    
    if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
      console.error('Credenciais de serviço do Firebase (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) não encontradas no ambiente.');
      throw new Error('As credenciais de serviço do Firebase estão ausentes. Verifique suas variáveis de ambiente.');
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: firebaseConfig.storageBucket,
    });
}

// Inicializa imediatamente ao carregar o módulo
initializeFirebaseAdmin();

// Exporta uma função que retorna a instância de autenticação do app já inicializado.
export function getFirebaseAuth() {
    return admin.auth();
}
