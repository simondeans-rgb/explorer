// Pure logic for the day-of live-flight experience: finding today's flight in
// the member's trips, and the great-circle progress / position maths. No
// network or native deps, so it's fully unit-tested (see scripts/run-tests.ts).
import { geoInterpolate } from 'd3-geo';
import { AIRPORT_COORDS } from '../data/airports';
import type { Expedition } from '../types';

export interface TodaysFlight {
  /** Stable id `${expeditionId}:${journeyId}` for React keys + polling. */
  key: string;
  expeditionId: string;
  tripTitle: string;
  flightNumber: string; // normalised, e.g. "BA31"
  date: string; // YYYY-MM-DD (local departure date)
  fromLabel?: string;
  toLabel?: string;
  fromCoord?: [number, number]; // [lng, lat]
  toCoord?: [number, number];
  departTime?: string; // scheduled local "HH:MM"
  arriveTime?: string;
}

/** Pull the IATA code out of a stored "City (IATA)" endpoint label. */
export function iataFromLabel(label?: string): string | undefined {
  const m = label?.match(/\(([A-Za-z]{3})\)\s*$/);
  return m ? m[1].toUpperCase() : undefined;
}

/** [lng, lat] for an endpoint label, via the worldwide airport dataset. */
export function coordForLabel(label?: string): [number, number] | undefined {
  const iata = iataFromLabel(label);
  return iata ? AIRPORT_COORDS[iata] : undefined;
}

/** Normalise a flight number: uppercase, strip spaces. "ba 31" → "BA31". */
export function normFlightNumber(s?: string): string {
  return (s ?? '').toUpperCase().replace(/\s+/g, '');
}
const FLIGHT_RE = /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/;

/** Minutes since local midnight for an "HH:MM" string (for ordering). */
function hhmmToMinutes(t?: string): number {
  const m = t?.match(/^(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 1_000_000;
}

/** The member's flight for `todayISO`, if any. When several are logged for the
 *  day, prefer the one that hasn't landed yet (by scheduled arrival vs
 *  nowMinutes), else the earliest. Returns null when there's nothing to show. */
export function findTodaysFlight(
  expeditions: Expedition[],
  todayISO: string,
  nowMinutes?: number,
): TodaysFlight | null {
  const candidates: TodaysFlight[] = [];
  for (const e of expeditions) {
    for (const j of e.journeys ?? []) {
      if (j.mode !== 'flight' || j.date !== todayISO) continue;
      const flightNumber = normFlightNumber(j.reference);
      if (!FLIGHT_RE.test(flightNumber)) continue; // needs a real flight number to track
      candidates.push({
        key: `${e.id}:${j.id}`,
        expeditionId: e.id,
        tripTitle: e.title,
        flightNumber,
        date: todayISO,
        fromLabel: j.from,
        toLabel: j.to,
        fromCoord: coordForLabel(j.from),
        toCoord: coordForLabel(j.to),
        departTime: j.departTime,
        arriveTime: j.arriveTime,
      });
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => hhmmToMinutes(a.departTime) - hhmmToMinutes(b.departTime));
  if (nowMinutes != null) {
    const notLanded = candidates.find((c) => hhmmToMinutes(c.arriveTime) >= nowMinutes);
    if (notLanded) return notLanded;
  }
  return candidates[candidates.length - 1] ?? candidates[0];
}

// ── Progress + position ────────────────────────────────────────────────────

/** 0→1 fraction of the flight elapsed between departure and arrival. Clamped. */
export function flightProgress(departMs?: number, arriveMs?: number, nowMs?: number): number {
  if (!departMs || !arriveMs || nowMs == null || arriveMs <= departMs) return 0;
  return Math.max(0, Math.min(1, (nowMs - departMs) / (arriveMs - departMs)));
}

/** Great-circle position at fraction `t` (0→1) between two [lng,lat] points. */
export function positionAt(from: [number, number], to: [number, number], t: number): [number, number] {
  return geoInterpolate(from, to)(Math.max(0, Math.min(1, t))) as [number, number];
}

/** Whole minutes until arrival (never negative). */
export function minutesRemaining(arriveMs?: number, nowMs?: number): number {
  if (!arriveMs || nowMs == null) return 0;
  return Math.max(0, Math.round((arriveMs - nowMs) / 60000));
}

/** "2h 15m" / "45m" from a minute count. */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export type FlightPhase = 'scheduled' | 'boarding' | 'departed' | 'enroute' | 'landed' | 'unknown';

/** Best-effort phase from AeroDataBox's status text plus the timeline, so the
 *  tile still reads sensibly when the provider's status string is missing. */
export function derivePhase(
  statusText: string | undefined,
  departMs: number | undefined,
  arriveMs: number | undefined,
  nowMs: number,
): FlightPhase {
  const s = (statusText || '').toLowerCase();
  if (/arriv|land/.test(s)) return 'landed';
  if (/en ?route|airborne|in ?air|departed/.test(s)) return arriveMs && nowMs >= arriveMs ? 'landed' : 'enroute';
  if (/board/.test(s)) return 'boarding';
  if (/schedul|expected|delayed|check|gate/.test(s)) {
    if (departMs && nowMs >= departMs) return arriveMs && nowMs >= arriveMs ? 'landed' : 'enroute';
    return 'scheduled';
  }
  // Fall back to the timeline.
  if (departMs && arriveMs) {
    if (nowMs >= arriveMs) return 'landed';
    if (nowMs >= departMs) return 'enroute';
  }
  return 'unknown';
}
