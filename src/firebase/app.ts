import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getDatabase,
  connectDatabaseEmulator,
  type Database,
} from 'firebase/database';
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from 'firebase/storage';
import {
  firebaseConfig,
  firebaseConfigured,
  useEmulator,
  EMULATOR_PROJECT_ID,
  EMULATOR_DATABASE_URL,
  EMULATOR_STORAGE_BUCKET,
  EMULATOR_HOSTS,
} from './config';

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Database | undefined;
let storageInstance: FirebaseStorage | undefined;

if (firebaseConfigured) {
  app = initializeApp(
    useEmulator
      ? {
          ...firebaseConfig,
          apiKey: firebaseConfig.apiKey || 'demo-key',
          projectId: EMULATOR_PROJECT_ID,
          databaseURL: EMULATOR_DATABASE_URL,
          storageBucket: EMULATOR_STORAGE_BUCKET,
        }
      : firebaseConfig,
  );
  authInstance = getAuth(app);
  dbInstance = getDatabase(app);
  storageInstance = getStorage(app);

  if (useEmulator) {
    connectAuthEmulator(authInstance, EMULATOR_HOSTS.auth, {
      disableWarnings: true,
    });
    connectDatabaseEmulator(
      dbInstance,
      EMULATOR_HOSTS.database.host,
      EMULATOR_HOSTS.database.port,
    );
    connectStorageEmulator(
      storageInstance,
      EMULATOR_HOSTS.storage.host,
      EMULATOR_HOSTS.storage.port,
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

export function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) throw new Error(NOT_CONFIGURED);
  return storageInstance;
}
