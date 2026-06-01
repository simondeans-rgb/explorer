import type { ResidencePeriod } from '../types';

/** Clean a set of residence periods: drop blanks, sort by start, and merge the
 *  obvious noise. Returns a stable array safe to persist. */
export function normalizePeriods(
  periods: ResidencePeriod[] | undefined,
): ResidencePeriod[] {
  if (!periods) return [];
  return periods
    .map((p) => ({ from: (p.from || '').trim(), to: (p.to || '').trim() || undefined }))
    .filter((p) => p.from)
    .sort((a, b) => a.from.localeCompare(b.from));
}

/** Derive the legacy single livedFrom/livedTo from a period list — earliest
 *  start and latest end — so old readers and stats keep working. An open-ended
 *  (present) spell makes the overall `to` open too. */
export function deriveLivedRange(periods: ResidencePeriod[]): {
  livedFrom?: string;
  livedTo?: string;
} {
  if (periods.length === 0) return {};
  const livedFrom = periods[0].from;
  let livedTo: string | undefined = periods[0].to;
  for (const p of periods) {
    if (!p.to) {
      livedTo = undefined; // an open spell ⇒ still living somewhere here
      break;
    }
    if (livedTo && p.to > livedTo) livedTo = p.to;
  }
  return { livedFrom, livedTo };
}
