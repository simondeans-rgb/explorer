import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';

const APP_GROUP = 'group.com.simmyd23.worldly';

/** Pushes headline stats into the shared app group for the home-screen widget
 *  (countries, cities, level, next-trip countdown) and asks WidgetKit to
 *  refresh. Renders nothing. The ExtensionStorage native module only exists in
 *  binaries built with the widget — older builds no-op via the try/catch. */
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
    if (Platform.OS !== 'ios') return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: module absent in pre-widget binaries
      const { ExtensionStorage } = require('@bacons/apple-targets') as typeof import('@bacons/apple-targets');
      const storage = new ExtensionStorage(APP_GROUP);
      storage.set('widgetData', payload);
      ExtensionStorage.reloadWidget();
    } catch {
      /* binary without the widget module — nothing to sync */
    }
  }, [payload]);

  return null;
}
