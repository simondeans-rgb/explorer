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

/** Pushes a rich snapshot into the shared app group for the home-screen and
 *  Lock Screen widgets: headline stats, level progress, next-trip countdown,
 *  a flag strip of recent countries, an "on this day" memory, and the active
 *  Passport Cover's colours (so the widget matches the app you've styled).
 *  Renders nothing. */
export function WidgetSync() {
  const { stats, level, places, expeditions } = useWorldly();
  const { trips } = useData();
  const theme = useCoverTheme();

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
  // country, else the most recent country you've logged that has a photo.
  const featuredCode =
    next?.countryCode && hasDestinationPhoto(next.countryCode)
      ? next.countryCode
      : recentFlags.find((c) => hasDestinationPhoto(c)) ?? null;

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

  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge) return;
    bridge.setWidgetData(payload).catch((e) => reportError(e, { where: 'widgetSync' }));
  }, [payload]);

  // Fetch + downscale the featured destination photo into the shared container
  // (only when it changes; the image is heavier than the JSON snapshot).
  const lastImageCode = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge?.setWidgetImage) return;
    if (featuredCode === lastImageCode.current) return;
    lastImageCode.current = featuredCode;
    (async () => {
      try {
        const url = featuredCode ? destinationImage(featuredCode).photo : undefined;
        if (!url) {
          await bridge.setWidgetImage!('');
          return;
        }
        const FS = await import('expo-file-system/legacy');
        const dest = `${FS.cacheDirectory}widget-src.jpg`;
        await FS.downloadAsync(url, dest);
        const out = await manipulateAsync(dest, [{ resize: { width: 680 } }], {
          compress: 0.72,
          format: SaveFormat.JPEG,
          base64: true,
        });
        if (out.base64) await bridge.setWidgetImage!(out.base64);
      } catch (e) {
        reportError(e, { where: 'widgetImage' });
      }
    })();
  }, [featuredCode]);

  return null;
}
