/* Inicialização do Firebase (API compat do SDK 11) com configuração vinda do ambiente do Vite */
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);

if (isFirebaseConfigured && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = isFirebaseConfigured ? firebase.auth() : (null as unknown as firebase.auth.Auth);
export const database = isFirebaseConfigured ? firebase.database() : (null as unknown as firebase.database.Database);
export { firebase };
/* Fim de firebase.ts */
