import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { SignInPage } from './components/auth/SignInPage';
import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Shell() {
  const { user, loading, configured } = useAuth();

  if (loading && configured) return <Splash />;
  if (!user) return <SignInPage />;
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}

function Splash() {
  return (
    <div className="passport-bg fixed inset-0 flex items-center justify-center">
      <p className="font-display text-2xl text-passport-navy/60 dark:text-passport-goldsoft/60 animate-fade-in">
        Opening your Passport…
      </p>
    </div>
  );
}
