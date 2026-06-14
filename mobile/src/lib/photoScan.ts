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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Resolve `p`, or null if it doesn't settle within `ms` — so a single asset
 *  that hangs (e.g. an iCloud download) can never freeze the whole scan. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p.catch(() => null), new Promise<null>((res) => setTimeout(() => res(null), ms))]);
}

/** Local-only asset info (no iCloud network round-trip, which can hang), with a
 *  hard timeout fallback. */
function assetInfo(a: MediaLibrary.Asset) {
  return withTimeout(MediaLibrary.getAssetInfoAsync(a, { shouldDownloadFromNetwork: false }), 4000);
}

/** Scan the whole library (paged) for geotagged photos. Photos taken while you
 *  lived somewhere (per `home`) are ignored, so home time isn't recorded as a
 *  trip. `maxAssets` is a safety ceiling for very large libraries. */
export async function scanPhotosForCountries(
  onProgress?: (p: ScanProgress) => void,
  home: HomeRange[] = [],
  maxAssets = 30000,
): Promise<{ rows: PlaceRow[]; scanned: number; denied?: boolean; limited?: boolean }> {
  // Ask for full ("all") access; on iOS the user may still grant "limited".
  const perm = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  if (!perm.granted) return { rows: [], scanned: 0, denied: true };
  const limited = perm.accessPrivileges === 'limited';

  const coordCache = new Map<string, string | null>();
  const earliestYear = new Map<string, number | undefined>(); // code -> earliest year seen
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

    // Fetch GPS in small parallel batches (getAssetInfoAsync is a native call).
    for (const group of chunk(page.assets, 8)) {
      const infos = await Promise.all(group.map((a) => assetInfo(a)));
      for (let i = 0; i < group.length; i++) {
        scanned++;
        const asset = group[i];
        const loc = infos[i]?.location;
        if (!loc) continue;
        const key = `${loc.latitude.toFixed(1)},${loc.longitude.toFixed(1)}`;
        let code = coordCache.get(key);
        if (code === undefined) {
          code = countryAt(loc.longitude, loc.latitude) ?? null;
          coordCache.set(key, code);
        }
        if (!code) continue;
        // Ignore photos taken while you lived there — that's home, not a trip.
        if (isHome(home, code, asset.creationTime ?? Date.now())) continue;
        // creationTime is ms since epoch; keep the EARLIEST year per country.
        const year = asset.creationTime ? new Date(asset.creationTime).getFullYear() : undefined;
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

  onProgress?.({ scanned, countries: earliestYear.size, done: true });
  const rows: PlaceRow[] = [...earliestYear.entries()].map(([code, year]) => ({
    kind: 'country',
    countryCode: code,
    firstYear: year,
  }));
  return { rows, scanned, limited };
}
