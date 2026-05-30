import { useState, type FormEvent } from 'react';
import { ArrowRight, Compass, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/cn';

type Mode = 'signin' | 'signup';

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return "That doesn't look like a valid email.";
    case 'auth/missing-password':
    case 'auth/weak-password':
      return 'Password needs to be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'A Member already exists for that email — try signing in.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/network-request-failed':
      return 'Network issue — check your connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in isn’t enabled for this project yet.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup — allow popups and retry.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function SignInPage() {
  const { signIn, signUp, signInWithGoogle, signInDemo, configured } =
    useAuth();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? 'auth/unknown';
      // The user dismissing the popup isn't an error worth shouting about.
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(friendlyError(code));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? 'auth/unknown';
      setError(friendlyError(code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="passport-bg fixed inset-0 flex flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 text-passport-navy dark:text-passport-goldsoft">
          <Compass size={18} />
          <span className="font-display font-semibold tracking-tight">
            Explorer&rsquo;s Passport
          </span>
        </div>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-sm animate-fade-in">
          <p className="text-center text-[11px] uppercase tracking-[0.32em] text-passport-gold mb-3">
            The Society of Discovery
          </p>
          <h1 className="font-display text-4xl text-center mb-2 text-passport-navy dark:text-white/90">
            {mode === 'signin' ? 'Welcome back, Member.' : 'Begin your archive.'}
          </h1>
          <p className="text-center text-sm text-black/55 dark:text-white/55 mb-8">
            {mode === 'signin'
              ? 'Sign in to open your lifelong travel archive.'
              : 'Create a Membership and receive your Explorer’s Passport.'}
          </p>

          {!configured && (
            <div className="mb-5">
              <button
                type="button"
                onClick={signInDemo}
                className={cn(
                  'group w-full px-4 py-3 rounded-xl font-medium transition-all',
                  'inline-flex items-center justify-center gap-2',
                  'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink',
                  'hover:opacity-90 active:scale-[0.99]',
                )}
              >
                Explore the demo
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <p className="mt-2 text-center text-xs text-black/45 dark:text-white/45">
                A sample Passport, stored only on this device — no account
                needed. Add your Firebase keys in <code>.env.local</code> for
                real cross-device sync.
              </p>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/35 dark:text-white/35">
                <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                or
                <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          )}

          {configured && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className={cn(
                  'w-full px-4 py-3 rounded-xl font-medium transition-all',
                  'inline-flex items-center justify-center gap-2.5',
                  'bg-white text-passport-ink border border-black/10',
                  'hover:bg-black/[0.03] active:scale-[0.99] disabled:opacity-50',
                )}
              >
                <GoogleMark />
                Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/35 dark:text-white/35">
                <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                or
                <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl outline-none transition-colors',
                'bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10',
                'focus:border-passport-gold/70 dark:focus:border-passport-gold/70',
                'text-black/85 dark:text-white/90 placeholder:text-black/40 dark:placeholder:text-white/40',
              )}
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl outline-none transition-colors',
                'bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10',
                'focus:border-passport-gold/70 dark:focus:border-passport-gold/70',
                'text-black/85 dark:text-white/90 placeholder:text-black/40 dark:placeholder:text-white/40',
              )}
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy || !configured}
              className={cn(
                'w-full px-4 py-3 rounded-xl font-medium transition-all',
                'bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink',
                'hover:opacity-90 active:scale-[0.99]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {busy
                ? 'Working…'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Become a Member'}
            </button>
          </form>

          <p className="text-center text-sm text-black/55 dark:text-white/55 mt-6">
            {mode === 'signin' ? 'Not yet a Member?' : 'Already a Member?'}{' '}
            <button
              type="button"
              onClick={() =>
                setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
              }
              className="font-medium text-passport-navy dark:text-passport-goldsoft hover:underline"
            >
              {mode === 'signin' ? 'Join the Society' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
