// Scan the photo library for geotagged photos and turn the locations into
// visited countries. Uses expo-media-library to read each asset's GPS and
// expo-location to reverse-geocode it to an ISO country code.
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import type { PlaceRow } from './flightyImport';

export interface ScanProgress {
  scanned: number;
  max: number;
  countries: number;
}

export async function scanPhotosForCountries(
  onProgress?: (p: ScanProgress) => void,
  maxAssets = 250,
): Promise<{ rows: PlaceRow[]; scanned: number; denied?: boolean }> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) return { rows: [], scanned: 0, denied: true };
  await Location.requestForegroundPermissionsAsync().catch(() => {});

  const coordCache = new Map<string, string | null>();
  const countries = new Map<string, number | undefined>(); // code -> earliest year
  let after: string | undefined;
  let scanned = 0;

  while (scanned < maxAssets) {
    const page = await MediaLibrary.getAssetsAsync({
      first: 100,
      after,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });
    if (page.assets.length === 0) break;

    for (const asset of page.assets) {
      scanned++;
      try {
        const info = await MediaLibrary.getAssetInfoAsync(asset);
        const loc = info.location;
        if (loc) {
          const key = `${loc.latitude.toFixed(1)},${loc.longitude.toFixed(1)}`;
          let code = coordCache.get(key);
          if (code === undefined) {
            try {
              const geo = await Location.reverseGeocodeAsync({ latitude: loc.latitude, longitude: loc.longitude });
              code = geo[0]?.isoCountryCode ?? null;
            } catch {
              code = null;
            }
            coordCache.set(key, code);
          }
          if (code) {
            const year = asset.creationTime ? new Date(asset.creationTime).getFullYear() : undefined;
            const prev = countries.get(code);
            if (!countries.has(code) || (year && (!prev || year < prev))) countries.set(code, year);
          }
        }
      } catch {
        /* skip unreadable asset */
      }
      if (scanned % 5 === 0 || scanned >= maxAssets) {
        onProgress?.({ scanned, max: maxAssets, countries: countries.size });
      }
      if (scanned >= maxAssets) break;
    }
    if (!page.hasNextPage) break;
    after = page.endCursor;
  }

  onProgress?.({ scanned, max: maxAssets, countries: countries.size });
  const rows: PlaceRow[] = [...countries.entries()].map(([code, year]) => ({
    kind: 'country',
    countryCode: code.toUpperCase(),
    firstYear: year,
  }));
  return { rows, scanned };
}
