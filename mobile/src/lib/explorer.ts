// Explorer level + badges — a playful progression layer computed entirely from
// existing data (no persistence). XP rewards breadth and depth of travel;
// badges celebrate specific milestones, earned or still-locked-with-progress.

import type { PassportStats } from './stats';
import type { DiscoveryStats } from './discoveryStats';
import type { JourneyStats } from './journeyStats';

export interface ExplorerLevel {
  level: number;
  title: string;
  xp: number;
  /** XP accumulated within the current level. */
  xpInLevel: number;
  /** XP needed to span the current level (in → next). */
  xpForLevel: number;
  /** 0–1 progress through the current level. */
  progress: number;
  /** Total XP required to reach the next level (absolute). */
  nextLevelXp: number;
  maxed: boolean;
}

// Playful titles per level band.
const TITLES = [
  'Daydreamer', // 1
  'Wanderer', // 2
  'Voyager', // 3
  'Globetrotter', // 4
  'Pathfinder', // 5
  'Trailblazer', // 6
  'Worldly Explorer', // 7
  'Master Navigator', // 8
  'Legendary Voyager', // 9
  'Citizen of the World', // 10+
];

/** Cumulative XP required to *reach* each level (index = level-1). */
const THRESHOLDS = [
  0, 150, 400, 800, 1400, 2200, 3200, 4500, 6200, 8500,
];

export function computeXp(
  stats: PassportStats,
  discovery: DiscoveryStats,
  journeys: JourneyStats,
): number {
  return (
    stats.countriesDiscovered * 100 +
    stats.citiesDiscovered * 25 +
    (stats.regionsDiscovered ?? 0) * 30 +
    stats.continentsDiscovered * 150 +
    discovery.total * 10 +
    journeys.total * 40
  );
}

export function computeExplorerLevel(
  stats: PassportStats,
  discovery: DiscoveryStats,
  journeys: JourneyStats,
): ExplorerLevel {
  const xp = computeXp(stats, discovery, journeys);

  let level = 1;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (xp >= THRESHOLDS[i]) level = i + 1;
  }
  const maxed = level >= THRESHOLDS.length;
  const floor = THRESHOLDS[level - 1];
  const ceil = maxed ? floor : THRESHOLDS[level];
  const xpForLevel = maxed ? 0 : ceil - floor;
  const xpInLevel = xp - floor;
  const progress = maxed ? 1 : Math.min(1, xpInLevel / xpForLevel);

  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    xp,
    xpInLevel,
    xpForLevel,
    progress,
    nextLevelXp: ceil,
    maxed,
  };
}

// ── Badges ───────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earned: boolean;
  /** 0–1 progress toward earning (1 when earned). */
  progress: number;
}

interface BadgeDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** current value / target → progress + earned. */
  value: (c: BadgeCtx) => number;
  target: number;
}

interface BadgeCtx {
  stats: PassportStats;
  discovery: DiscoveryStats;
  journeys: JourneyStats;
}

const BADGE_DEFS: BadgeDef[] = [
  { id: 'first-steps', title: 'First Steps', description: 'Add your first country', emoji: '🌱', value: (c) => c.stats.countriesDiscovered, target: 1 },
  { id: 'five-countries', title: 'Getting Around', description: 'Visit 5 countries', emoji: '🧭', value: (c) => c.stats.countriesDiscovered, target: 5 },
  { id: 'twenty-countries', title: 'Globetrotter', description: 'Visit 20 countries', emoji: '🌍', value: (c) => c.stats.countriesDiscovered, target: 20 },
  { id: 'all-continents', title: 'Seven Seas', description: 'Set foot on all 7 continents', emoji: '🗺️', value: (c) => c.stats.continentsDiscovered, target: 7 },
  { id: 'city-hopper', title: 'City Hopper', description: 'Explore 25 cities', emoji: '🏙️', value: (c) => c.stats.citiesDiscovered, target: 25 },
  { id: 'foodie', title: 'Foodie', description: 'Record 15 food & drink spots', emoji: '🍜', value: (c) => c.discovery.byCategory.food, target: 15 },
  { id: 'culture-vulture', title: 'Culture Vulture', description: 'Record 15 culture discoveries', emoji: '🏛️', value: (c) => c.discovery.byCategory.culture, target: 15 },
  { id: 'naturalist', title: 'Naturalist', description: 'Record 10 nature spots', emoji: '⛰️', value: (c) => c.discovery.byCategory.nature, target: 10 },
  { id: 'collector', title: 'Collector', description: 'Record 50 discoveries', emoji: '✨', value: (c) => c.discovery.total, target: 50 },
  { id: 'frequent-flyer', title: 'Frequent Flyer', description: 'Log 25 journeys', emoji: '✈️', value: (c) => c.journeys.total, target: 25 },
  { id: 'homebody', title: 'At Home Abroad', description: 'Live in 2 countries', emoji: '🏡', value: (c) => c.stats.countriesLived, target: 2 },
  { id: 'storyteller', title: 'Storyteller', description: 'Recommend 20 places', emoji: '💛', value: (c) => c.discovery.recommended, target: 20 },
];

export function computeBadges(ctx: BadgeCtx): Badge[] {
  return BADGE_DEFS.map((d) => {
    const v = d.value(ctx);
    const progress = Math.min(1, d.target ? v / d.target : 0);
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      emoji: d.emoji,
      earned: v >= d.target,
      progress,
    };
  });
}
