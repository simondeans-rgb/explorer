import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COVER_SECTIONS, lockReason, type CoverDef } from '../lib/covers';
import type { CelebrationItem } from '../../components/Celebration';

/** Every cover that has to be *earned* through a travel milestone. */
const MILESTONE_COVERS: CoverDef[] = COVER_SECTIONS.flatMap((s) => s.covers).filter((c) => !!c.unlock && !!c.name);

/** Watches the earned Passport Covers and fires a celebration the moment a new
 *  one is unlocked by a milestone (R29) — the covers already exist as earned
 *  collectibles; this makes crossing the threshold a felt moment. The set of
 *  already-unlocked covers is seeded silently per user on first load, so
 *  pre-earned covers never re-celebrate. */
export function useCoverUnlockWatch(
  uid: string | null,
  loaded: boolean,
  countries: number,
  level: number,
  celebrate: (item: CelebrationItem) => void,
) {
  const key = `worldly:covers:v1:${uid ?? 'local'}`;
  const baseline = useRef<Set<string> | null>(null);
  const [baselineLoaded, setBaselineLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setBaselineLoaded(false);
    baseline.current = null;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          try {
            baseline.current = new Set(JSON.parse(raw) as string[]);
          } catch {
            /* ignore corrupt */
          }
        }
        setBaselineLoaded(true);
      })
      .catch(() => active && setBaselineLoaded(true));
    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!loaded || !baselineLoaded) return;
    const unlocked = MILESTONE_COVERS.filter((c) => !lockReason(c, countries, level)).map((c) => c.name as string);

    // First run for this user: capture state without celebrating.
    if (!baseline.current) {
      baseline.current = new Set(unlocked);
      AsyncStorage.setItem(key, JSON.stringify([...baseline.current])).catch(() => {});
      return;
    }

    const fresh = unlocked.filter((n) => !baseline.current!.has(n));
    if (fresh.length > 0) {
      for (const n of fresh) {
        const cover = MILESTONE_COVERS.find((c) => c.name === n);
        celebrate({ emoji: '🎨', title: 'New cover unlocked', subtitle: cover?.title, variant: 'confetti' });
        baseline.current!.add(n);
      }
      AsyncStorage.setItem(key, JSON.stringify([...baseline.current])).catch(() => {});
    }
  }, [loaded, baselineLoaded, countries, level, key, celebrate]);
}
