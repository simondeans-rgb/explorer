import type { Place } from '../types';

/** A period during which the Member lived somewhere. ISO dates (YYYY-MM[-DD]). */
export interface Residence {
  countryCode: string;
  city?: string;
  from: string;
  to?: string;
}

/** Build a chronological home timeline from the Member's `lived` places that
 *  carry a start date. City residences are preferred for anchoring trips. */
export function residenceTimeline(places: Place[]): Residence[] {
  return places
    .filter((p) => p.relationships.includes('lived') && p.livedFrom)
    .map((p) => ({
      countryCode: p.countryCode,
      city: p.kind === 'city' ? p.name : undefined,
      from: p.livedFrom as string,
      to: p.livedTo,
    }))
    .sort((a, b) => a.from.localeCompare(b.from));
}

/** The residence in effect on a given ISO date — the latest one that had
 *  started by then. (Moves are treated as contiguous, so gaps between a
 *  `to` and the next `from` still resolve to the most recent home.) */
export function homeOn(timeline: Residence[], date: string): Residence | null {
  let current: Residence | null = null;
  for (const r of timeline) {
    if (r.from <= date) current = r;
    else break;
  }
  return current;
}
