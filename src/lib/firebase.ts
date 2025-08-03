
import { initializeApp, getApps, getApp } from "firebase/app";

// Your web app's Firebase configuration
// This configuration is now hardcoded as provided from the Firebase console
// to ensure it matches the linked hosting project.
const firebaseConfig = {
  apiKey: "AIzaSyDqbq-lRz-uU9vh3-lH21_6c4n-7gjAaT4",
  authDomain: "infravision-vjb5j.firebaseapp.com",
  projectId: "infravision-vjb5j",
  storageBucket: "infravision-vjb5j.appspot.com",
  messagingSenderId: "755095501327",
  appId: "1:755095501327:web:b93a7ec480649cef87817a"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
