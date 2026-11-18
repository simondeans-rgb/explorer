import { useState } from 'react';
import { useAuth } from '../store/auth';

export type AuthMode = 'in' | 'up';

/** Shared auth-form logic for the two presentations (AuthGate full-screen +
 *  AuthSheet bottom sheet) so validation, submit/forgot handling, error
 *  normalization and copy live in one place and can't drift (R22). Each screen
 *  keeps its own presentational JSX; this hook owns the behaviour. */
export function useAuthForm(onSuccess?: () => void) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Guideline 1.2: require agreement to the terms (incl. zero-tolerance for
  // objectionable content and abusive behaviour) before any sign-in path.
  function ensureAgreed(): boolean {
    if (!agreed) {
      setNotice(null);
      setError('Please agree to the Terms & zero-tolerance policy to continue.');
      return false;
    }
    return true;
  }

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Enter your email above, then tap “Forgot password”.');
      return;
    }
    try {
      await resetPassword(email);
      setNotice('Check your inbox — we’ve sent a password reset link.');
    } catch {
      setNotice('If that email has an account, a reset link is on its way.');
    }
  }

  async function submit() {
    setError(null);
    setNotice(null);
    if (mode === 'up' && !name.trim()) {
      setError('What should we call you? Add your name to continue.');
      return;
    }
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    if (!ensureAgreed()) return;
    setBusy(true);
    try {
      if (mode === 'in') await signIn(email, password);
      else await signUp(email, password, name);
      onSuccess?.();
      // On success the auth state changes; a full-screen gate unmounts itself.
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim());
      setBusy(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === 'in' ? 'up' : 'in'));
    setError(null);
    setNotice(null);
  }

  function resetFields() {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setNotice(null);
    setBusy(false);
  }

  return {
    mode, name, email, password, show, busy, error, notice, agreed,
    setName, setEmail, setPassword, setShow, setAgreed, setError, setBusy,
    ensureAgreed, forgot, submit, switchMode, resetFields,
  };
}
