import type { Place, ResidencePeriod } from '../types';

/** A period during which the Member lived somewhere. ISO dates (YYYY-MM[-DD]). */
export interface Residence {
  countryCode: string;
  city?: string;
  from: string;
  to?: string;
}

/** The residence periods for a place, as a normalised list. Prefers the
 *  `residencePeriods` array; falls back to the single livedFrom/livedTo so old
 *  records keep working. Only periods with a `from` are returned, sorted. */
export function placePeriods(place: Place): ResidencePeriod[] {
  const raw =
    place.residencePeriods && place.residencePeriods.length > 0
      ? place.residencePeriods
      : place.livedFrom
        ? [{ from: place.livedFrom, to: place.livedTo }]
        : [];
  return raw
    .filter((p) => p.from)
    .map((p) => ({ from: p.from, to: p.to || undefined }))
    .sort((a, b) => a.from.localeCompare(b.from));
}

/** Build a chronological home timeline from the Member's `lived` places,
 *  expanding every residence period (so moving away and back creates several
 *  entries). City residences anchor trips; country residences still count. */
export function residenceTimeline(places: Place[]): Residence[] {
  const out: Residence[] = [];
  for (const p of places) {
    if (!p.relationships.includes('lived')) continue;
    for (const period of placePeriods(p)) {
      out.push({
        countryCode: p.countryCode,
        city: p.kind === 'city' ? p.name : undefined,
        from: period.from,
        to: period.to,
      });
    }
  }
  return out.sort((a, b) => a.from.localeCompare(b.from));
}

/** The residence in effect on a given ISO date — the latest spell that had
 *  started by then, provided it hadn't already ended before that date. When a
 *  spell has ended and the next hasn't begun, the most recent started spell is
 *  still treated as home (gaps resolve forward), matching prior behaviour. */
export function homeOn(timeline: Residence[], date: string): Residence | null {
  let current: Residence | null = null;
  for (const r of timeline) {
    if (r.from <= date) current = r;
    else break;
  }
  return current;
}
