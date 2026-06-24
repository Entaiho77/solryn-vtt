/**
 * Firebase web config, read from Vite env (`.env.local`, see `.env.example`).
 * These client values are safe to ship in the bundle; security lives in Realtime Database
 * rules. If config is absent (and the emulator isn't requested), the app still renders —
 * `firebaseConfigured` is false and auth/db calls surface a clear "not configured" error
 * instead of crashing.
 */
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const useEmulator = env.VITE_USE_FIREBASE_EMULATOR === 'true';

/** True when we have enough config to initialize Firebase (real project or emulator). */
export const firebaseConfigured = Boolean(firebaseConfig.apiKey) || useEmulator;

// Emulator fallbacks so initialization succeeds without a real project.
export const EMULATOR_PROJECT_ID = firebaseConfig.projectId || 'demo-solryn';
export const EMULATOR_DATABASE_URL =
  firebaseConfig.databaseURL || `http://127.0.0.1:9000?ns=${EMULATOR_PROJECT_ID}`;

export const EMULATOR_HOSTS = {
  auth: 'http://127.0.0.1:9099',
  database: { host: '127.0.0.1', port: 9000 },
};
