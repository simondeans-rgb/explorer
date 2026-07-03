// Flighty-style travel statistics for the atlas Journeys tab.
//
// Works off the same Expedition[] the atlas already loads. Every flight leg is
// counted (repeats included, matching how Flighty counts flights), distances
// are summed with the haversine formula over placeable endpoints, and dates are
// bucketed by year / month / weekday for the charts. Kept separate from
// `journeyStats.ts` (which feeds the explorer-level/badge system) so neither
// concern disturbs the other.
import type { Expedition, Journey, JourneyMode } from '../types';
import { JOURNEY_MODES } from '../types';
import { resolveEndpoint, resolveCountry } from './journeyGeo';

const MI_PER_KM = 0.621371;
const EARTH_R_KM = 6371;

// Cosmic yardsticks (miles) for the "how far is that really?" comparisons.
export const EARTH_CIRCUMFERENCE_MI = 24901; // around the equator
export const MOON_DISTANCE_MI = 238855; // Earth → Moon
export const SUN_CIRCUMFERENCE_MI = 2_715_000; // around the Sun (≈ π × 864,938 mi)

// A flight is "long haul" once it passes ~2,500 mi (≈ 4,000 km / 6+ hours).
const LONG_HAUL_MI = 2500;

function haversineMi(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * EARTH_R_KM * Math.asin(Math.min(1, Math.sqrt(s)));
  return km * MI_PER_KM;
}

export interface FlightExtreme {
  from: string;
  to: string;
  mi: number;
  date?: string;
}

export interface TravelStats {
  /** Total legs per transport mode (every leg, repeats included). */
  modeCounts: Record<JourneyMode, number>;
  /** Total journey legs across every mode. */
  totalLegs: number;
  flights: {
    total: number;
    domestic: number;
    international: number;
    longHaul: number;
  };
  /** Total distance flown (miles) over every placeable flight leg. */
  distanceMi: number;
  /** Mean distance per placeable flight leg (miles). */
  avgFlightMi: number;
  /** Distinct airports/cities flown through (resolved flight endpoints). */
  airports: number;
  /** Distinct airlines flown (distinct operators on flight legs). */
  airlines: number;
  /** Total time spent in the air (minutes) — measured from looked-up flight
   *  durations, estimated from distance for legs without one. */
  timeInAirMin: number;
  /** True when at least one leg's air time was estimated from distance. */
  timeInAirEstimated: boolean;
  /** Most-flown aircraft types, busiest first. */
  topAircraft: { label: string; count: number }[];
  /** Most-flown airlines, busiest first. */
  topAirlines: { label: string; count: number }[];
  /** Airline punctuality from legs with a known arrival delay, best first. */
  punctuality: { airline: string; avgDelayMin: number; onTimeRate: number; samples: number }[];
  /** Total minutes lost to late arrivals across all flights with delay data. */
  totalDelayMin: number;
  longest?: FlightExtreme;
  shortest?: FlightExtreme;
  /** Flights per calendar year, ascending — gaps filled so the line is continuous. */
  perYear: { label: string; count: number }[];
  /** Flights per month index 0–11 (Jan–Dec). */
  perMonth: number[];
  /** Flights per weekday index 0–6 (Mon–Sun). */
  perWeekday: number[];
  /** Distinct years that have at least one dated journey. */
  yearsCovered: number[];
}

const emptyModeCounts = (): Record<JourneyMode, number> =>
  JOURNEY_MODES.reduce((m, k) => ((m[k] = 0), m), {} as Record<JourneyMode, number>);

/** A flight leg's effective date: its own date, else the trip's start date. */
function legDate(j: Journey, fallback?: string): string | undefined {
  return j.date || fallback || undefined;
}

const cleanLabel = (s?: string) =>
  (s || '').replace(/\s*\([A-Za-z]{3}\)\s*/g, ' ').replace(/,.*$/, '').trim();

export function computeTravelStats(expeditions: Expedition[]): TravelStats {
  const modeCounts = emptyModeCounts();
  let totalLegs = 0;
  let total = 0;
  let domestic = 0;
  let international = 0;
  let longHaul = 0;
  let distanceMi = 0;
  let placeable = 0;
  let longest: FlightExtreme | undefined;
  let shortest: FlightExtreme | undefined;

  const yearCounts = new Map<number, number>();
  const perMonth = new Array(12).fill(0);
  const perWeekday = new Array(7).fill(0);
  const yearsSet = new Set<number>();
  const airportSet = new Set<string>();
  const airlineSet = new Set<string>();
  const aircraftCounts = new Map<string, { label: string; count: number }>();
  const airlineCounts = new Map<string, { label: string; count: number }>();
  const punct = new Map<string, { label: string; sumDelay: number; onTime: number; samples: number }>();
  let timeInAirMin = 0;
  let timeInAirEstimated = false;
  let totalDelayMin = 0; // total minutes lost to late arrivals

  for (const e of expeditions) {
    for (const j of e.journeys ?? []) {
      if (j.mode in modeCounts) modeCounts[j.mode] += 1;
      totalLegs += 1;
      if (j.mode !== 'flight') continue;
      total += 1;
      const operator = j.operator?.trim();
      if (operator) {
        const key = operator.toLowerCase();
        airlineSet.add(key);
        const a = airlineCounts.get(key);
        if (a) a.count += 1;
        else airlineCounts.set(key, { label: operator, count: 1 });
      }
      const aircraft = j.vehicle?.trim();
      if (aircraft) {
        const key = aircraft.toLowerCase();
        const a = aircraftCounts.get(key);
        if (a) a.count += 1;
        else aircraftCounts.set(key, { label: aircraft, count: 1 });
      }
      if (operator && j.arriveDelayMin != null && Number.isFinite(j.arriveDelayMin)) {
        const key = operator.toLowerCase();
        const p = punct.get(key) ?? { label: operator, sumDelay: 0, onTime: 0, samples: 0 };
        p.sumDelay += j.arriveDelayMin;
        if (j.arriveDelayMin <= 15) p.onTime += 1; // within 15 min counts as on time
        p.samples += 1;
        punct.set(key, p);
      }
      // Total time lost to delays counts every late arrival (early ones don't
      // give time back), regardless of whether the airline is named.
      if (j.arriveDelayMin != null && j.arriveDelayMin > 0) totalDelayMin += j.arriveDelayMin;
      // Time in the air: use the measured flight duration when we have it.
      let countedAir = false;
      if (j.durationMin != null && j.durationMin > 0) {
        timeInAirMin += j.durationMin;
        countedAir = true;
      }

      // Domestic vs international (only when both ends resolve to a country).
      const ca = resolveCountry(j.from);
      const cb = resolveCountry(j.to);
      if (ca && cb) {
        if (ca === cb) domestic += 1;
        else international += 1;
      }

      // Distance (only when both ends are placeable).
      const from = resolveEndpoint(j.from);
      const to = resolveEndpoint(j.to);
      const date = legDate(j, e.startDate);
      if (from) airportSet.add(from.join(','));
      if (to) airportSet.add(to.join(','));
      if (from && to) {
        const mi = haversineMi(from, to);
        if (mi > 0) {
          distanceMi += mi;
          placeable += 1;
          if (mi >= LONG_HAUL_MI) longHaul += 1;
          // No measured duration? Estimate air time: ~30 min taxi/climb/descent
          // plus cruise at ~500 mph.
          if (!countedAir) {
            timeInAirMin += Math.round(30 + (mi / 500) * 60);
            timeInAirEstimated = true;
          }
          const extreme: FlightExtreme = { from: cleanLabel(j.from), to: cleanLabel(j.to), mi, date };
          if (!longest || mi > longest.mi) longest = extreme;
          if (!shortest || mi < shortest.mi) shortest = extreme;
        }
      }

      // Date buckets.
      if (date && date.length >= 4) {
        const year = Number(date.slice(0, 4));
        if (Number.isFinite(year)) {
          yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
          yearsSet.add(year);
        }
      }
      if (date && date.length >= 7) {
        const month = Number(date.slice(5, 7)) - 1;
        if (month >= 0 && month < 12) perMonth[month] += 1;
      }
      if (date && date.length >= 10) {
        const d = new Date(date);
        if (!Number.isNaN(d.getTime())) {
          // JS getDay: 0=Sun..6=Sat → remap to 0=Mon..6=Sun.
          perWeekday[(d.getDay() + 6) % 7] += 1;
        }
      }
    }
  }

  // Fill year gaps so the line chart has a continuous x-axis.
  const perYear: { label: string; count: number }[] = [];
  if (yearCounts.size) {
    const years = [...yearCounts.keys()].sort((a, b) => a - b);
    const min = years[0];
    const max = years[years.length - 1];
    for (let y = min; y <= max; y++) perYear.push({ label: String(y), count: yearCounts.get(y) ?? 0 });
  }

  const topAircraft = [...aircraftCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const topAirlines = [...airlineCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const punctuality = [...punct.values()]
    .map((p) => ({ airline: p.label, avgDelayMin: Math.round(p.sumDelay / p.samples), onTimeRate: p.onTime / p.samples, samples: p.samples }))
    .sort((a, b) => a.avgDelayMin - b.avgDelayMin);

  return {
    modeCounts,
    totalLegs,
    flights: { total, domestic, international, longHaul },
    distanceMi,
    avgFlightMi: placeable ? distanceMi / placeable : 0,
    airports: airportSet.size,
    airlines: airlineSet.size,
    timeInAirMin,
    timeInAirEstimated,
    topAircraft,
    topAirlines,
    punctuality,
    totalDelayMin,
    longest,
    shortest,
    perYear,
    perMonth,
    perWeekday,
    yearsCovered: [...yearsSet].sort((a, b) => a - b),
  };
}
