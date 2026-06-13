import { useEffect } from 'react';
import { computeExplorerLevel, computeBadges } from '../lib/explorer';
import type { PassportStats } from '../lib/stats';
import type { DiscoveryStats } from '../lib/discoveryStats';
import type { JourneyStats } from '../lib/journeyStats';

type Celebrate = (c: { emoji: string; title: string; subtitle?: string }) => void;

interface Baseline {
  level: number;
  earned: string[];
}

/**
 * Watches derived achievements (explorer level + badges) and fires a celebration
 * whenever the Member crosses a new threshold. A per-user baseline is seeded
 * silently the first time data is ready, so pre-existing achievements never
 * re-celebrate; only genuinely new ones do.
 */
export function useAchievementWatch(
  userId: string | undefined,
  ready: boolean,
  stats: PassportStats,
  discovery: DiscoveryStats,
  journeys: JourneyStats,
  celebrate: Celebrate,
): void {
  useEffect(() => {
    if (!userId || !ready) return;

    const level = computeExplorerLevel(stats, discovery, journeys);
    const badges = computeBadges({ stats, discovery, journeys });
    const earned = badges.filter((b) => b.earned).map((b) => b.id);

    const key = `worldly:ach:${userId}`;
    let prev: Baseline | null = null;
    try {
      const raw = localStorage.getItem(key);
      prev = raw ? (JSON.parse(raw) as Baseline) : null;
    } catch {
      prev = null;
    }

    const save = () => {
      try {
        localStorage.setItem(key, JSON.stringify({ level: level.level, earned }));
      } catch {
        /* ignore quota */
      }
    };

    // First time we have real data for this user — seed silently.
    if (!prev) {
      save();
      return;
    }

    if (level.level > prev.level) {
      celebrate({ emoji: '✨', title: `Level ${level.level}`, subtitle: level.title });
    }
    for (const b of badges) {
      if (b.earned && !prev.earned.includes(b.id)) {
        celebrate({ emoji: b.emoji, title: b.title, subtitle: b.description });
      }
    }

    if (level.level !== prev.level || earned.length !== prev.earned.length) {
      save();
    }
  }, [userId, ready, stats, discovery, journeys, celebrate]);
}
