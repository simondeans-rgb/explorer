import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExplorerLevel, Badge } from '../lib/explorer';
import type { CelebrationItem } from '../../components/Celebration';

interface Baseline {
  level: number;
  earned: string[];
}

/** Watches the explorer level + badges and fires a celebration when either
 *  advances. The current state is seeded silently per user on first load, so
 *  pre-existing achievements never re-celebrate. */
export function useAchievementWatch(
  uid: string | null,
  loaded: boolean,
  level: ExplorerLevel,
  badges: Badge[],
  celebrate: (item: CelebrationItem) => void,
) {
  // v2: bumped when the badge set expanded, so the baseline re-seeds silently
  // for everyone (no flood of pops for already-met new milestones).
  const key = `worldly:ach:v2:${uid ?? 'local'}`;
  const baseline = useRef<Baseline | null>(null);
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
            baseline.current = JSON.parse(raw) as Baseline;
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
    const earned = badges.filter((b) => b.earned).map((b) => b.id);

    // First run for this user: capture state without celebrating.
    if (!baseline.current) {
      baseline.current = { level: level.level, earned };
      AsyncStorage.setItem(key, JSON.stringify(baseline.current)).catch(() => {});
      return;
    }

    const base = baseline.current;
    const events: CelebrationItem[] = [];
    if (level.level > base.level) {
      events.push({ emoji: '✨', title: `Level ${level.level}`, subtitle: level.title });
    }
    for (const b of badges) {
      if (b.earned && !base.earned.includes(b.id)) {
        events.push({ emoji: b.emoji, title: b.title, subtitle: 'Badge unlocked' });
      }
    }

    if (events.length > 0) {
      events.forEach(celebrate);
      baseline.current = { level: level.level, earned };
      AsyncStorage.setItem(key, JSON.stringify(baseline.current)).catch(() => {});
    }
  }, [loaded, baselineLoaded, level.level, level.title, badges, key, celebrate]);
}
