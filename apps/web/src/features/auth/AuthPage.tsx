import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { TextField, PasswordField } from '../../components/ui/TextField';
import styles from './AuthPage.module.css';

type Mode = 'signin' | 'signup';

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists. Try signing in.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return (e as Error)?.message ?? 'Something went wrong. Please try again.';
  }
}

export function AuthPage() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (isSignup && !displayName.trim()) {
      setError('Please choose a display name.');
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        await auth.signUp(email.trim(), password, displayName);
      } else {
        await auth.signIn(email.trim(), password);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setBusy(true);
    try {
      await auth.signInWithGoogle();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Left: brand / pitch */}
      <aside className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo} aria-hidden="true">
            ✶
          </div>
          <h1 className={styles.brandTitle}>Solryn VTT</h1>
          <p className={styles.brandPitch}>
            A system-agnostic virtual tabletop. Run any game — Solryn is the first
            it speaks, with auto-hit combat, Luck &amp; Arcana, and classless growth.
          </p>
          <ul className={styles.brandPoints}>
            <li>Guided character creation that teaches as you build.</li>
            <li>Live shared board with fog, tokens, and initiative.</li>
            <li>Every rule is data — so any system can run on the same engine.</li>
          </ul>
        </div>
      </aside>

      {/* Right: form */}
      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          <h2 className={styles.formTitle}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className={styles.formSub}>
            {isSignup
              ? 'Join a game or run your own.'
              : 'Sign in to your games.'}
          </p>

          {!auth.configured && (
            <div className={styles.notice}>
              Firebase isn’t configured yet. Copy <code>.env.example</code> to{' '}
              <code>.env.local</code> and add your project keys (or set{' '}
              <code>VITE_USE_FIREBASE_EMULATOR=true</code>) to enable sign-in.
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {isSignup && (
              <TextField
                label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Shown in the lobby and on the board"
                autoComplete="nickname"
              />
            )}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />

            {error && <div className={styles.error}>{error}</div>}

            <Button type="submit" full disabled={busy}>
              {busy
                ? 'Please wait…'
                : isSignup
                  ? 'Create account'
                  : 'Sign in'}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <Button
            variant="secondary"
            full
            onClick={handleGoogle}
            disabled={busy}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <p className={styles.toggle}>
            {isSignup ? 'Already have an account?' : 'New to Solryn VTT?'}{' '}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => {
                setMode(isSignup ? 'signin' : 'signup');
                setError('');
              }}
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-17z" />
      <path fill="#FBBC05" d="M10.4 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.7-3.7-13.6-9.1l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
