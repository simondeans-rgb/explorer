import { cn } from './cn';

/** Shared input styling for the add/edit sheets. */
export const inputClass = cn(
  'w-full px-3.5 py-3 rounded-2xl outline-none transition-all text-sm',
  'bg-passport-cartridge dark:bg-white/5 border border-transparent',
  'focus:border-passport-gold/50 focus:bg-white dark:focus:bg-white/[0.08]',
  'text-passport-ink dark:text-white/90 placeholder:text-passport-ink3',
);
