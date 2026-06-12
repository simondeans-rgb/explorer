import { cn } from './cn';

/** Shared input styling for the add/edit sheets. Note: 16px (text-base) min
 *  font size deliberately prevents iOS Safari from auto-zooming on focus. */
export const inputClass = cn(
  'w-full px-3.5 py-3 rounded-2xl outline-none transition-all text-base',
  'bg-passport-cartridge dark:bg-white/5 border border-transparent',
  'focus:border-passport-gold/50 focus:bg-white dark:focus:bg-white/[0.08]',
  'text-passport-ink dark:text-white/90 placeholder:text-passport-ink3',
);
