// Pure derivations for the home-screen widget's data snapshot. Kept free of
// native imports so the trip-status, world-percentage, level and achievement
// logic is unit-testable (see scripts/run-tests.ts). WidgetSync.tsx wires these
// into the payload it pushes across the app group; the Swift widget renders it.
import type { Trip } from '../types';
import type { ExplorerLevel, Badge } from './explorer';

/** The "world" denominator — sovereign UN member + observer states. The widget
 *  reports "N of 195 countries" and a percentage against this. */
export const WORLD_TOTAL = 195;

export type TripStatus = 'upcoming' | 'today' | 'underway';

export interface WidgetTrip {
  title: string;
  countryCode: string;
  startDate: string;
  endDate?: string;
  status: TripStatus;
  /** Whole days until departure. 0 when the trip is today or already underway. */
  days: number;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/** Calendar days from ISO date `a` to ISO date `b` (b − a), DST-safe (UTC). */
export function isoDaysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.slice(0, 10).split('-').map(Number);
  const [by, bm, bd] = b.slice(0, 10).split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** The trip to feature: one that's happening now (today / underway) wins over
 *  the soonest upcoming trip. `today` is an ISO `yyyy-mm-dd`. Pure. */
export function pickWidgetTrip(trips: Trip[], today: string): WidgetTrip | null {
  const dated = trips.filter((t) => t.startDate && ISO_DATE.test(t.startDate));

  // Happening now: started on/before today and either open-ended-through-today
  // (has an end date on/after today) or a single-day trip that is today.
  const current = dated
    .filter((t) => t.startDate <= today && (t.endDate ? t.endDate >= today : t.startDate === today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  if (current) {
    return {
      title: current.title,
      countryCode: current.countryCode,
      startDate: current.startDate,
      endDate: current.endDate,
      status: current.startDate === today ? 'today' : 'underway',
      days: 0,
    };
  }

  const upcoming = dated
    .filter((t) => t.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  if (upcoming) {
    return {
      title: upcoming.title,
      countryCode: upcoming.countryCode,
      startDate: upcoming.startDate,
      endDate: upcoming.endDate,
      status: 'upcoming',
      days: isoDaysBetween(today, upcoming.startDate),
    };
  }
  return null;
}

/** Percentage of the world explored, one decimal (0–100). Clamped. */
export function worldPercent(countries: number, total = WORLD_TOTAL): number {
  if (total <= 0) return 0;
  return Math.round((Math.max(0, Math.min(countries, total)) / total) * 1000) / 10;
}

/** XP still needed to reach the next Explorer level, or null when maxed. */
export function xpToNext(level: Pick<ExplorerLevel, 'xp' | 'nextLevelXp' | 'maxed'>): number | null {
  if (level.maxed) return null;
  return Math.max(0, level.nextLevelXp - level.xp);
}

/** The unit noun of a badge requirement, parsed from its description — the words
 *  after the target number. "Visit 10 countries" → "countries"; "Save 25 food &
 *  drink spots" → "food & drink spots". Undefined when there's no number. */
export function achievementUnit(description: string): string | undefined {
  const toks = description.trim().split(/\s+/);
  const i = toks.findIndex((t) => /^\d+$/.test(t));
  if (i < 0 || i === toks.length - 1) return undefined;
  return toks.slice(i + 1).join(' ');
}

export interface WidgetAchievement {
  title: string;
  value: number;
  target: number;
  unit?: string;
  progress: number;
}

/** The achievement to chase next: the not-yet-earned badge closest to done
 *  (highest progress, then fewest remaining, then declaration order). Pure. */
export function pickNextAchievement(badges: Badge[]): WidgetAchievement | null {
  const unearned = badges.filter((b) => !b.earned && b.target > 0);
  if (!unearned.length) return null;
  const best = unearned.reduce((acc, b) => {
    if (!acc) return b;
    if (b.progress !== acc.progress) return b.progress > acc.progress ? b : acc;
    return b.target - b.value < acc.target - acc.value ? b : acc;
  });
  return {
    title: best.title,
    value: best.value,
    target: best.target,
    unit: achievementUnit(best.description),
    progress: best.progress,
  };
}

// ── Contrast ────────────────────────────────────────────────────────────────

function chan(hex: string, i: number): number {
  const v = parseInt(hex.slice(i, i + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance (0–1) of a `#rrggbb` colour. */
export function relLuminance(hex: string): number {
  const h = hex.startsWith('#') ? hex : `#${hex}`;
  return 0.2126 * chan(h, 1) + 0.7152 * chan(h, 3) + 0.0722 * chan(h, 5);
}

function mixHex(a: string, b: string, t: number): string {
  const ch = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16);
  const to = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  const A = a.startsWith('#') ? a : `#${a}`;
  const B = b.startsWith('#') ? b : `#${b}`;
  return `#${to(ch(A, 1) * (1 - t) + ch(B, 1) * t)}${to(ch(A, 3) * (1 - t) + ch(B, 3) * t)}${to(ch(A, 5) * (1 - t) + ch(B, 5) * t)}`;
}

/** A version of the cover accent guaranteed to read as small text on the deep,
 *  near-black widget background: a very dark accent is lifted toward white until
 *  it's legible, so eyebrow labels and stat highlights never disappear. */
export function legibleAccentOnDark(hex: string, min = 0.45): string {
  let out = hex.startsWith('#') ? hex : `#${hex}`;
  // Lift toward white in small steps until luminance clears the floor.
  for (let t = 0; t <= 0.85 && relLuminance(out) < min; t += 0.1) {
    out = mixHex(hex, '#FFFFFF', t);
  }
  return out;
}
