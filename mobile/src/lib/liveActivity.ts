// The live-flight Live Activity (Lock Screen + Dynamic Island), driven from JS.
//
// The native module (modules/live-activity) is optional: it's absent in Expo
// Go, on Android and in binaries built before it existed, and Live Activities
// can be switched off in iOS Settings. Every call here is a safe no-op then.
import { requireOptionalNativeModule } from 'expo-modules-core';
import { iataFromLabel, airportTz, tzLocalTime, type TodaysFlight } from './liveFlight';
import type { FlightPhase } from './liveFlight';

interface LiveActivityNative {
  isSupported(): boolean;
  sync(attrs: Record<string, unknown>, state: Record<string, unknown>): Promise<boolean>;
  endAll(): Promise<boolean>;
}

const native = requireOptionalNativeModule<LiveActivityNative>('WorldlyLiveActivity');

export function liveActivitySupported(): boolean {
  try {
    return !!native && native.isSupported();
  } catch {
    return false;
  }
}

export interface FlightActivityInput {
  flight: TodaysFlight;
  phase: FlightPhase;
  departMs: number;
  arriveMs: number;
  gate?: string;
  terminal?: string;
  delayMin?: number;
}

const cityOf = (label?: string) => (label || '').split('(')[0].split(',')[0].trim();

/** The four states the Lock Screen / Dynamic Island draw. */
function activityPhase(phase: FlightPhase): 'scheduled' | 'boarding' | 'enroute' | 'landed' {
  if (phase === 'enroute' || phase === 'landed' || phase === 'boarding') return phase;
  if (phase === 'departed') return 'enroute'; // pushed back / taken off
  return 'scheduled';
}

/** A compact signature of what the activity shows, so callers only cross the
 *  native bridge when something visible actually changed. Times are rounded to
 *  the minute — the on-device countdown handles the seconds. */
export function flightActivitySignature(i: FlightActivityInput): string {
  return [
    i.flight.key,
    activityPhase(i.phase),
    Math.round(i.departMs / 60000),
    Math.round(i.arriveMs / 60000),
    i.gate ?? '',
    i.terminal ?? '',
    i.delayMin ?? '',
  ].join('|');
}

/** Start the activity for this flight, or update it if it's running. The
 *  native side is idempotent and ends the activity itself once landed. */
export async function syncFlightActivity(i: FlightActivityInput): Promise<boolean> {
  if (!native) return false;
  const fromCode = iataFromLabel(i.flight.fromLabel) ?? '';
  const toCode = iataFromLabel(i.flight.toLabel) ?? '';
  if (!fromCode || !toCode) return false;
  const fromTz = airportTz(fromCode);
  const toTz = airportTz(toCode);
  try {
    return await native.sync(
      {
        flightKey: i.flight.key,
        flightNumber: i.flight.flightNumber,
        fromCode,
        toCode,
        fromCity: cityOf(i.flight.fromLabel) || fromCode,
        toCity: cityOf(i.flight.toLabel) || toCode,
      },
      {
        phase: activityPhase(i.phase),
        departAt: i.departMs / 1000,
        arriveAt: i.arriveMs / 1000,
        // Clock times at each airport, not the phone's zone.
        departLabel: (fromTz && tzLocalTime(fromTz, new Date(i.departMs))) || i.flight.departTime || '',
        arriveLabel: (toTz && tzLocalTime(toTz, new Date(i.arriveMs))) || i.flight.arriveTime || '',
        ...(i.gate ? { gate: i.gate } : {}),
        ...(i.terminal ? { terminal: i.terminal } : {}),
        ...(typeof i.delayMin === 'number' ? { delayMin: Math.round(i.delayMin) } : {}),
      },
    );
  } catch {
    return false;
  }
}

export async function endFlightActivities(): Promise<void> {
  try {
    await native?.endAll();
  } catch {
    // nothing to end
  }
}
