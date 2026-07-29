// Pure logic for the day-of live-flight experience: finding today's flight in
// the member's trips, and the great-circle progress / position maths. No
// network or native deps, so it's fully unit-tested (see scripts/run-tests.ts).
import { geoInterpolate } from 'd3-geo';
import { AIRPORT_COORDS, AIRPORT_TZ, AIRPORT_COUNTRY } from '../data/airports';
import type { Expedition } from '../types';

/** ISO alpha-2 country for an airport IATA code — for the destination hero. */
export function airportCountry(iata?: string): string | undefined {
  return iata ? AIRPORT_COUNTRY[iata] : undefined;
}

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

// ── Destination clock + time difference ─────────────────────────────────────

/** IANA timezone for an airport IATA code (e.g. "Asia/Singapore"), or ''. */
export function airportTz(iata?: string): string {
  return (iata && AIRPORT_TZ[iata]) || '';
}

/** A timezone's offset from UTC in minutes at `date`, via Intl. Returns null if
 *  the runtime can't resolve the zone (older Hermes without full tz data). */
export function tzOffsetMinutes(tz: string, date: Date): number | null {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const p: Record<string, string> = {};
    for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === '24' ? '0' : p.hour), +p.minute, +p.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return null;
  }
}

/** "HH:MM" wall-clock time in a timezone, or '' if unresolvable. */
export function tzLocalTime(tz: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  } catch {
    return '';
  }
}

/** Format a minute offset as a signed, compact difference: "+7h", "-3h30", "0h". */
export function formatTimeDiff(diffMin: number): string {
  if (diffMin === 0) return 'same time';
  const sign = diffMin > 0 ? '+' : '−';
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `${sign}${h}h` : `${sign}${h}h${String(m).padStart(2, '0')}`;
}

export interface DestinationClock {
  localTime: string; // "HH:MM" at the destination
  diffLabel: string; // vs the device, e.g. "+7h"
}

/** Destination local time + difference from the device's timezone. Null when
 *  the zone can't be resolved (so callers just omit it). */
export function destinationClock(tz: string, now: Date): DestinationClock | null {
  if (!tz) return null;
  const local = tzLocalTime(tz, now);
  const destOff = tzOffsetMinutes(tz, now);
  if (!local || destOff == null) return null;
  const deviceOff = -now.getTimezoneOffset(); // minutes east of UTC
  return { localTime: local, diffLabel: formatTimeDiff(destOff - deviceOff) };
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
