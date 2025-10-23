<<<<<<< HEAD
import { initializeApp, getApps, getApp } from "firebase/app";

// Esta configuração agora lê das variáveis de ambiente com prefixo NEXT_PUBLIC_,
// que são seguras para serem expostas no lado do cliente e carregadas pelo Next.js
=======
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
<<<<<<< HEAD
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
=======
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A simple boolean check for the existence of the essential keys.
export const isFirebaseConfigured = 
    !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Declare variables that will hold the Firebase services.
// They are exported but will be undefined if Firebase is not configured.
// This is safe because we check `isFirebaseConfigured` in the app.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Initialize Firebase only if the configuration is valid.
if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization error:", e);
  }
}

export { app, auth, db };
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
