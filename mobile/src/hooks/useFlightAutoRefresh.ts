// Automatically refreshes flights that have completed since they were added, so
// a flight logged ahead of time fills in its actual times / delays once flown.
//
// Runs at most once per app session, and only when there's actually a completed
// flight missing its actuals — so it stays quiet (and off the network) for
// members who don't pre-log flights or who have no API key configured.
import { useEffect, useRef } from 'react';
import type { Expedition, Journey } from '../types';
import { flightLookupConfigured } from '../lib/flightLookup';
import { findEnrichable, enrichFlights } from '../lib/flightRefresh';

type UpdateExpedition = (
  id: string,
  input: { title: string; countryCodes: string[]; startDate?: string; endDate?: string; journeys: Journey[]; note?: string },
) => Promise<void>;

let sessionRan = false;

export function useFlightAutoRefresh(expeditions: Expedition[], updateExpedition: UpdateExpedition) {
  const running = useRef(false);
  useEffect(() => {
    if (sessionRan || running.current || !flightLookupConfigured()) return;
    const now = Date.now();
    if (findEnrichable(expeditions, now, 'actuals').length === 0) return;
    running.current = true;
    sessionRan = true;
    enrichFlights(expeditions, updateExpedition, { nowMs: now, mode: 'actuals' })
      .catch(() => { sessionRan = false; }) // let it retry next session on failure
      .finally(() => { running.current = false; });
  }, [expeditions, updateExpedition]);
}
