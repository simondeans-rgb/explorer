import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toast, type ToastItem } from '../../components/Toast';

interface ToastApi {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const noop = () => {};
const ToastContext = createContext<ToastApi>({ toast: { success: noop, error: noop, info: noop } });

let seq = 0;

/** A tiny transient-toast queue, mirroring the celebration provider. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const queue = useRef<ToastItem[]>([]);

  const showNext = useCallback(() => {
    setCurrent(queue.current.shift() ?? null);
  }, []);

  const push = useCallback((kind: ToastItem['kind'], message: string) => {
    queue.current.push({ id: ++seq, kind, message });
    setCurrent((c) => c ?? queue.current.shift() ?? null);
  }, []);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(showNext, current.kind === 'error' ? 4200 : 2800);
    return () => clearTimeout(t);
  }, [current, showNext]);

  const value = useMemo<ToastApi>(
    () => ({
      toast: {
        success: (m: string) => push('success', m),
        error: (m: string) => push('error', m),
        info: (m: string) => push('info', m),
      },
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {current ? <Toast item={current} onDismiss={showNext} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
