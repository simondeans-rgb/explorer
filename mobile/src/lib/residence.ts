// Residence windows derived from a member's "lived"/"based" places, used so
// imports don't record time spent at home as travel.
import type { Place } from '../types';

export interface HomeRange {
  code: string;
  from: number; // ms (or -Infinity)
  to: number; // ms (or Infinity = present / open)
}

// Start of an ISO partial date (YYYY | YYYY-MM | YYYY-MM-DD).
function partStart(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  if (!y) return -Infinity;
  return new Date(y, m ? m - 1 : 0, d || 1).getTime();
}
// Inclusive end of an ISO partial date.
function partEnd(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  if (!y) return Infinity;
  if (d) return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  if (m) return new Date(y, m, 0, 23, 59, 59, 999).getTime(); // last day of month
  return new Date(y, 11, 31, 23, 59, 59, 999).getTime();
}

/** Residence windows per country. A lived/based place with no dates is treated
 *  as home for all time (so home photos never read as trips). */
export function homeRanges(places: Place[]): HomeRange[] {
  const out: HomeRange[] = [];
  for (const p of places) {
    if (p.kind !== 'country') continue;
    if (!p.relationships.some((r) => r === 'lived' || r === 'based')) continue;
    const periods =
      p.residencePeriods && p.residencePeriods.length
        ? p.residencePeriods
        : p.livedFrom
          ? [{ from: p.livedFrom, to: p.livedTo }]
          : null;
    if (periods) {
      for (const per of periods) {
        out.push({ code: p.countryCode, from: partStart(per.from), to: per.to ? partEnd(per.to) : Infinity });
      }
    } else {
      out.push({ code: p.countryCode, from: -Infinity, to: Infinity });
    }
  }
  return out;
}

/** True when a timestamp falls inside a residence window for that country. */
export function isHome(ranges: HomeRange[], code: string, ts: number): boolean {
  return ranges.some((r) => r.code === code && ts >= r.from && ts <= r.to);
}
