/* Inicialização do Firebase (API compat do SDK 11) com configuração vinda do ambiente do Vite; em teste, liga nos emuladores locais */
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

type EmulatorTargets = {
  auth: { useEmulator: (url: string, options?: { disableWarnings: boolean }) => void };
  database: { useEmulator: (host: string, port: number) => void };
};

/* Liga Auth e Realtime Database nos emuladores só quando VITE_FIREBASE_EMULATORS=true e o projeto é demo-* (nunca um projeto real) */
export function connectEmulators(targets: EmulatorTargets, flag: string | undefined, projectId: string | undefined): boolean {
  if (flag !== "true") return false;
  if (!projectId?.startsWith("demo-")) {
    throw new Error("VITE_FIREBASE_EMULATORS=true exige VITE_FIREBASE_PROJECT_ID começando com demo-.");
  }
  /* Sem a faixa de aviso do emulador no rodapé: ela fica fora dos landmarks e não é do app (o aviso segue no console) */
  targets.auth.useEmulator("http://127.0.0.1:9099", { disableWarnings: true });
  targets.database.useEmulator("127.0.0.1", 9000);
  return true;
}

if (isFirebaseConfigured && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = isFirebaseConfigured ? firebase.auth() : (null as unknown as firebase.auth.Auth);
export const database = isFirebaseConfigured ? firebase.database() : (null as unknown as firebase.database.Database);

if (isFirebaseConfigured) {
  connectEmulators({ auth, database }, env.VITE_FIREBASE_EMULATORS, firebaseConfig.projectId);
}

export { firebase };
/* Fim de firebase.ts */
