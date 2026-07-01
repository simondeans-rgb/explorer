// Post-flight enrichment for flight legs.
//
// A flight leg looked up ahead of time only has the *schedule* — no actual
// times or delays exist until the flight has flown. This module finds legs that
// are still missing gatherable data (route, airline, aircraft, times, terminals,
// distance, duration) or, once a flight has completed, its actual departure /
// arrival times and the resulting delays, and re-fetches them from AeroDataBox.
//
// Used by the passport "Resolve flights" flow and by an automatic pass that runs
// when the Journeys tab opens, so flights added early update themselves later.
import {
  lookupFlight,
  normaliseFlightNumber,
  flightLookupConfigured,
  type FlightInfo,
} from './flightLookup';
import type { Expedition, Journey } from '../types';

type UpdateExpedition = (
  id: string,
  input: { title: string; countryCodes: string[]; startDate?: string; endDate?: string; journeys: Journey[]; note?: string },
) => Promise<void>;

// BASIC plan is rate-limited per second — space sequential lookups out.
const RATE_DELAY_MS = 1500;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** The date a flight leg happened on: its own date, else the trip start. */
export function legFlightDate(j: Journey, tripStart?: string): string | undefined {
  const d = (j.date || tripStart || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined;
}

/** A flight leg with a usable number + date, so AeroDataBox can look it up. */
export function canLookupFlight(j: Journey, tripStart?: string): boolean {
  if (j.mode !== 'flight') return false;
  return normaliseFlightNumber(j.reference ?? '').length >= 3 && !!legFlightDate(j, tripStart);
}

/** Labels for the enrichable data points a flight leg is still missing. */
export function missingDataPoints(j: Journey): string[] {
  const miss: string[] = [];
  if (!j.from?.trim() || !j.to?.trim()) miss.push('route');
  if (!j.operator?.trim()) miss.push('airline');
  if (!j.vehicle?.trim()) miss.push('aircraft');
  if (!j.departTime?.trim() || !j.arriveTime?.trim()) miss.push('times');
  if (!j.fromTerminal?.trim() && !j.toTerminal?.trim()) miss.push('terminals');
  if (j.distanceKm == null) miss.push('distance');
  if (j.durationMin == null) miss.push('duration');
  return miss;
}

/** True once a flight's scheduled arrival has passed (so actuals should exist). */
export function isFlightComplete(j: Journey, tripStart: string | undefined, nowMs: number): boolean {
  const d = legFlightDate(j, tripStart);
  if (!d) return false;
  const hhmm = j.arriveTime && /^\d{2}:\d{2}$/.test(j.arriveTime) ? j.arriveTime : '23:59';
  const t = Date.parse(`${d}T${hhmm}:00`);
  return !Number.isNaN(t) && t < nowMs;
}

/** A completed flight that still has no recorded actual arrival / delay. */
export function needsActuals(j: Journey, tripStart: string | undefined, nowMs: number): boolean {
  return j.arriveDelayMin == null && !j.arriveActual?.trim() && isFlightComplete(j, tripStart, nowMs);
}

/** Merge a lookup result into a leg: fill blank fields (never overwriting what
 *  the member typed) and always take freshly-available actuals / delays. Returns
 *  the original leg unchanged when the lookup added nothing new. */
export function mergeFlightInfo(j: Journey, info: FlightInfo): Journey {
  const next: Journey = { ...j };
  let changed = false;
  if (info.from && !next.from?.trim()) { next.from = info.from; changed = true; }
  if (info.to && !next.to?.trim()) { next.to = info.to; changed = true; }
  if (info.airline && !next.operator?.trim()) { next.operator = info.airline; changed = true; }
  if (info.aircraft && !next.vehicle?.trim()) { next.vehicle = info.aircraft; changed = true; }
  if (info.departTimeLocal && !next.departTime?.trim()) { next.departTime = info.departTimeLocal; changed = true; }
  if (info.arriveTimeLocal && !next.arriveTime?.trim()) { next.arriveTime = info.arriveTimeLocal; changed = true; }
  if (info.fromTerminal && !next.fromTerminal?.trim()) { next.fromTerminal = info.fromTerminal; changed = true; }
  if (info.toTerminal && !next.toTerminal?.trim()) { next.toTerminal = info.toTerminal; changed = true; }
  if (info.distanceKm != null && next.distanceKm == null) { next.distanceKm = info.distanceKm; changed = true; }
  if (info.durationMin != null && next.durationMin == null) { next.durationMin = info.durationMin; changed = true; }
  // Actuals & delays come only from the API — take them whenever newly present.
  if (info.departActualLocal && info.departActualLocal !== next.departActual) { next.departActual = info.departActualLocal; changed = true; }
  if (info.arriveActualLocal && info.arriveActualLocal !== next.arriveActual) { next.arriveActual = info.arriveActualLocal; changed = true; }
  if (info.departDelayMin != null && info.departDelayMin !== next.departDelayMin) { next.departDelayMin = info.departDelayMin; changed = true; }
  if (info.arriveDelayMin != null && info.arriveDelayMin !== next.arriveDelayMin) { next.arriveDelayMin = info.arriveDelayMin; changed = true; }
  return changed ? next : j;
}

export interface Enrichable {
  expId: string;
  title: string;
  legId: string;
  j: Journey;
  reasons: string[];
}

/** Flight legs worth (re)fetching. `mode`:
 *   - 'actuals' → only completed flights missing their actuals (automatic pass)
 *   - 'missing' → any flight missing at least one gatherable data point
 *   - 'all'     → either of the above (manual "Resolve flights")
 */
export function findEnrichable(expeditions: Expedition[], nowMs: number, mode: 'actuals' | 'missing' | 'all'): Enrichable[] {
  const out: Enrichable[] = [];
  for (const e of expeditions) {
    for (const j of e.journeys ?? []) {
      if (!canLookupFlight(j, e.startDate)) continue;
      const miss = missingDataPoints(j);
      const wantActuals = needsActuals(j, e.startDate, nowMs);
      const take = mode === 'actuals' ? wantActuals : mode === 'missing' ? miss.length > 0 : wantActuals || miss.length > 0;
      if (!take) continue;
      const reasons = [...miss];
      if (wantActuals) reasons.push('actual times');
      out.push({ expId: e.id, title: e.title, legId: j.id, j, reasons });
    }
  }
  return out;
}

export interface EnrichResult { updated: number; scanned: number; failed: number }

/** Look up and patch every enrichable flight leg, spacing calls to respect the
 *  API rate limit and batching writes per expedition. */
export async function enrichFlights(
  expeditions: Expedition[],
  updateExpedition: UpdateExpedition,
  opts: { nowMs: number; mode: 'actuals' | 'missing' | 'all'; max?: number },
): Promise<EnrichResult> {
  if (!flightLookupConfigured()) return { updated: 0, scanned: 0, failed: 0 };
  const candidates = findEnrichable(expeditions, opts.nowMs, opts.mode).slice(0, opts.max ?? 40);
  const patchedByExp = new Map<string, Map<string, Journey>>();
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const e = expeditions.find((x) => x.id === c.expId);
    if (!e) continue;
    const date = legFlightDate(c.j, e.startDate);
    if (!date) continue;
    const r = await lookupFlight(c.j.reference ?? '', date);
    if (r.ok) {
      const merged = mergeFlightInfo(c.j, r.info);
      if (merged !== c.j) {
        let legs = patchedByExp.get(c.expId);
        if (!legs) { legs = new Map(e.journeys.map((j) => [j.id, j])); patchedByExp.set(c.expId, legs); }
        legs.set(c.legId, merged);
        updated += 1;
      }
    } else if (r.reason === 'error') {
      failed += 1;
    }
    if (i < candidates.length - 1) await delay(RATE_DELAY_MS);
  }

  for (const [expId, legs] of patchedByExp) {
    const e = expeditions.find((x) => x.id === expId);
    if (!e) continue;
    await updateExpedition(expId, { title: e.title, countryCodes: e.countryCodes, startDate: e.startDate, endDate: e.endDate, journeys: [...legs.values()], note: e.note });
  }
  return { updated, scanned: candidates.length, failed };
}
