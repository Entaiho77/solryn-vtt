import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getDatabase,
  connectDatabaseEmulator,
  type Database,
} from 'firebase/database';
import {
  firebaseConfig,
  firebaseConfigured,
  useEmulator,
  EMULATOR_PROJECT_ID,
  EMULATOR_DATABASE_URL,
  EMULATOR_HOSTS,
} from './config';

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Database | undefined;

if (firebaseConfigured) {
  app = initializeApp(
    useEmulator
      ? {
          ...firebaseConfig,
          apiKey: firebaseConfig.apiKey || 'demo-key',
          projectId: EMULATOR_PROJECT_ID,
          databaseURL: EMULATOR_DATABASE_URL,
        }
      : firebaseConfig,
  );
  authInstance = getAuth(app);
  dbInstance = getDatabase(app);

  if (useEmulator) {
    connectAuthEmulator(authInstance, EMULATOR_HOSTS.auth, {
      disableWarnings: true,
    });
    connectDatabaseEmulator(
      dbInstance,
      EMULATOR_HOSTS.database.host,
      EMULATOR_HOSTS.database.port,
    );
  }
}

export { firebaseConfigured };

const NOT_CONFIGURED =
  'Firebase is not configured. Copy .env.example to .env.local and fill in your project values (or set VITE_USE_FIREBASE_EMULATOR=true).';

export function getAuthInstance(): Auth {
  if (!authInstance) throw new Error(NOT_CONFIGURED);
  return authInstance;
}

export function getDb(): Database {
  if (!dbInstance) throw new Error(NOT_CONFIGURED);
  return dbInstance;
}
