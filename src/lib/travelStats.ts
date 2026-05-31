// Distance-based travel statistics, computed from a Member's trips. Each leg's
// endpoints are resolved to coordinates (airport code or city name) using the
// same tables the maps use, then great-circle distances are summed — turning a
// list of flights into "times around the world", time in the air, and so on.

import { AIRPORT_COORDS, CITY_COORDS } from '../data/airportCoords';
import type { Expedition } from '../types';

const EARTH_CIRCUMFERENCE_KM = 40_075; // equatorial
const MOON_DISTANCE_KM = 384_400;
const MARS_DISTANCE_KM = 225_000_000; // mean Earth–Mars distance
const CRUISE_SPEED_KMH = 800; // airliner average incl. taxi / climb / descent

export interface TravelStats {
  trips: number; // expeditions
  legs: number; // journeys within them
  totalKm: number;
  flightKm: number;
  airports: number; // distinct airport codes seen
  operators: number; // distinct airlines / travel companies
  hoursInAir: number;
  aroundWorld: number;
  toMoon: number; // round trips to the Moon & back
  toMars: number; // round trips to Mars & back
}

// City name → [lng, lat], derived once from the deduped "CC|city" coord table.
let cityByName: Record<string, [number, number]> | null = null;
function cityIndex(): Record<string, [number, number]> {
  if (cityByName) return cityByName;
  cityByName = {};
  for (const [key, co] of Object.entries(CITY_COORDS)) {
    const name = key.slice(key.indexOf('|') + 1);
    if (name && !(name in cityByName)) cityByName[name] = co;
  }
  return cityByName;
}

/** Extract an airport code from a leg endpoint label: "London (LHR)" or "LHR". */
function iataOf(label: string): string | undefined {
  const paren = label.match(/\(([A-Za-z]{3})\)/);
  if (paren) return paren[1].toUpperCase();
  const bare = label.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(bare) ? bare : undefined;
}

function endpointCoords(label?: string): [number, number] | undefined {
  if (!label) return undefined;
  const iata = iataOf(label);
  if (iata && AIRPORT_COORDS[iata]) return AIRPORT_COORDS[iata];
  return cityIndex()[label.trim().toLowerCase()];
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function computeTravelStats(expeditions: Expedition[]): TravelStats {
  let legs = 0;
  let totalKm = 0;
  let flightKm = 0;
  const airports = new Set<string>();
  const operators = new Set<string>();

  for (const e of expeditions) {
    for (const j of e.journeys ?? []) {
      legs += 1;
      if (j.operator?.trim()) operators.add(j.operator.trim().toLowerCase());

      const fromIata = j.from ? iataOf(j.from) : undefined;
      const toIata = j.to ? iataOf(j.to) : undefined;
      if (fromIata && AIRPORT_COORDS[fromIata]) airports.add(fromIata);
      if (toIata && AIRPORT_COORDS[toIata]) airports.add(toIata);

      const from = endpointCoords(j.from);
      const to = endpointCoords(j.to);
      if (from && to) {
        const d = haversineKm(from, to);
        totalKm += d;
        if (j.mode === 'flight') flightKm += d;
      }
    }
  }

  return {
    trips: expeditions.length,
    legs,
    totalKm,
    flightKm,
    airports: airports.size,
    operators: operators.size,
    hoursInAir: flightKm / CRUISE_SPEED_KMH,
    aroundWorld: totalKm / EARTH_CIRCUMFERENCE_KM,
    toMoon: totalKm / (2 * MOON_DISTANCE_KM),
    toMars: totalKm / (2 * MARS_DISTANCE_KM),
  };
}
