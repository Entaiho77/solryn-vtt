import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { firebaseConfigured, getAuthInstance } from '../firebase/app';
import { readValue, updateValue } from '../data/realtime';
import type { UserProfile } from '@solryn/shared-types';

interface AuthContextValue {
  user: User | null;
  /** Best-effort display name (profile name, else the email prefix). */
  displayName: string;
  loading: boolean;
  /** False when Firebase env config is missing — UI shows a setup notice. */
  configured: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function nameFromUser(user: User | null): string {
  if (!user) return '';
  return user.displayName || user.email?.split('@')[0] || 'Adventurer';
}

/** Create or refresh the user's profile record (createdAt is set only once). */
async function upsertUserProfile(user: User): Promise<void> {
  const existingCreatedAt = await readValue<number>(`users/${user.uid}/createdAt`);
  const profile: Partial<UserProfile> = {
    uid: user.uid,
    displayName: nameFromUser(user),
    email: user.email,
    photoURL: user.photoURL,
    createdAt: existingCreatedAt ?? Date.now(),
  };
  await updateValue(`users/${user.uid}`, profile as Record<string, unknown>);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(getAuthInstance(), (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      displayName: nameFromUser(user),
      loading,
      configured: firebaseConfigured,

      async signUp(email, password, displayName) {
        const cred = await createUserWithEmailAndPassword(
          getAuthInstance(),
          email,
          password,
        );
        await updateProfile(cred.user, { displayName: displayName.trim() });
        await upsertUserProfile(cred.user);
        setUser(getAuthInstance().currentUser); // reflect the new displayName immediately
      },

      async signIn(email, password) {
        await signInWithEmailAndPassword(getAuthInstance(), email, password);
      },

      async signInWithGoogle() {
        const cred = await signInWithPopup(
          getAuthInstance(),
          new GoogleAuthProvider(),
        );
        await upsertUserProfile(cred.user);
      },

      async signOut() {
        await fbSignOut(getAuthInstance());
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
