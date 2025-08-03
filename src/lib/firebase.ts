import { initializeApp, getApps, getApp } from "firebase/app";

// Esta configuração agora lê das variáveis de ambiente com prefixo NEXT_PUBLIC_,
// que são seguras para serem expostas no lado do cliente e carregadas pelo Next.js
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verifica se todas as variáveis de configuração do cliente estão presentes.
// Isso ajuda a diagnosticar problemas de ambiente rapidamente.
if (Object.values(firebaseConfig).some(value => !value)) {
    console.error("Firebase client configuration is missing or incomplete. Check your .env.local file for NEXT_PUBLIC_FIREBASE_* variables.");
}

// Inicializa o Firebase, garantindo que não seja inicializado mais de uma vez.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
