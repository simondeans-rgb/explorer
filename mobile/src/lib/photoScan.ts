// Scan the photo library for geotagged photos and turn the locations into
// visited countries — recording each country against the EARLIEST photo year
// so the year-in-review and Atlas year filters stay accurate. Uses
// expo-media-library for GPS + capture date and an OFFLINE point-in-polygon
// lookup (no OS reverse geocoder, which iOS rate-limits/hangs).
import * as MediaLibrary from 'expo-media-library';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import type { PlaceRow } from './flightyImport';
import { isHome, type HomeRange } from './residence';
import { countryAt } from './geoLookup';

// Keep the screen on for the duration of a scan: a large library can take a
// while, and an auto-lock mid-scan would suspend JS and leave it unfinished.
const KEEP_AWAKE_TAG = 'worldly-photo-scan';

export interface ScanProgress {
  scanned: number;
  countries: number;
  done: boolean;
}

/** A photo that could illustrate a scanned country's page. */
export interface PhotoCandidate {
  /** file:// when the asset is local, else the ph:// library uri. */
  uri: string;
  takenAt?: number; // ms epoch
}

export interface ScanResult {
  rows: PlaceRow[];
  scanned: number;
  /** Items that carried a usable GPS location (diagnostic). */
  located: number;
  /** Up to a few representative photos per detected country, keyed by code —
   *  offered to the user (opt-in) as country-page captures. */
  photos: Record<string, PhotoCandidate[]>;
  denied?: boolean;
  limited?: boolean;
  partial?: boolean; // stopped early on an unexpected error
  cancelled?: boolean; // the user stopped the scan
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Resolve `p`, or null if it rejects or doesn't settle within `ms` — so a
 *  single asset that hangs (e.g. an iCloud lookup) can't freeze the scan.
 *  `download` allows fetching the location from iCloud for offloaded photos. */
function safeAssetInfo(a: MediaLibrary.Asset, ms: number, download: boolean): Promise<MediaLibrary.AssetInfo | null> {
  let work: Promise<MediaLibrary.AssetInfo | null>;
  try {
    work = MediaLibrary.getAssetInfoAsync(a, { shouldDownloadFromNetwork: download }).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
  return Promise.race([work, new Promise<null>((res) => setTimeout(() => res(null), ms))]);
}

export interface ScanOptions {
  /** Fetch locations from iCloud for offloaded photos — finds more countries
   *  but is slower and uses network data. */
  thorough?: boolean;
  maxAssets?: number;
  /** Set `cancelled` to true to stop the scan; whatever was gathered so far is
   *  still returned (with `cancelled: true` on the result). */
  cancel?: { cancelled: boolean };
}

/** Scan the whole library (paged) for geotagged photos. Photos taken while you
 *  lived somewhere (per `home`) are ignored, so home time isn't recorded as a
 *  trip. Never throws — returns whatever it gathered. */
export async function scanPhotosForCountries(
  onProgress?: (p: ScanProgress) => void,
  home: HomeRange[] = [],
  opts: ScanOptions = {},
): Promise<ScanResult> {
  const thorough = opts.thorough ?? false;
  // High enough to cover essentially any personal library — a lower cap could
  // truncate before reaching older trips (e.g. a holiday from several years ago).
  const maxAssets = opts.maxAssets ?? 200000;
  // Thorough mode pulls each missing location from iCloud, so allow longer per
  // asset and a gentler concurrency; the fast pass stays local-only.
  const perAssetMs = thorough ? 30000 : 12000;
  const concurrency = thorough ? 6 : 10;
  let perm;
  try {
    perm = await MediaLibrary.requestPermissionsAsync();
  } catch {
    return { rows: [], scanned: 0, located: 0, photos: {}, denied: true };
  }
  if (!perm.granted) return { rows: [], scanned: 0, located: 0, photos: {}, denied: true };
  const limited = perm.accessPrivileges === 'limited';

  const coordCache = new Map<string, string | null>();
  const earliestYear = new Map<string, number | undefined>();
  // Candidate captures: up to 3 photos per country, each from a different day
  // so a burst of near-identical shots doesn't fill all the slots.
  const candidates = new Map<string, (PhotoCandidate & { day: number })[]>();
  let after: string | undefined;
  let scanned = 0;
  let located = 0;
  let partial = false;

  // Best-effort: never let a keep-awake failure stop the scan.
  await activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});

  try {
    while (scanned < maxAssets) {
      const page = await MediaLibrary.getAssetsAsync({
        first: 100,
        after,
        // Videos carry GPS too — vacation memories are often mostly video, so
        // scanning both finds countries a photo-only scan would miss.
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      });
      if (page.assets.length === 0) break;

      for (const group of chunk(page.assets, concurrency)) {
        // iCloud-offloaded photos can be slow to surface their metadata, and a
        // too-short timeout silently dropped them (so whole trips stored in
        // iCloud went undetected). The keep-awake lock above means a longer,
        // more thorough scan won't be cut off by the screen locking.
        const infos = await Promise.all(group.map((a) => safeAssetInfo(a, perAssetMs, thorough)));
        for (let i = 0; i < group.length; i++) {
          scanned++;
          const loc = infos[i]?.location;
          if (!loc) continue;
          // The native module returns lat/lng as strings on iOS — coerce.
          const lat = Number(loc.latitude);
          const lng = Number(loc.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
          located++;
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
          // Remember a few stills as capture candidates (photos only — videos
          // can't become JPEG captures).
          if (group[i].mediaType === MediaLibrary.MediaType.photo) {
            const list = candidates.get(code) ?? [];
            const day = Math.floor(ts / 86400000);
            if (list.length < 3 && !list.some((c) => c.day === day)) {
              list.push({ uri: infos[i]?.localUri ?? group[i].uri, takenAt: group[i].creationTime || undefined, day });
              candidates.set(code, list);
            }
          }
        }
        onProgress?.({ scanned, countries: earliestYear.size, done: false });
        if (scanned >= maxAssets || opts.cancel?.cancelled) break;
      }
      if (opts.cancel?.cancelled) break;

      if (!page.hasNextPage) break;
      after = page.endCursor;
    }
  } catch {
    partial = true; // return whatever we managed to collect
  } finally {
    deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
  }

  onProgress?.({ scanned, countries: earliestYear.size, done: true });
  const rows: PlaceRow[] = [...earliestYear.entries()].map(([code, year]) => ({
    kind: 'country',
    countryCode: code,
    firstYear: year,
  }));
  const photos: Record<string, PhotoCandidate[]> = {};
  for (const [code, list] of candidates) {
    photos[code] = list.map(({ uri, takenAt }) => ({ uri, takenAt }));
  }
  return { rows, scanned, located, photos, limited, partial, cancelled: opts.cancel?.cancelled };
}
