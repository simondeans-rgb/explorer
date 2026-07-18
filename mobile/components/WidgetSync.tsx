import { useEffect } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { reportError } from '../src/lib/sentry';

interface WidgetBridge {
  setWidgetData(json: string): Promise<boolean>;
}

// Null on binaries built before the widget existed — those have nothing to sync.
const bridge = requireOptionalNativeModule<WidgetBridge>('WorldlyWidgetBridge');

/** Pushes headline stats into the shared app group for the home-screen widget
 *  (countries, cities, level, next-trip countdown) and asks WidgetKit to
 *  refresh. Renders nothing. */
export function WidgetSync() {
  const { stats, level } = useWorldly();
  const { trips } = useData();

  const today = new Date().toISOString().slice(0, 10);
  const next = trips
    .filter((t) => t.startDate && t.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  const payload = JSON.stringify({
    countries: stats.countriesDiscovered,
    cities: stats.citiesDiscovered,
    level: level.level,
    nextTripTitle: next?.title ?? null,
    nextTripDate: next?.startDate ?? null,
  });

  useEffect(() => {
    if (Platform.OS !== 'ios' || !bridge) return;
    bridge.setWidgetData(payload).catch((e) => reportError(e, { where: 'widgetSync' }));
  }, [payload]);

  return null;
}
