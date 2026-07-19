import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { useCoverTheme } from '../src/hooks/useCoverTheme';
import { todaysMemories } from '../src/lib/memories';
import { destinationImage, hasDestinationPhoto } from '../src/lib/destinationImage';
import { countryName } from '../src/data/countries';
import { reportError } from '../src/lib/sentry';

interface WidgetBridge {
  setWidgetData(json: string): Promise<boolean>;
  /** Optional — present only on binaries built with the photo widget. */
  setWidgetImage?(base64: string): Promise<boolean>;
}

// Null on binaries built before the widget existed — those have nothing to sync.
const bridge = requireOptionalNativeModule<WidgetBridge>('WorldlyWidgetBridge');

/** Blend two hex colours: `t` of `a` + `(1-t)` of `b`. */
function mix(a: string, b: string, t: number): string {
  const ch = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16);
  const to = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  const r = ch(a, 1) * t + ch(b, 1) * (1 - t);
  const g = ch(a, 3) * t + ch(b, 3) * (1 - t);
  const bl = ch(a, 5) * t + ch(b, 5) * (1 - t);
  return `#${to(r)}${to(g)}${to(bl)}`;
}

/** The no-photo fallback background: a deep, clean near-black tinted only
 *  faintly toward the cover accent — the accent glow (drawn natively) supplies
 *  the colour pop, so the base stays rich rather than muddy. */
function widgetGradient(accent: string): [string, string] {
  return [mix(accent, '#0E1524', 0.1), mix(accent, '#070A12', 0.03)];
}

/** Turn a widget-hero source — a user capture (data URL or Storage URL) or a
 *  stock destination URL — into a downscaled base64 JPEG for the widget.
 *  Best-effort: any failure (bad download, unreadable file, decode error)
 *  returns null and the widget falls back to its gradient. */
async function sourceToBase64(src: string): Promise<string | null> {
  try {
    const FS = await import('expo-file-system/legacy');
    const localUri = `${FS.cacheDirectory}widget-src-in.jpg`;
    if (src.startsWith('data:')) {
      const b64 = src.split(',')[1] ?? '';
      if (!b64) return null;
      await FS.writeAsStringAsync(localUri, b64, { encoding: FS.EncodingType.Base64 });
    } else {
      const res = await FS.downloadAsync(src, localUri);
      if (res.status !== 200) return null; // 404/redirect/HTML — not an image
    }
    const out = await manipulateAsync(localUri, [{ resize: { width: 680 } }], {
      compress: 0.72,
      format: SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ?? null;
  } catch {
    // Missing stock image, offline, or an unreadable cache file — non-critical.
    return null;
  }
}

/** Pushes a rich snapshot into the shared app group for the home-screen and
 *  Lock Screen widgets: headline stats, level progress, next-trip countdown,
 *  a flag strip of recent countries, an "on this day" memory, and the active
 *  Passport Cover's colours (so the widget matches the app you've styled).
 *  Renders nothing. */
export function WidgetSync() {
  const { stats, level, places, expeditions } = useWorldly();
  const { trips, captures } = useData();
  const theme = useCoverTheme();

  // The user's own most-recent photo for a country, if they have one.
  const userPhotoFor = (code: string): string | null => {
    const caps = captures.filter((c) => c.countryCode === code && c.dataUrl);
    if (!caps.length) return null;
    caps.sort((a, b) => (b.takenAt ?? b.createdAt ?? 0) - (a.takenAt ?? a.createdAt ?? 0));
    return caps[0].dataUrl;
  };
  const hasAnyPhoto = (code: string) => !!userPhotoFor(code) || hasDestinationPhoto(code);

  const today = new Date().toISOString().slice(0, 10);
  const next = trips
    .filter((t) => t.startDate && t.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  // Recent countries → a flag strip. Most recent travel year first.
  const recentFlags = places
    .filter((p) => p.kind === 'country' && p.countryCode)
    .sort((a, b) => (b.firstYear ?? 0) - (a.firstYear ?? 0) || (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .map((p) => p.countryCode)
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .slice(0, 10);

  // "On this day" — the standout memory for today, if any.
  const memory = todaysMemories(expeditions, places)[0];

  // Featured destination for the widget's full-bleed photo: your next trip's
  // country, else the most recent country you've logged — provided it has a
  // photo of some kind (your own, or stock).
  const featuredCode =
    next?.countryCode && hasAnyPhoto(next.countryCode)
      ? next.countryCode
      : recentFlags.find(hasAnyPhoto) ?? null;
  // Prefer the user's own photo of that country; fall back to the stock hero.
  const featuredSrc = featuredCode
    ? userPhotoFor(featuredCode) ?? destinationImage(featuredCode).photo ?? null
    : null;

  const payload = JSON.stringify({
    countries: stats.countriesDiscovered,
    cities: stats.citiesDiscovered,
    continents: stats.continentsDiscovered,
    level: level.level,
    levelTitle: level.title,
    levelProgress: Math.round(level.progress * 100) / 100,
    nextTitle: level.nextTitle ?? null,
    nextTripTitle: next?.title ?? null,
    nextTripDate: next?.startDate ?? null,
    recentFlags,
    memoryLabel: memory?.label ?? null,
    memoryYearsAgo: memory?.yearsAgo ?? null,
    memoryCountry: memory?.countryCode ?? null,
    featured: featuredCode ? countryName(featuredCode) : null,
    accent: theme.accent,
    gradientTop: widgetGradient(theme.accent)[0],
    gradientBottom: widgetGradient(theme.accent)[1],
  });

  // Don't overwrite good widget data with an empty snapshot. On a fresh launch
  // (and briefly after an app update) the stores are still loading, so stats
  // read 0 — writing that would blank the widget until the next sync. Skip
  // empty writes so the last real numbers stay put until the data is back.
  const emptySnapshot =
    stats.countriesDiscovered === 0 &&
    stats.citiesDiscovered === 0 &&
    recentFlags.length === 0 &&
    !next &&
    !memory;

  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge || emptySnapshot) return;
    bridge.setWidgetData(payload).catch((e) => reportError(e, { where: 'widgetSync' }));
  }, [payload, emptySnapshot]);

  // Fetch + downscale the featured photo into the shared container (only when
  // the source changes; the image is heavier than the JSON snapshot). A user
  // capture takes priority over stock, so adding your own photo updates it.
  const lastImageSrc = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge?.setWidgetImage) return;
    if (featuredSrc === lastImageSrc.current) return;
    lastImageSrc.current = featuredSrc;
    (async () => {
      try {
        if (!featuredSrc) {
          await bridge.setWidgetImage!('');
          return;
        }
        const base64 = await sourceToBase64(featuredSrc);
        // '' clears the hero so the widget shows its gradient — never errors.
        await bridge.setWidgetImage!(base64 ?? '');
      } catch {
        // Non-critical: leave whatever hero was there.
      }
    })();
  }, [featuredSrc]);

  return null;
}
