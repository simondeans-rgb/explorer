import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { countryName } from '../src/data/countries';
import { autoStopIfTripEnded, flushVisitQueue } from '../src/lib/tracking';

/** Drains background-tracking visits into the user's map whenever the app comes
 *  to the foreground, and stops tracking once a trip's end date has passed.
 *  Renders nothing — mount once inside the data + toast providers. */
export function LocationSync() {
  const { places, addPlace } = useData();
  const { toast } = useToast();
  const placesRef = useRef(places);
  placesRef.current = places;

  const sync = useCallback(async () => {
    const ended = await autoStopIfTripEnded();
    if (ended) toast.info(`Tracking stopped — ${ended} has ended.`);

    const visits = await flushVisitQueue();
    if (!visits.length) return;

    const cur = placesRef.current;
    const addedCountries = new Set<string>();
    const addedCities = new Set<string>();
    const labels: string[] = [];
    for (const v of visits) {
      const cc = v.countryCode;
      const hasCountry = cur.some((p) => p.kind === 'country' && p.countryCode === cc && p.relationships.some((r) => r !== 'aspiring'));
      if (!hasCountry && !addedCountries.has(cc)) {
        addPlace({ kind: 'country', countryCode: cc, relationships: ['visited'], firstDate: v.date });
        addedCountries.add(cc);
        labels.push(countryName(cc) || cc);
      }
      if (v.city) {
        const cityKey = `${cc}|${v.city.trim().toLowerCase()}`;
        const hasCity = cur.some((p) => p.kind === 'city' && p.countryCode === cc && p.name.trim().toLowerCase() === v.city!.trim().toLowerCase());
        if (!hasCity && !addedCities.has(cityKey)) {
          addPlace({ kind: 'city', countryCode: cc, name: v.city, relationships: ['visited'], firstDate: v.date });
          addedCities.add(cityKey);
          labels.push(v.city);
        }
      }
    }
    if (labels.length) toast.success(`Added ${labels.slice(0, 4).join(' · ')}${labels.length > 4 ? ` +${labels.length - 4}` : ''} to your map ✓`);
  }, [addPlace, toast]);

  useEffect(() => {
    sync();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') sync();
    });
    return () => sub.remove();
  }, [sync]);

  return null;
}
