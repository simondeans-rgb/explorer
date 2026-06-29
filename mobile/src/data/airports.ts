// Worldwide commercial-airport reference, parsed from the generated
// `airportsDataset.ts` (OurAirports + OpenFlights timezones). Refresh the data
// with `node scripts/build-airports.mjs` — no code changes required.
//
// Used by the Flighty importer, the journey route map, the flight stats, and
// the airport autocomplete. The legacy `AirportInfo` / `AirportRow` /
// `airportInfo` / `ALL_AIRPORTS` exports are preserved so older callers keep
// working; `Airport` adds name, ICAO, coordinates, timezone and aliases.
import { AIRPORTS_TSV } from './airportsDataset';

export interface Airport {
  iata: string; // 3-letter IATA
  icao: string; // 4-letter ICAO (may be empty)
  name: string; // full airport name
  city: string; // served city / municipality
  country: string; // ISO 3166-1 alpha-2
  lat: number;
  lng: number;
  tz: string; // IANA tz database name (may be empty)
  aliases: string[]; // alternate names / former names / codes
}

// Back-compat shapes used by older callers.
export interface AirportInfo {
  city: string;
  country: string; // ISO 3166-1 alpha-2
}
export interface AirportRow extends Airport {}

function parse(): Airport[] {
  const out: Airport[] = [];
  for (const line of AIRPORTS_TSV.split('\n')) {
    if (!line) continue;
    const c = line.split('\t');
    const lat = Number(c[5]);
    const lng = Number(c[6]);
    if (!c[0] || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    out.push({
      iata: c[0],
      icao: c[1] || '',
      name: c[2] || c[3] || c[0],
      city: c[3] || c[2] || c[0],
      country: c[4] || '',
      lat,
      lng,
      tz: c[7] || '',
      aliases: c[8] ? c[8].split(';').filter(Boolean) : [],
    });
  }
  return out;
}

/** Every known commercial airport (already sorted by city). */
export const ALL_AIRPORTS: Airport[] = parse();

const BY_IATA = new Map<string, Airport>();
const BY_ICAO = new Map<string, Airport>();
for (const a of ALL_AIRPORTS) {
  if (!BY_IATA.has(a.iata)) BY_IATA.set(a.iata, a);
  if (a.icao && !BY_ICAO.has(a.icao)) BY_ICAO.set(a.icao, a);
}

/** Look up an airport by IATA (e.g. LHR) or ICAO (e.g. EGLL) code. */
export function airportInfo(code?: string): Airport | undefined {
  if (!code) return undefined;
  const c = code.trim().toUpperCase();
  return BY_IATA.get(c) || BY_ICAO.get(c);
}

/** IATA → [lng, lat], for the route map + endpoint resolution. */
export const AIRPORT_COORDS: Record<string, [number, number]> = {};
for (const a of ALL_AIRPORTS) if (!AIRPORT_COORDS[a.iata]) AIRPORT_COORDS[a.iata] = [a.lng, a.lat];

/** "ISO|city" (lowercased) → [lng, lat], so a bare city name still resolves. */
export const CITY_COORDS: Record<string, [number, number]> = {};
for (const a of ALL_AIRPORTS) {
  const key = `${a.country}|${a.city.toLowerCase()}`;
  if (!CITY_COORDS[key]) CITY_COORDS[key] = [a.lng, a.lat];
}
