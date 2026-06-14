// Resolve journey endpoints to coordinates for the airline-style route map.
// Endpoints resolve by IATA code OR by city name, so a flight typed as
// "London → Paris" maps just like an imported "London (LHR)" one — no airport
// codes required, and no flight is missed.
import { AIRPORT_COORDS, CITY_COORDS } from '../data/airportCoords';
import { ALL_AIRPORTS } from '../data/airports';
import type { Expedition } from '../types';

/** Pull an IATA code from a label like "London (LHR)" or a bare "LHR". */
export function iataOf(label?: string): string | undefined {
  if (!label) return undefined;
  const m = label.match(/\(([A-Za-z]{3})\)/);
  if (m) return m[1].toUpperCase();
  const t = label.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(t) ? t : undefined;
}

// city name (lowercase) -> coordinates, built from the city table + airports.
const CITY_BY_NAME: Record<string, [number, number]> = {};
for (const [key, co] of Object.entries(CITY_COORDS)) {
  const city = key.split('|')[1];
  if (city && !CITY_BY_NAME[city]) CITY_BY_NAME[city] = co;
}
for (const a of ALL_AIRPORTS) {
  const city = a.city.toLowerCase();
  const co = AIRPORT_COORDS[a.iata];
  if (co && !CITY_BY_NAME[city]) CITY_BY_NAME[city] = co;
}

function cityPart(label: string): string {
  // Drop a trailing "(LHR)" and anything after a comma, then normalise.
  return label.replace(/\(.*?\)/g, '').replace(/,.*$/, '').trim().toLowerCase();
}

/** Best-effort coordinates for a free-text or coded endpoint. */
export function resolveEndpoint(label?: string): [number, number] | undefined {
  if (!label) return undefined;
  const iata = iataOf(label);
  if (iata && AIRPORT_COORDS[iata]) return AIRPORT_COORDS[iata];
  const city = cityPart(label);
  if (city && CITY_BY_NAME[city]) return CITY_BY_NAME[city];
  return undefined;
}

export interface Segment {
  from: [number, number];
  to: [number, number];
}

/** Every flight leg whose endpoints we can place, deduplicated. */
export function routeSegments(expeditions: Expedition[]): Segment[] {
  const seen = new Set<string>();
  const segs: Segment[] = [];
  for (const e of expeditions) {
    for (const j of e.journeys) {
      if (j.mode !== 'flight') continue;
      const from = resolveEndpoint(j.from);
      const to = resolveEndpoint(j.to);
      if (!from || !to) continue;
      if (from[0] === to[0] && from[1] === to[1]) continue;
      const key = [from.join(','), to.join(',')].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      segs.push({ from, to });
    }
  }
  return segs;
}
