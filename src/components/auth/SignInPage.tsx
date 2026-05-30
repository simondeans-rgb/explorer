import { useState, type FormEvent } from 'react';
import { Compass, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/cn';

type Mode = 'signin' | 'signup';

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
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function SignInPage() {
  const { signIn, signUp, configured } = useAuth();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-100/80 dark:bg-amber-300/15 text-amber-900 dark:text-amber-200 text-sm">
              Firebase isn&rsquo;t configured yet. Copy <code>.env.example</code>{' '}
              to <code>.env.local</code> and fill in your project values.
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
