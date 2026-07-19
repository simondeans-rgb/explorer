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
    gradientTop: theme.gradient[0],
    gradientBottom: theme.gradient[1],
  });

  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge) return;
    bridge.setWidgetData(payload).catch((e) => reportError(e, { where: 'widgetSync' }));
  }, [payload]);

  return null;
}
