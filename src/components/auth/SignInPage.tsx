import { useState, type FormEvent } from 'react';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/cn';
import { WorldlyMark } from '../Brand';

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
      return 'An account already exists for that email — try signing in.';
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

const inputCls = cn(
  'w-full px-4 py-3.5 rounded-2xl outline-none transition-all',
  'bg-passport-cartridge dark:bg-white/5 border border-transparent',
  'focus:border-passport-gold/60 focus:bg-white dark:focus:bg-white/[0.08]',
  'text-passport-ink dark:text-white/90 placeholder:text-passport-ink3',
);

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
      if (
        code !== 'auth/popup-closed-by-user' &&
        code !== 'auth/cancelled-popup-request'
      ) {
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
    <div className="fixed inset-0 flex flex-col bg-passport-cartridge dark:bg-passport-night overflow-y-auto no-scrollbar">
      {/* Hero */}
      <div className="relative shrink-0 overflow-hidden bg-brand-gradient px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-16 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 8%), radial-gradient(circle at 80% 30%, white 0, transparent 6%), radial-gradient(circle at 60% 80%, white 0, transparent 7%)',
            backgroundSize: '120px 120px',
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <WorldlyMark size={34} />
            <span className="font-display text-2xl font-semibold">Worldly</span>
          </div>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggle}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="relative mt-12 max-w-md animate-rise-in">
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold">
            {mode === 'signin'
              ? 'Welcome back.'
              : 'Your world, beautifully kept.'}
          </h1>
          <p className="mt-3 text-white/85 text-[15px] leading-relaxed max-w-sm">
            {mode === 'signin'
              ? 'Open your personal travel archive — every place, journey and discovery in one place.'
              : 'Collect the places you’ve been, the discoveries you’ve made, and the world still left to see.'}
          </p>
        </div>
      </div>

      {/* Auth card */}
      <main className="flex-1 px-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-sm mx-auto -mt-8 rounded-3xl bg-white dark:bg-passport-carddark shadow-float p-6 animate-rise-in">
          {!configured ? (
            <div>
              <button
                type="button"
                onClick={signInDemo}
                className="group w-full px-4 py-3.5 rounded-2xl font-semibold transition-all inline-flex items-center justify-center gap-2 bg-passport-navy text-white dark:bg-white dark:text-passport-navy hover:opacity-90 active:scale-[0.99]"
              >
                Explore the demo
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <p className="mt-3 text-center text-xs text-passport-ink3">
                A sample world, stored only on this device — no account needed.
              </p>
              <p className="mt-2 text-center text-xs text-passport-ink3">
                Account sign-in is unavailable here because Firebase isn’t
                configured. Set the <code>VITE_FIREBASE_*</code> environment
                variables and redeploy to sign in and sync across devices.
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full px-4 py-3.5 rounded-2xl font-semibold transition-all inline-flex items-center justify-center gap-2.5 bg-passport-cartridge dark:bg-white/5 text-passport-ink dark:text-white/90 hover:bg-passport-paged dark:hover:bg-white/10 active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleMark />
                Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-passport-ink3">
                <span className="h-px flex-1 bg-passport-navy/10 dark:bg-white/10" />
                or
                <span className="h-px flex-1 bg-passport-navy/10 dark:bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
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
                  className={inputCls}
                />

                {error && (
                  <p className="text-sm text-passport-burgundy dark:text-passport-expedition">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full px-4 py-3.5 rounded-2xl font-semibold transition-all bg-brand-gradient text-white shadow-card hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy
                    ? 'Working…'
                    : mode === 'signin'
                      ? 'Sign in'
                      : 'Create your account'}
                </button>
              </form>

              <p className="text-center text-sm text-passport-ink3 mt-6">
                {mode === 'signin' ? 'New to Worldly?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() =>
                    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
                  }
                  className="font-semibold text-passport-gold hover:underline"
                >
                  {mode === 'signin' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
