// Scan the photo library for geotagged photos and turn the locations into
// visited countries — recording each country against the EARLIEST photo year
// so the year-in-review and Atlas year filters stay accurate. Uses
// expo-media-library for GPS + capture date and an OFFLINE point-in-polygon
// lookup (no OS reverse geocoder, which iOS rate-limits/hangs).
import * as MediaLibrary from 'expo-media-library';
import type { PlaceRow } from './flightyImport';
import { isHome, type HomeRange } from './residence';
import { countryAt } from './geoLookup';

export interface ScanProgress {
  scanned: number;
  countries: number;
  done: boolean;
}

export interface ScanResult {
  rows: PlaceRow[];
  scanned: number;
  denied?: boolean;
  limited?: boolean;
  partial?: boolean; // stopped early on an unexpected error
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Resolve `p`, or null if it rejects or doesn't settle within `ms` — so a
 *  single asset that hangs (e.g. an iCloud lookup) can't freeze the scan. */
function safeAssetInfo(a: MediaLibrary.Asset, ms: number): Promise<MediaLibrary.AssetInfo | null> {
  let work: Promise<MediaLibrary.AssetInfo | null>;
  try {
    work = MediaLibrary.getAssetInfoAsync(a, { shouldDownloadFromNetwork: false }).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
  return Promise.race([work, new Promise<null>((res) => setTimeout(() => res(null), ms))]);
}

/** Scan the whole library (paged) for geotagged photos. Photos taken while you
 *  lived somewhere (per `home`) are ignored, so home time isn't recorded as a
 *  trip. Never throws — returns whatever it gathered. */
export async function scanPhotosForCountries(
  onProgress?: (p: ScanProgress) => void,
  home: HomeRange[] = [],
  maxAssets = 30000,
): Promise<ScanResult> {
  let perm;
  try {
    perm = await MediaLibrary.requestPermissionsAsync();
  } catch {
    return { rows: [], scanned: 0, denied: true };
  }
  if (!perm.granted) return { rows: [], scanned: 0, denied: true };
  const limited = perm.accessPrivileges === 'limited';

  const coordCache = new Map<string, string | null>();
  const earliestYear = new Map<string, number | undefined>();
  let after: string | undefined;
  let scanned = 0;
  let partial = false;

  try {
    while (scanned < maxAssets) {
      const page = await MediaLibrary.getAssetsAsync({
        first: 100,
        after,
        mediaType: MediaLibrary.MediaType.photo,
      });
      if (page.assets.length === 0) break;

      for (const group of chunk(page.assets, 6)) {
        const infos = await Promise.all(group.map((a) => safeAssetInfo(a, 4000)));
        for (let i = 0; i < group.length; i++) {
          scanned++;
          const loc = infos[i]?.location;
          if (!loc) continue;
          // The native module returns lat/lng as strings on iOS — coerce.
          const lat = Number(loc.latitude);
          const lng = Number(loc.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
          const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
          let code = coordCache.get(key);
          if (code === undefined) {
            try {
              code = countryAt(lng, lat) ?? null;
            } catch {
              code = null;
            }
            coordCache.set(key, code);
          }
          if (!code) continue;
          const ts = group[i].creationTime ?? Date.now();
          if (isHome(home, code, ts)) continue; // home time isn't a trip
          const year = group[i].creationTime ? new Date(group[i].creationTime).getFullYear() : undefined;
          const prev = earliestYear.get(code);
          if (!earliestYear.has(code)) earliestYear.set(code, year);
          else if (year && (!prev || year < prev)) earliestYear.set(code, year);
        }
        onProgress?.({ scanned, countries: earliestYear.size, done: false });
        if (scanned >= maxAssets) break;
      }

      if (!page.hasNextPage) break;
      after = page.endCursor;
    }
  } catch {
    partial = true; // return whatever we managed to collect
  }

  onProgress?.({ scanned, countries: earliestYear.size, done: true });
  const rows: PlaceRow[] = [...earliestYear.entries()].map(([code, year]) => ({
    kind: 'country',
    countryCode: code,
    firstYear: year,
  }));
  return { rows, scanned, limited, partial };
}
