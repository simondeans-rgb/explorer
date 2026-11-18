// Foreground visit queue + trip-tracking state. The app uses only when-in-use
// location (src/lib/checkIn.ts); it does NOT track location in the background.
// These helpers persist a small queue/state in AsyncStorage that the app drains
// on foreground — kept deliberately free of any background-location or
// TaskManager APIs so the binary never advertises background location
// (App Store Guideline 2.5.4).
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'worldly.visitQueue';
const STATE_KEY = 'worldly.trackingState';

export interface Visit {
  countryCode: string;
  city?: string;
  date: string; // ISO yyyy-mm-dd
}

export interface TrackingState {
  tripId: string;
  tripTitle?: string;
  endDate?: string;
}

async function loadQueue(): Promise<Visit[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Visit[]) : [];
  } catch {
    return [];
  }
}

/** Drain queued visits (clearing the queue). Called by the app on foreground. */
export async function flushVisitQueue(): Promise<Visit[]> {
  const q = await loadQueue();
  if (q.length) {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch {
      /* ignore */
    }
  }
  return q;
}

export async function getTrackingState(): Promise<TrackingState | null> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as TrackingState) : null;
  } catch {
    return null;
  }
}

async function clearTrackingState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STATE_KEY);
  } catch {
    /* ignore */
  }
}

/** Clear tracking state if the tracked trip's end date has passed. Returns the
 *  trip title if it just auto-cleared, so the app can let the traveller know. */
export async function autoStopIfTripEnded(): Promise<string | null> {
  const st = await getTrackingState();
  if (!st?.endDate) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (today > st.endDate) {
    await clearTrackingState();
    return st.tripTitle ?? 'your trip';
  }
  return null;
}
