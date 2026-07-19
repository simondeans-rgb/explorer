import { useEffect } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { useCoverTheme } from '../src/hooks/useCoverTheme';
import { todaysMemories } from '../src/lib/memories';
import { reportError } from '../src/lib/sentry';

interface WidgetBridge {
  setWidgetData(json: string): Promise<boolean>;
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

/** A cover's widget background: always a deep, premium dark gradient so white
 *  text stays legible — but tinted toward the cover's accent so each cover
 *  still reads as distinct. (Using a cover's own light gradient washed the
 *  text out.) */
function widgetGradient(accent: string): [string, string] {
  return [mix(accent, '#111A30', 0.22), mix(accent, '#080B16', 0.06)];
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
    accent: theme.accent,
    gradientTop: widgetGradient(theme.accent)[0],
    gradientBottom: widgetGradient(theme.accent)[1],
  });

  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge) return;
    bridge.setWidgetData(payload).catch((e) => reportError(e, { where: 'widgetSync' }));
  }, [payload]);

  return null;
}
