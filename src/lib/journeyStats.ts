import { JOURNEY_MODES, type Expedition, type JourneyMode } from '../types';

export interface JourneyStats {
  total: number;
  byMode: Record<JourneyMode, number>;
}

export function computeJourneyStats(expeditions: Expedition[]): JourneyStats {
  const byMode = Object.fromEntries(
    JOURNEY_MODES.map((m) => [m, 0]),
  ) as Record<JourneyMode, number>;
  let total = 0;
  for (const e of expeditions) {
    for (const j of e.journeys ?? []) {
      byMode[j.mode] = (byMode[j.mode] ?? 0) + 1;
      total += 1;
    }
  }
  return { total, byMode };
}
