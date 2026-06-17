// Background trip tracking (Option B). While a trip is on, the OS delivers
// location updates to a background task even when the app is closed; the task
// reverse-geocodes each fix to a country + city and queues it. The app drains
// that queue into your map on next foreground (the queue avoids needing an
// authenticated Firestore context inside the headless task).
//
// Background location only works in a real build (dev build / TestFlight /
// App Store) — never in Expo Go. Callers must gate on `backgroundTrackingAvailable()`
// and fall back to the foreground check-in (src/lib/checkIn.ts) otherwise.
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export const LOCATION_TASK = 'worldly-bg-location';
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

/** Background location runs in a real build, not Expo Go. */
export function backgroundTrackingAvailable(): boolean {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

const visitKey = (v: { countryCode: string; city?: string }) => `${v.countryCode}|${(v.city ?? '').trim().toLowerCase()}`;

async function loadQueue(): Promise<Visit[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Visit[]) : [];
  } catch {
    return [];
  }
}
async function saveQueue(q: Visit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
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

// The headless background task: reverse-geocode each location and enqueue any
// new country/city. Defined at module load so the OS can find it on relaunch.
try {
  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: { data?: { locations?: { coords: { latitude: number; longitude: number } }[] }; error?: unknown }) => {
    if (error || !data?.locations?.length) return;
    try {
      const Location = await import('expo-location');
      const queue = await loadQueue();
      const seen = new Set(queue.map(visitKey));
      const today = new Date().toISOString().slice(0, 10);
      for (const loc of data.locations) {
        const geos = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const a = geos[0];
        const countryCode = a?.isoCountryCode?.toUpperCase();
        if (!countryCode) continue;
        const city = a?.city ?? a?.subregion ?? a?.district ?? a?.region ?? undefined;
        const v: Visit = { countryCode, city: city ?? undefined, date: today };
        const k = visitKey(v);
        if (!seen.has(k)) {
          seen.add(k);
          queue.push(v);
        }
      }
      await saveQueue(queue);
    } catch {
      /* ignore — try again on the next fix */
    }
  });
} catch {
  /* defineTask can throw if the native module is unavailable; ignore */
}

export async function getTrackingState(): Promise<TrackingState | null> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as TrackingState) : null;
  } catch {
    return null;
  }
}

export async function isTrackingTrip(tripId: string): Promise<boolean> {
  return (await getTrackingState())?.tripId === tripId;
}

export type StartResult = 'started' | 'denied-foreground' | 'denied-background' | 'unsupported' | 'error';

type LocationModule = typeof import('expo-location');

async function stopUpdates(Location: LocationModule): Promise<void> {
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    }
  } catch {
    /* ignore */
  }
}

/** Begin background tracking for a trip. Requests foreground + "Always" perms. */
export async function startTripTracking(trip: { id: string; title?: string; endDate?: string }): Promise<StartResult> {
  if (!backgroundTrackingAvailable()) return 'unsupported';
  try {
    const Location = await import('expo-location');
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') return 'denied-foreground';
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== 'granted') return 'denied-background';

    await stopUpdates(Location); // replace any prior trip's tracking
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 3000, // a new fix roughly every 3 km of movement
      deferredUpdatesInterval: 15 * 60 * 1000,
      deferredUpdatesDistance: 3000,
      pausesUpdatesAutomatically: true,
      activityType: Location.ActivityType.OtherNavigation,
      showsBackgroundLocationIndicator: false,
      foregroundService: {
        notificationTitle: 'Worldly is logging your trip',
        notificationBody: 'Adding the places you visit to your map.',
        notificationColor: '#FF6A55',
      },
    });
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify({ tripId: trip.id, tripTitle: trip.title, endDate: trip.endDate } satisfies TrackingState));
    return 'started';
  } catch {
    return 'error';
  }
}

export async function stopTripTracking(): Promise<void> {
  try {
    const Location = await import('expo-location');
    await stopUpdates(Location);
  } catch {
    /* ignore */
  }
  try {
    await AsyncStorage.removeItem(STATE_KEY);
  } catch {
    /* ignore */
  }
}

/** Stop tracking if the tracked trip's end date has passed. Returns the trip
 *  title if it just auto-stopped, so the app can let the traveller know. */
export async function autoStopIfTripEnded(): Promise<string | null> {
  const st = await getTrackingState();
  if (!st?.endDate) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (today > st.endDate) {
    await stopTripTracking();
    return st.tripTitle ?? 'your trip';
  }
  return null;
}
