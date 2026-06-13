import { createContext, useContext } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastApi {
  /** Transient pill near the bottom. Use for success/error/info feedback. */
  toast: (t: { kind: ToastKind; message: string }) => void;
  /** A full-screen celebration moment (level-ups, badges). */
  celebrate: (c: { emoji: string; title: string; subtitle?: string }) => void;
}

export const ToastContext = createContext<ToastApi>({
  toast: () => {},
  celebrate: () => {},
});

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
