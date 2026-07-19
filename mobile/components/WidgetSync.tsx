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
import {
  pickWidgetTrip,
  pickNextAchievement,
  worldPercent,
  xpToNext,
  legibleAccentOnDark,
  WORLD_TOTAL,
} from '../src/lib/widgetPayload';
import { reportError } from '../src/lib/sentry';

interface WidgetBridge {
  setWidgetData(json: string): Promise<boolean>;
  /** Optional — present only on binaries built with the photo widget.
   *  `name` selects which hero image: 'hero' (general), 'trip', 'memory'. */
  setWidgetImage?(base64: string, name?: string): Promise<boolean>;
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
async function sourceToBase64(src: string, tag: string): Promise<string | null> {
  try {
    const FS = await import('expo-file-system/legacy');
    const localUri = `${FS.cacheDirectory}widget-src-${tag}.jpg`;
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
 *  Lock Screen widgets. Feeds a configurable, Passport-Cover-themed widget
 *  family — exploration progress, next trip, explorer level, world progress,
 *  next achievement and travel memory — each derived from live data via
 *  `widgetPayload`. Renders nothing. */
export function WidgetSync() {
  const { stats, level, places, expeditions, badges } = useWorldly();
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
  // Best available image for a country: the user's own photo, else the stock hero.
  const photoFor = (code: string): string | null =>
    userPhotoFor(code) ?? destinationImage(code).photo ?? null;

  const today = new Date().toISOString().slice(0, 10);
  const trip = pickWidgetTrip(trips, today);

  // Recent countries — kept only to choose an ambient hero photo for the
  // stats-led focuses (the widget no longer shows a flag strip).
  const recentCountries = places
    .filter((p) => p.kind === 'country' && p.countryCode)
    .sort((a, b) => (b.firstYear ?? 0) - (a.firstYear ?? 0) || (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .map((p) => p.countryCode)
    .filter((c, i, arr) => arr.indexOf(c) === i);

  // "On this day" — the standout memory for today, if any.
  const memory = todaysMemories(expeditions, places)[0];
  const memoryYear = memory ? new Date().getFullYear() - memory.yearsAgo : null;

  const nextAch = pickNextAchievement(badges);

  // Hero image (exploration / world / smart-ambient): the trip country if there
  // is one, else the most recent country you've logged — provided it has a photo.
  const heroCode =
    (trip?.countryCode && hasAnyPhoto(trip.countryCode) && trip.countryCode) ||
    recentCountries.find(hasAnyPhoto) ||
    null;
  const heroSrc = heroCode ? photoFor(heroCode) : null;
  // Per-focus heroes so Next Trip and Travel Memory each show the right place.
  const tripSrc = trip?.countryCode && hasAnyPhoto(trip.countryCode) ? photoFor(trip.countryCode) : null;
  const memorySrc = memory?.countryCode && hasAnyPhoto(memory.countryCode) ? photoFor(memory.countryCode) : null;

  const payload = JSON.stringify({
    countries: stats.countriesDiscovered,
    cities: stats.citiesDiscovered,
    continents: stats.continentsDiscovered,
    level: level.level,
    levelTitle: level.title,
    levelProgress: Math.round(level.progress * 100) / 100,
    nextTitle: level.nextTitle ?? null,
    xp: level.xp,
    xpToNext: xpToNext(level),
    worldTotal: WORLD_TOTAL,
    worldPercent: worldPercent(stats.countriesDiscovered),
    // Next trip (or the trip you're on).
    tripTitle: trip?.title ?? null,
    tripCountry: trip?.countryCode ? countryName(trip.countryCode) : null,
    tripCountryCode: trip?.countryCode ?? null,
    tripStatus: trip?.status ?? null, // upcoming | today | underway
    tripDays: trip?.days ?? null,
    tripDate: trip?.startDate ?? null,
    tripEnd: trip?.endDate ?? null,
    // Next achievement.
    achTitle: nextAch?.title ?? null,
    achValue: nextAch?.value ?? null,
    achTarget: nextAch?.target ?? null,
    achUnit: nextAch?.unit ?? null,
    achProgress: nextAch ? Math.round(nextAch.progress * 100) / 100 : null,
    // Travel memory ("on this day").
    memoryLabel: memory?.label ?? null,
    memoryYear,
    memoryCountry: memory?.countryCode ?? null,
    // Theming — accent for glows/rings; accentText a contrast-safe variant for
    // small labels on the deep background.
    accent: theme.accent,
    accentText: legibleAccentOnDark(theme.accent),
    gradientTop: widgetGradient(theme.accent)[0],
    gradientBottom: widgetGradient(theme.accent)[1],
  });

  // Don't overwrite good widget data with an empty snapshot. On a fresh launch
  // (and briefly after an app update) the stores are still loading, so stats
  // read 0 — writing that would blank the widget until the next sync.
  const emptySnapshot =
    stats.countriesDiscovered === 0 &&
    stats.citiesDiscovered === 0 &&
    !trip &&
    !memory;

  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge || emptySnapshot) return;
    bridge.setWidgetData(payload).catch((e) => reportError(e, { where: 'widgetSync' }));
  }, [payload, emptySnapshot]);

  // Push each keyed hero image only when its source changes (images are heavier
  // than the JSON). A user capture takes priority over stock, so adding your own
  // photo updates the widget.
  const pushImage = (src: string | null, key: 'hero' | 'trip' | 'memory', ref: React.MutableRefObject<string | null | undefined>) => {
    if (Platform.OS !== 'ios' || !bridge?.setWidgetImage) return;
    if (src === ref.current) return;
    ref.current = src;
    (async () => {
      try {
        if (!src) {
          await bridge.setWidgetImage!('', key);
          return;
        }
        const base64 = await sourceToBase64(src, key);
        // '' clears the hero so the widget shows its gradient — never errors.
        await bridge.setWidgetImage!(base64 ?? '', key);
      } catch {
        // Non-critical: leave whatever hero was there.
      }
    })();
  };

  const lastHero = useRef<string | null | undefined>(undefined);
  const lastTrip = useRef<string | null | undefined>(undefined);
  const lastMemory = useRef<string | null | undefined>(undefined);
  useEffect(() => { pushImage(heroSrc, 'hero', lastHero); }, [heroSrc]);
  useEffect(() => { pushImage(tripSrc, 'trip', lastTrip); }, [tripSrc]);
  useEffect(() => { pushImage(memorySrc, 'memory', lastMemory); }, [memorySrc]);

  return null;
}
