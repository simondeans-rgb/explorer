import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SignInPage } from './components/auth/SignInPage';
import { Board } from './components/Board';

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
  return <Board />;
}

function Splash() {
  return (
    <div className="canvas-bg fixed inset-0 flex items-center justify-center">
      <p className="font-hand text-3xl text-black/50 dark:text-white/55 animate-fade-in">
        Stickies…
      </p>
    </div>
  );
}
