// Past vs upcoming is DERIVED from a trip's dates, never chosen by the user.
// One pure, unit-tested source of truth (see scripts/run-tests.ts) so Home, the
// widget, Circle, notifications and the trip detail all classify identically.
import { isoDaysBetween } from './widgetPayload';

export type TripPhase = 'upcoming' | 'today' | 'underway' | 'past';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** Minimal shape both an Expedition and a mapped legacy Trip satisfy. */
export interface Dated {
  startDate?: string;
  endDate?: string;
}

const iso = (v?: string) => (v && ISO_DATE.test(v) ? v.slice(0, 10) : undefined);

/** Where a trip sits relative to `today` (ISO yyyy-mm-dd). An undated record is
 *  a logged journey → 'past'. Mirrors pickWidgetTrip's now/soon logic. */
export function tripPhase(e: Dated, today: string): TripPhase {
  const start = iso(e.startDate);
  const end = iso(e.endDate);
  if (!start) return 'past';
  if (start > today) return 'upcoming';
  if (start === today) return 'today';
  // started before today — still underway if it runs through today
  if (end && end >= today) return 'underway';
  return 'past';
}

/** True while a trip is still ahead of or around now (drives countdown surfaces). */
export function isUpcoming(e: Dated, today: string): boolean {
  const p = tripPhase(e, today);
  return p === 'upcoming' || p === 'today' || p === 'underway';
}

/** Whole days until departure; 0 once today/underway or undated. */
export function daysToGo(e: Dated, today: string): number {
  const start = iso(e.startDate);
  if (!start || start <= today) return 0;
  return Math.max(0, isoDaysBetween(today, start));
}

/** The trip's headline country (plural countryCodes → first), 'WW' fallback. */
export function primaryCode(e: { countryCodes?: string[] }): string {
  return (e.countryCodes && e.countryCodes[0]) || 'WW';
}

/** Today as ISO yyyy-mm-dd (impure convenience for call sites). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
