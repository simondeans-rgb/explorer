// Resolve journey endpoints to coordinates for the airline-style route map.
import { AIRPORT_COORDS } from '../data/airportCoords';
import type { Expedition } from '../types';

/** Pull an IATA code from a label like "London (LHR)" or a bare "LHR". */
export function iataOf(label?: string): string | undefined {
  if (!label) return undefined;
  const m = label.match(/\(([A-Za-z]{3})\)/);
  if (m) return m[1].toUpperCase();
  const t = label.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(t) ? t : undefined;
}

export interface Segment {
  from: [number, number];
  to: [number, number];
}

/** Deduplicated flight segments (with known airport coords) across expeditions. */
export function routeSegments(expeditions: Expedition[]): Segment[] {
  const seen = new Set<string>();
  const segs: Segment[] = [];
  for (const e of expeditions) {
    for (const j of e.journeys) {
      const a = iataOf(j.from);
      const b = iataOf(j.to);
      if (!a || !b || a === b) continue;
      const from = AIRPORT_COORDS[a];
      const to = AIRPORT_COORDS[b];
      if (!from || !to) continue;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      segs.push({ from, to });
    }
  }
  return segs;
}
