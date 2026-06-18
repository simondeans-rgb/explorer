// Export everything in the user's archive as a single JSON file and hand it to
// the share sheet — a simple "download my data" for GDPR/CCPA. Mirrors the
// itinerary-doc export (expo-file-system + expo-sharing; works in Expo Go).
import { writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';
import type { Place, Discovery, Expedition, Capture, Trip } from '../types';

export interface ExportInput {
  account?: { email?: string | null; name?: string | null };
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  captures: Capture[];
  trips: Trip[];
}

/** Build the JSON, write it, and open the share sheet. Returns false if sharing
 *  is unavailable on the device. */
export async function exportMyData(input: ExportInput): Promise<boolean> {
  const Sharing = await import('expo-sharing');
  const payload = {
    app: 'Worldly',
    schema: 1,
    exportedAt: new Date().toISOString(),
    account: { email: input.account?.email ?? null, name: input.account?.name ?? null },
    counts: {
      places: input.places.length,
      discoveries: input.discoveries.length,
      expeditions: input.expeditions.length,
      captures: input.captures.length,
      trips: input.trips.length,
    },
    data: {
      places: input.places,
      discoveries: input.discoveries,
      expeditions: input.expeditions,
      captures: input.captures,
      trips: input.trips,
    },
  };
  const json = JSON.stringify(payload, null, 2);
  const uri = `${cacheDirectory}worldly-data.json`;
  await writeAsStringAsync(uri, json);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export your Worldly data',
    UTI: 'public.json',
  });
  return true;
}
