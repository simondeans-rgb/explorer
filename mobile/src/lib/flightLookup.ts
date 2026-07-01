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
  departTimeLocal?: string; // e.g. "12:05" (not stored on the leg yet, shown in the confirm)
  arriveTimeLocal?: string;
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
    const info: FlightInfo = {
      flightNumber: number,
      airline: f.airline?.name,
      from: airportLabel(f.departure?.airport),
      to: airportLabel(f.arrival?.airport),
      aircraft: f.aircraft?.model,
      date: dep.date || date,
      departTimeLocal: dep.time,
      arriveTimeLocal: arr.time,
    };
    if (!info.from && !info.to) return { ok: false, reason: 'not-found' };
    return { ok: true, info };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
