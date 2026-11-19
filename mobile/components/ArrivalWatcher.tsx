import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '../src/store/data';
import { useCelebration } from '../src/store/celebration';
import { useConfirm } from '../src/store/confirm';
import { useToast } from '../src/store/toast';
import { detectLocation } from '../src/lib/checkIn';
import { arrivalsEnabled } from '../src/lib/notifications';
import { countryMilestone } from '../src/lib/milestone';
import { countryName } from '../src/data/countries';
import { flagEmoji } from '../src/lib/flags';
import { track } from '../src/lib/analytics';

const SEEN_KEY = 'worldly:arrivals:seen';
const MIN_GAP_MS = 20 * 60_000; // don't re-check location on every app switch

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** The arrival moment. When you open Worldly somewhere that isn't on your map
 *  yet, it welcomes you there with an achievement-style celebration and adds
 *  the place — the map fills itself in as you travel.
 *
 *  Deliberately gentle:
 *  - foreground only, and only with location access you've ALREADY granted
 *    (it never shows the permission prompt itself);
 *  - at most once per place, ever (dismissals are remembered);
 *  - a new city in a country you live in is asked about rather than assumed —
 *    it may simply be home;
 *  - never for a brand-new, empty account (onboarding owns that moment).
 *  Renders nothing; mount once inside the data/celebration/confirm providers. */
export function ArrivalWatcher() {
  const { places, addPlace, loaded } = useData();
  const { celebrate } = useCelebration();
  const confirm = useConfirm();
  const { toast } = useToast();
  const placesRef = useRef(places);
  placesRef.current = places;
  const lastCheck = useRef(0);
  const busy = useRef(false);

  const check = useCallback(async () => {
    if (busy.current || Date.now() - lastCheck.current < MIN_GAP_MS) return;
    if (placesRef.current.length === 0) return;
    busy.current = true;
    try {
      if (!(await arrivalsEnabled())) return;
      const here = await detectLocation({ prompt: false });
      lastCheck.current = Date.now();
      if (here.status !== 'ok') return;

      const cc = here.countryCode;
      const city = here.city?.trim();
      const cur = placesRef.current;
      const countryPlace = cur.find((p) => p.kind === 'country' && p.countryCode === cc && p.relationships.some((r) => r !== 'aspiring'));
      const cityKnown = !city || cur.some((p) => p.kind === 'city' && p.countryCode === cc && p.name.trim().toLowerCase() === city.toLowerCase());
      // A city on the map implies its country (see stats.aggregateByCountry).
      const countryKnown = !!countryPlace || cur.some((p) => p.kind !== 'country' && p.countryCode === cc && p.relationships.some((r) => r !== 'aspiring'));
      if (countryKnown && cityKnown) return;

      // Once per place, whatever the answer was.
      const key = `${cc}|${(city ?? '').toLowerCase()}`;
      let seen: string[] = [];
      try {
        seen = JSON.parse((await AsyncStorage.getItem(SEEN_KEY)) || '[]');
      } catch {
        seen = [];
      }
      if (seen.includes(key)) return;
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...seen, key].slice(-200))).catch(() => {});

      const name = countryName(cc) || cc;
      const date = todayISO();

      if (!countryKnown) {
        // A whole new country: celebrate it (with its milestone if it earns one).
        const prior = new Set(cur.filter((p) => p.relationships.some((r) => r !== 'aspiring')).map((p) => p.countryCode));
        addPlace({ kind: 'country', countryCode: cc, relationships: ['visited'], firstDate: date });
        if (city) addPlace({ kind: 'city', countryCode: cc, name: city, relationships: ['visited'], firstDate: date });
        celebrate({ emoji: flagEmoji(cc), title: `Welcome to ${name}`, subtitle: city ? `${city} · a new country on your map` : 'A new country on your map' });
        const milestone = countryMilestone(prior, cc);
        if (milestone) celebrate(milestone);
        track('arrival_detected', { kind: 'country' });
        return;
      }

      if (!city) return;
      const livesHere = !!countryPlace?.relationships.some((r) => r === 'lived' || r === 'based' || r === 'born');
      if (livesHere) {
        // Could just be home — ask instead of assuming a trip.
        const yes = await confirm({
          title: `You’re in ${city}`,
          message: `${flagEmoji(cc)}  ${city} isn’t on your map yet. Add it?`,
          confirmLabel: 'Add to my world',
        });
        if (!yes) return;
        addPlace({ kind: 'city', countryCode: cc, name: city, relationships: ['visited'], firstDate: date });
        toast.success(`${city} added`);
      } else {
        addPlace({ kind: 'city', countryCode: cc, name: city, relationships: ['visited'], firstDate: date });
        celebrate({ emoji: '📍', title: `Welcome to ${city}`, subtitle: `A new city in ${name} · added to your map` });
      }
      track('arrival_detected', { kind: 'city' });
    } finally {
      busy.current = false;
    }
  }, [addPlace, celebrate, confirm, toast]);

  useEffect(() => {
    if (!loaded) return;
    // Let launch settle (auth gate, onboarding, any queued celebration) first.
    const t = setTimeout(check, 2500);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check();
    });
    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, [loaded, check]);

  return null;
}
