// Founding-explorer cohort. The launch build records when this install first
// opened the app; when paid Explorer activates later, anyone whose first-seen
// date predates the cutover can be grandfathered ("introductory offer: every
// feature free for early explorers"). This date cannot be reconstructed after
// the fact, so it must ship in the launch build. Never throws.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'worldly:firstSeen';

let cached: string | null | undefined;

/** Record the first-open date once. Call at app start; later calls no-op. */
export async function recordFirstSeen(): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing) {
      cached = existing;
      return;
    }
    const now = new Date().toISOString();
    await AsyncStorage.setItem(KEY, now);
    cached = now;
  } catch {
    // cohort tracking must never break startup
  }
}

/** ISO date this install first opened Worldly, or null if unknown. */
export async function firstSeenDate(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    cached = await AsyncStorage.getItem(KEY);
  } catch {
    cached = null;
  }
  return cached;
}
