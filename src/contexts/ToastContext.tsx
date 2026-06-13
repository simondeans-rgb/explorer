import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, Check, Info } from 'lucide-react';
import { cn } from '../lib/cn';
import { ToastContext, type ToastKind } from './toast';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}
interface Celebration {
  id: number;
  emoji: string;
  title: string;
  subtitle?: string;
}

const KIND_STYLE: Record<ToastKind, { cls: string; Icon: typeof Check }> = {
  success: { cls: 'bg-[#179B86] text-white', Icon: Check },
  error: { cls: 'bg-[#E0457B] text-white', Icon: AlertCircle },
  info: { cls: 'bg-passport-navy text-white dark:bg-white dark:text-passport-navy', Icon: Info },
};

// A few confetti pieces fired behind the celebration card.
const CONFETTI = Array.from({ length: 16 }, (_, i) => i);
const CONFETTI_COLORS = ['#FF6B9A', '#9B7CFF', '#24D1C3', '#FFB84D', '#FF7A66'];

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((t: { kind: ToastKind; message: string }) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, ...t }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      3500,
    );
  }, []);

  const celebrate = useCallback(
    (c: { emoji: string; title: string; subtitle?: string }) => {
      const id = ++idRef.current;
      setCelebrations((prev) => [...prev, { id, ...c }]);
    },
    [],
  );

  const current = celebrations[0];
  const dismiss = useCallback(
    (id: number) => setCelebrations((prev) => prev.filter((c) => c.id !== id)),
    [],
  );

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => dismiss(current.id), 3600);
    return () => window.clearTimeout(t);
  }, [current, dismiss]);

  return (
    <ToastContext.Provider value={{ toast, celebrate }}>
      {children}

      {/* Toast stack */}
      <div className="fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => {
          const { cls, Icon } = KIND_STYLE[t.kind];
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 shadow-float text-sm font-semibold animate-rise-in max-w-[90vw]',
                cls,
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* Celebration overlay */}
      {current && (
        <button
          type="button"
          onClick={() => dismiss(current.id)}
          aria-label="Dismiss"
          className="fixed inset-0 z-[80] grid place-items-center bg-black/45 backdrop-blur-sm animate-fade-in px-8"
        >
          {/* confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI.map((i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${(i * 6.25 + 4) % 100}%`,
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  animationDelay: `${(i % 6) * 90}ms`,
                  borderRadius: i % 2 ? '50%' : '2px',
                }}
              />
            ))}
          </div>

          <div className="relative w-full max-w-xs rounded-3xl bg-brand-gradient text-white text-center px-6 py-8 shadow-float animate-scale-in">
            <div className="mx-auto mb-3 h-20 w-20 rounded-3xl bg-white/20 ring-2 ring-white/35 grid place-items-center text-5xl shadow-card">
              <span aria-hidden="true">{current.emoji}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Achievement
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="mt-1 text-sm text-white/85">{current.subtitle}</p>
            )}
            <p className="mt-4 text-[11px] font-medium text-white/70">
              Tap to dismiss
            </p>
          </div>
        </button>
      )}
    </ToastContext.Provider>
  );
}
