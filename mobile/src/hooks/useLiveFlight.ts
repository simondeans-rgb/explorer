import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  derivePhase,
  flightProgress,
  minutesRemaining,
  positionAt,
  type FlightPhase,
  type TodaysFlight,
} from '../lib/liveFlight';
import { fetchLiveFlight, type LiveFlightStatus } from '../lib/flightStatus';

export interface LiveFlightState {
  status: LiveFlightStatus | null;
  phase: FlightPhase;
  progress: number; // 0→1
  minutesLeft: number;
  departMs?: number;
  arriveMs?: number;
  /** [lng, lat] — live when the provider reports it, else estimated on the arc. */
  position?: [number, number];
  positionIsLive: boolean;
  now: number;
}

/** How often to re-poll the provider, by phase — faster in the air (the plane
 *  moves) than on the ground, and rarely once landed. Keeps API spend bounded. */
function pollMs(phase: FlightPhase): number {
  switch (phase) {
    case 'enroute': return 120_000; // 2 min in the air
    case 'boarding': return 120_000;
    case 'landed': return 600_000; // 10 min (one confirmation then quiet)
    default: return 300_000; // 5 min pre-flight
  }
}

/** Drives the live-flight tile: fetches status/position for the given flight and
 *  re-polls on a phase-aware cadence, pausing when the app is backgrounded. */
export function useLiveFlight(flight: TodaysFlight | null): LiveFlightState {
  const [status, setStatus] = useState<LiveFlightStatus | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A gentle clock so progress + countdown advance between polls.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!flight) {
      setStatus(null);
      return;
    }
    let active = true;

    const tick = async () => {
      const s = await fetchLiveFlight(flight.flightNumber, flight.date, Date.now());
      if (!active) return;
      if (s) setStatus(s);
      setNow(Date.now());
      const departMs = s?.departActualMs ?? s?.departScheduledMs;
      const arriveMs = s?.arriveActualMs ?? s?.arriveScheduledMs;
      const phase = derivePhase(s?.statusText, departMs, arriveMs, Date.now());
      timer.current = setTimeout(tick, pollMs(phase));
    };
    tick();

    // Refresh immediately when the app returns to the foreground.
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') {
        if (timer.current) clearTimeout(timer.current);
        tick();
      }
    });

    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight?.key]);

  const departMs = status?.departActualMs ?? status?.departScheduledMs;
  const arriveMs = status?.arriveActualMs ?? status?.arriveScheduledMs;
  const phase = derivePhase(status?.statusText, departMs, arriveMs, now);
  const progress = flightProgress(departMs, arriveMs, now);
  const minutesLeft = minutesRemaining(arriveMs, now);

  const livePos: [number, number] | undefined = status?.position
    ? [status.position.lon, status.position.lat]
    : undefined;
  const estPos: [number, number] | undefined =
    flight?.fromCoord && flight?.toCoord ? positionAt(flight.fromCoord, flight.toCoord, progress) : undefined;

  return {
    status,
    phase,
    progress,
    minutesLeft,
    departMs,
    arriveMs,
    position: livePos ?? estPos,
    positionIsLive: !!livePos,
    now,
  };
}
