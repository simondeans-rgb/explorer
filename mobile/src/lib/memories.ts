// "On this day" memories — pure (no native imports) so the Story feed logic
// is unit-testable. The notification scheduler has its own richer pipeline;
// this answers one question: what happened on today's date in earlier years?
import { countryName } from '../data/countries';
import type { Place, Expedition } from '../types';

function parseDate(s?: string): { y: number; m: number; d: number } | null {
  const m = (s ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

/** A memory whose anniversary is today — for the Story feed's "On this day". */
export interface TodayMemory {
  label: string;
  yearsAgo: number;
  kind: 'trip' | 'place';
  countryCode?: string;
}

/** Everything that happened on today's month/day in an earlier year, oldest
 *  first. Pure (pass `now` for tests). */
export function todaysMemories(expeditions: Expedition[], places: Place[], now = new Date()): TodayMemory[] {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const year = now.getFullYear();
  const out: TodayMemory[] = [];
  for (const e of expeditions) {
    const pd = parseDate(e.startDate);
    if (!pd || pd.m !== m || pd.d !== d || pd.y >= year) continue;
    const label = e.title || (e.countryCodes[0] ? countryName(e.countryCodes[0]) : '') || 'a trip';
    out.push({ label, yearsAgo: year - pd.y, kind: 'trip', countryCode: e.countryCodes[0] });
  }
  for (const p of places) {
    const pd = parseDate(p.firstDate);
    if (!pd || pd.m !== m || pd.d !== d || pd.y >= year) continue;
    const label = p.kind === 'country' ? countryName(p.countryCode) || p.name : p.name;
    if (!label) continue;
    out.push({ label, yearsAgo: year - pd.y, kind: 'place', countryCode: p.countryCode });
  }
  return out.sort((a, b) => b.yearsAgo - a.yearsAgo);
}
