// Flight-number lookup via AeroDataBox (RapidAPI). Given a flight number and a
// date, returns the route, airline, aircraft and departure date so the journey
// editor can pre-fill a flight leg. Network-only; no-ops cleanly when there's
// no API key or connectivity so the offline/demo mode is unaffected.
//
// The key is injected at bundle time from EXPO_PUBLIC_AERODATABOX_KEY (kept out
// of the repo). Get one on RapidAPI → AeroDataBox.
import { canonicalAirportLabel } from './airportSearch';

const KEY = process.env.EXPO_PUBLIC_AERODATABOX_KEY ?? '';
const HOST = 'aerodatabox.p.rapidapi.com';

export function flightLookupConfigured(): boolean {
  return KEY.length > 0;
}

export interface FlightInfo {
  flightNumber: string; // normalised, e.g. "BA31"
  airline?: string;
  from?: string; // canonical "City (IATA)"
  to?: string;
  aircraft?: string; // model, e.g. "Boeing 777-300ER"
  date?: string; // departure date, ISO YYYY-MM-DD
  departTimeLocal?: string; // scheduled departure, local "12:05"
  arriveTimeLocal?: string; // scheduled arrival, local
  departActualLocal?: string; // actual/revised departure, local
  arriveActualLocal?: string; // actual/revised arrival, local
  departDelayMin?: number; // actual − scheduled at departure (minutes; negative = early)
  arriveDelayMin?: number; // actual − scheduled at arrival
  fromTerminal?: string; // departure terminal, e.g. "5"
  toTerminal?: string; // arrival terminal
  distanceKm?: number; // great-circle distance in km
  durationMin?: number; // scheduled gate-to-gate duration in minutes
}

export type FlightLookupResult =
  | { ok: true; info: FlightInfo }
  | { ok: false; reason: 'no-key' | 'not-found' | 'no-date' | 'error' };

/** Normalise "ba 31" / "BA-31" → "BA31". */
export function normaliseFlightNumber(s: string): string {
  return s.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function airportLabel(a: { iata?: string; municipalityName?: string; name?: string } | undefined): string | undefined {
  if (!a?.iata) return a?.name || undefined;
  const city = a.municipalityName || a.name || a.iata;
  return canonicalAirportLabel(city, a.iata);
}

/** Take "2023-07-29 12:05+01:00" → { date:"2023-07-29", time:"12:05" }. */
function splitLocal(local?: string): { date?: string; time?: string } {
  if (!local) return {};
  const m = local.match(/(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  return m ? { date: m[1], time: m[2] } : {};
}

/** Scheduled gate-to-gate minutes from two UTC strings ("2026-07-02 18:20Z"). */
function durationMinutes(depUtc?: string, arrUtc?: string): number | undefined {
  if (!depUtc || !arrUtc) return undefined;
  const dep = Date.parse(depUtc.replace(' ', 'T'));
  const arr = Date.parse(arrUtc.replace(' ', 'T'));
  if (Number.isNaN(dep) || Number.isNaN(arr)) return undefined;
  const min = Math.round((arr - dep) / 60000);
  return min > 0 && min < 60 * 24 ? min : undefined;
}

/** Delay in minutes: actual − scheduled (negative = early). Undefined unless
 *  both UTC timestamps parse and they actually differ or match a real time. */
function delayMinutes(schedUtc?: string, actualUtc?: string): number | undefined {
  if (!schedUtc || !actualUtc) return undefined;
  const s = Date.parse(schedUtc.replace(' ', 'T'));
  const a = Date.parse(actualUtc.replace(' ', 'T'));
  if (Number.isNaN(s) || Number.isNaN(a)) return undefined;
  const min = Math.round((a - s) / 60000);
  return Math.abs(min) < 60 * 24 ? min : undefined;
}

/** Look up a flight by number + date (YYYY-MM-DD). */
export async function lookupFlight(rawNumber: string, dateISO: string): Promise<FlightLookupResult> {
  if (!KEY) return { ok: false, reason: 'no-key' };
  const number = normaliseFlightNumber(rawNumber);
  const date = (dateISO || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: 'no-date' };
  if (number.length < 3) return { ok: false, reason: 'not-found' };

  try {
    const url = `https://${HOST}/flights/number/${encodeURIComponent(number)}/${date}?withAircraftImage=false&withLocation=false`;
    const res = await fetch(url, { headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST } });
    if (res.status === 204 || res.status === 404) return { ok: false, reason: 'not-found' };
    if (!res.ok) return { ok: false, reason: 'error' };
    const data = await res.json();
    const legs = Array.isArray(data) ? data : data?.departures ?? [];
    const f = legs[0];
    if (!f) return { ok: false, reason: 'not-found' };

    const dep = splitLocal(f.departure?.scheduledTime?.local ?? f.departure?.revisedTime?.local);
    const arr = splitLocal(f.arrival?.scheduledTime?.local ?? f.arrival?.revisedTime?.local);
    const depActual = splitLocal(f.departure?.revisedTime?.local ?? f.departure?.predictedTime?.local);
    const arrActual = splitLocal(f.arrival?.revisedTime?.local ?? f.arrival?.predictedTime?.local);
    const km = f.greatCircleDistance?.km;
    const info: FlightInfo = {
      flightNumber: number,
      airline: f.airline?.name,
      from: airportLabel(f.departure?.airport),
      to: airportLabel(f.arrival?.airport),
      aircraft: f.aircraft?.model,
      date: dep.date || date,
      departTimeLocal: dep.time,
      arriveTimeLocal: arr.time,
      departActualLocal: depActual.time,
      arriveActualLocal: arrActual.time,
      departDelayMin: delayMinutes(
        f.departure?.scheduledTime?.utc,
        f.departure?.revisedTime?.utc ?? f.departure?.predictedTime?.utc,
      ),
      arriveDelayMin: delayMinutes(
        f.arrival?.scheduledTime?.utc,
        f.arrival?.revisedTime?.utc ?? f.arrival?.predictedTime?.utc,
      ),
      fromTerminal: typeof f.departure?.terminal === 'string' ? f.departure.terminal : undefined,
      toTerminal: typeof f.arrival?.terminal === 'string' ? f.arrival.terminal : undefined,
      distanceKm: typeof km === 'number' && km > 0 ? Math.round(km) : undefined,
      durationMin: durationMinutes(
        f.departure?.scheduledTime?.utc ?? f.departure?.revisedTime?.utc,
        f.arrival?.scheduledTime?.utc ?? f.arrival?.revisedTime?.utc,
      ),
    };
    if (!info.from && !info.to) return { ok: false, reason: 'not-found' };
    return { ok: true, info };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
