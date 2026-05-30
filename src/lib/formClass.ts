import { cn } from './cn';

/** Shared input styling for the add/edit sheets. */
export const inputClass = cn(
  'w-full px-3 py-2.5 rounded-xl outline-none transition-colors text-sm',
  'bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10',
  'focus:border-passport-gold/70',
  'text-black/85 dark:text-white/90 placeholder:text-black/40 dark:placeholder:text-white/40',
);
