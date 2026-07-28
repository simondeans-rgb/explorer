// Live flight status + aircraft position for the day-of tile, via AeroDataBox.
// A single call to the flight-number endpoint with `withLocation=true` returns
// the status, revised times, gate/terminal AND (for in-air flights on supported
// subscriptions) the live lat/lon — so one request drives the whole tile.
//
// Cost control: this is polled while a flight is active, so calls are throttled
// to at most one per flight per MIN_INTERVAL_MS regardless of how often the hook
// asks, and no-op cleanly without a key / connectivity.
import { normFlightNumber } from './liveFlight';

const KEY = process.env.EXPO_PUBLIC_AERODATABOX_KEY ?? '';
const HOST = 'aerodatabox.p.rapidapi.com';
const MIN_INTERVAL_MS = 60_000; // never hit the API more than once a minute per flight

export interface LivePosition {
  lat: number;
  lon: number;
  altitudeFt?: number;
  groundSpeedKt?: number;
  trueTrackDeg?: number;
  reportedAtMs?: number;
}

export interface LiveFlightStatus {
  flightNumber: string;
  statusText?: string; // provider status, e.g. "EnRoute", "Arrived"
  departScheduledMs?: number;
  departActualMs?: number;
  arriveScheduledMs?: number;
  arriveActualMs?: number;
  departDelayMin?: number;
  arriveDelayMin?: number;
  departGate?: string;
  departTerminal?: string;
  arriveGate?: string;
  arriveTerminal?: string;
  position?: LivePosition;
  fetchedAtMs: number;
}

export function flightStatusConfigured(): boolean {
  return KEY.length > 0;
}

/** Parse an AeroDataBox UTC stamp ("2026-07-28 07:00Z") to epoch ms. */
function utcMs(s?: string): number | undefined {
  if (!s || typeof s !== 'string') return undefined;
  const ms = Date.parse(s.replace(' ', 'T'));
  return Number.isFinite(ms) ? ms : undefined;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}
function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function delta(sched?: number, actual?: number): number | undefined {
  if (sched == null || actual == null) return undefined;
  return Math.round((actual - sched) / 60000);
}

// Per-flight throttle so rapid re-renders / short poll intervals can't hammer
// the API. Keyed by `${number}:${date}`; returns the cached result if asked
// again within MIN_INTERVAL_MS.
const cache = new Map<string, { at: number; value: LiveFlightStatus | null }>();

/** Fetch live status + position for a flight. Returns null when unavailable
 *  (no key, offline, not found) so the UI falls back to estimated progress. */
export async function fetchLiveFlight(
  rawNumber: string,
  dateISO: string,
  nowMs: number,
): Promise<LiveFlightStatus | null> {
  if (!KEY) return null;
  const number = normFlightNumber(rawNumber);
  const date = (dateISO || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || number.length < 3) return null;

  const cacheKey = `${number}:${date}`;
  const hit = cache.get(cacheKey);
  if (hit && nowMs - hit.at < MIN_INTERVAL_MS) return hit.value;

  try {
    const url = `https://${HOST}/flights/number/${encodeURIComponent(number)}/${date}?withAircraftImage=false&withLocation=true`;
    const res = await fetch(url, { headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST } });
    if (!res.ok) {
      cache.set(cacheKey, { at: nowMs, value: hit?.value ?? null });
      return hit?.value ?? null;
    }
    const data = await res.json();
    const legs = Array.isArray(data) ? data : data?.departures ?? [];
    const f = legs[0];
    if (!f) {
      cache.set(cacheKey, { at: nowMs, value: null });
      return null;
    }

    const dep = f.departure ?? {};
    const arr = f.arrival ?? {};
    const departScheduledMs = utcMs(dep.scheduledTime?.utc);
    const departActualMs = utcMs(dep.revisedTime?.utc ?? dep.actualTime?.utc ?? dep.predictedTime?.utc);
    const arriveScheduledMs = utcMs(arr.scheduledTime?.utc);
    const arriveActualMs = utcMs(arr.revisedTime?.utc ?? arr.predictedTime?.utc);

    const loc = f.location;
    const position: LivePosition | undefined =
      loc && num(loc.lat) != null && num(loc.lon) != null
        ? {
            lat: num(loc.lat)!,
            lon: num(loc.lon)!,
            altitudeFt: num(loc.altitude?.feet) ?? num(loc.pressureAltitude?.feet),
            groundSpeedKt: num(loc.groundSpeedKt) ?? num(loc.groundSpeed?.knots),
            trueTrackDeg: num(loc.trueTrack?.deg) ?? num(loc.trueTrack),
            reportedAtMs: utcMs(loc.reportedAtUtc),
          }
        : undefined;

    const value: LiveFlightStatus = {
      flightNumber: number,
      statusText: str(f.status),
      departScheduledMs,
      departActualMs,
      arriveScheduledMs,
      arriveActualMs,
      departDelayMin: delta(departScheduledMs, departActualMs),
      arriveDelayMin: delta(arriveScheduledMs, arriveActualMs),
      departGate: str(dep.gate),
      departTerminal: str(dep.terminal),
      arriveGate: str(arr.gate),
      arriveTerminal: str(arr.terminal),
      position,
      fetchedAtMs: nowMs,
    };
    cache.set(cacheKey, { at: nowMs, value });
    return value;
  } catch {
    cache.set(cacheKey, { at: nowMs, value: hit?.value ?? null });
    return hit?.value ?? null;
  }
}
