import { STAMP_LABEL, type StampKind } from '../../types';
import { cn } from '../../lib/cn';

const TINTS: Record<StampKind, string> = {
  discovery: 'text-passport-navy dark:text-passport-goldsoft',
  residency: 'text-rose-700 dark:text-rose-300',
  work: 'text-emerald-700 dark:text-emerald-300',
  study: 'text-indigo-700 dark:text-indigo-300',
};

/** A small inked passport seal, derived from a relationship. */
export function Stamp({ kind, seed = 0 }: { kind: StampKind; seed?: number }) {
  const rotate = ((seed % 5) - 2) * 4;
  return (
    <span
      title={`${STAMP_LABEL[kind]} stamp`}
      style={{ rotate: `${rotate}deg` }}
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-full',
        'border-2 border-current opacity-80 select-none',
        'text-[8px] font-semibold uppercase tracking-wider text-center leading-tight',
        TINTS[kind],
      )}
    >
      {STAMP_LABEL[kind]}
    </span>
  );
}
