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
  /** Title of the next level (undefined when maxed). */
  nextTitle?: string;
  maxed: boolean;
}

export interface XpLine {
  label: string;
  count: number;
  per: number;
  points: number;
}

/** Where a Member's XP comes from — so the level system isn't a black box. */
export function xpBreakdown(
  stats: PassportStats,
  discovery: DiscoveryStats,
  journeys: JourneyStats,
): XpLine[] {
  const rows: { label: string; count: number; per: number; always?: boolean }[] = [
    { label: 'Countries discovered', count: stats.countriesDiscovered, per: 100, always: true },
    { label: 'Cities explored', count: stats.citiesDiscovered, per: 25, always: true },
    { label: 'Continents reached', count: stats.continentsDiscovered, per: 150, always: true },
    { label: 'Regions explored', count: stats.regionsDiscovered ?? 0, per: 30 },
    { label: 'Discoveries saved', count: discovery.total, per: 10, always: true },
    { label: 'Journeys logged', count: journeys.total, per: 40, always: true },
  ];
  return rows
    .filter((r) => r.always || r.count > 0)
    .map((r) => ({ label: r.label, count: r.count, per: r.per, points: r.count * r.per }));
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
    nextTitle: maxed ? undefined : TITLES[Math.min(level, TITLES.length - 1)],
    maxed,
  };
}

// ── Badges ───────────────────────────────────────────────────────────────
export type AchievementCategory = 'core' | 'explorer' | 'earn' | 'places' | 'memories';

/** Section headers + order for the achievements gallery. */
export const ACHIEVEMENT_SECTIONS: { id: AchievementCategory; title: string }[] = [
  { id: 'core', title: 'Core' },
  { id: 'explorer', title: 'Explorer' },
  { id: 'earn', title: 'More ways to earn' },
  { id: 'places', title: 'Places & culture' },
  { id: 'memories', title: 'Memories & impact' },
];

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Lucide icon name, drawn on the illustrated tile. */
  icon: string;
  /** Two-stop gradient for the tile. */
  gradient: [string, string];
  category: AchievementCategory;
  earned: boolean;
  /** 0–1 progress toward earning (1 when earned). */
  progress: number;
  value: number;
  target: number;
}

interface BadgeDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: string;
  gradient: [string, string];
  category: AchievementCategory;
  /** current value / target → progress + earned. */
  value: (c: BadgeCtx) => number;
  target: number;
  /** Meta badges are derived from how many other badges are earned. */
  meta?: 'collector' | 'society';
}

interface BadgeCtx {
  stats: PassportStats;
  discovery: DiscoveryStats;
  journeys: JourneyStats;
  captures: number;
  /** Lightweight projection of trips for date-driven (cadence) badges. */
  trips?: { startDate?: string; countryCodes: string[] }[];
}

const distinctModes = (c: BadgeCtx) => Object.values(c.journeys.byMode).filter((n) => n > 0).length;

// ── Cadence helpers: badges driven by *when* you travel, not just how much ──
const tripMonth = (d?: string) => (d && /^\d{4}-\d{2}/.test(d) ? Number(d.slice(5, 7)) : undefined);
/** Most visits to a single country across all trips. */
const maxCountryRepeats = (c: BadgeCtx) => {
  const n = new Map<string, number>();
  for (const t of c.trips ?? []) for (const cc of new Set(t.countryCodes)) n.set(cc, (n.get(cc) ?? 0) + 1);
  return Math.max(0, ...n.values());
};
/** Trips that start in meteorological winter (Dec–Feb). */
const winterTrips = (c: BadgeCtx) =>
  (c.trips ?? []).filter((t) => { const m = tripMonth(t.startDate); return m === 12 || m === 1 || m === 2; }).length;
/** Most trips begun inside one calendar month. */
const maxTripsInMonth = (c: BadgeCtx) => {
  const n = new Map<string, number>();
  for (const t of c.trips ?? []) if (t.startDate && /^\d{4}-\d{2}/.test(t.startDate)) {
    const k = t.startDate.slice(0, 7);
    n.set(k, (n.get(k) ?? 0) + 1);
  }
  return Math.max(0, ...n.values());
};
/** Distinct seasons (spring/summer/autumn/winter) you've set off in. */
const seasonsTravelled = (c: BadgeCtx) => {
  const seasons = new Set<number>();
  for (const t of c.trips ?? []) {
    const m = tripMonth(t.startDate);
    if (m) seasons.add(m === 12 || m <= 2 ? 0 : m <= 5 ? 1 : m <= 8 ? 2 : 3);
  }
  return seasons.size;
};
const sub = (c: BadgeCtx, id: string) => c.discovery.bySubcategory[id] ?? 0;

const BADGE_DEFS: BadgeDef[] = [
  // ── Core ──
  { id: 'first-steps', title: 'First Steps', description: 'Add your first country', emoji: '🌱', icon: 'Footprints', gradient: ['#FF6B9A', '#FF8E72'], category: 'core', value: (c) => c.stats.countriesDiscovered, target: 1 },
  { id: 'getting-around', title: 'Getting Around', description: 'Use 3 different ways to travel', emoji: '🧭', icon: 'Compass', gradient: ['#4DA8FF', '#5B6CFF'], category: 'core', value: distinctModes, target: 3 },
  { id: 'globetrotter', title: 'Globetrotter', description: 'Visit 10 countries', emoji: '🌍', icon: 'Globe2', gradient: ['#2BD9A8', '#24D1C3'], category: 'core', value: (c) => c.stats.countriesDiscovered, target: 10 },
  { id: 'seven-seas', title: 'Seven Seas', description: 'Set foot on all 7 continents', emoji: '🗺️', icon: 'Waves', gradient: ['#9B7CFF', '#6C5CE7'], category: 'core', value: (c) => c.stats.continentsDiscovered, target: 7 },
  { id: 'city-hopper', title: 'City Hopper', description: 'Explore 10 cities', emoji: '🏙️', icon: 'Building2', gradient: ['#5B6CFF', '#9B7CFF'], category: 'core', value: (c) => c.stats.citiesDiscovered, target: 10 },
  { id: 'foodie', title: 'Foodie', description: 'Save 25 food & drink spots', emoji: '🍜', icon: 'UtensilsCrossed', gradient: ['#FF8E53', '#FF6B6B'], category: 'core', value: (c) => c.discovery.byCategory.food, target: 25 },
  { id: 'culture-vulture', title: 'Culture Vulture', description: 'Save 10 cultural spots', emoji: '🏛️', icon: 'Landmark', gradient: ['#9B7CFF', '#FF6B9A'], category: 'core', value: (c) => c.discovery.byCategory.culture, target: 10 },
  { id: 'naturalist', title: 'Naturalist', description: 'Save 10 natural spots', emoji: '⛰️', icon: 'Mountain', gradient: ['#2BD9A8', '#3BAFDA'], category: 'core', value: (c) => c.discovery.byCategory.nature, target: 10 },
  { id: 'frequent-flyer', title: 'Frequent Flyer', description: 'Take 10 flights', emoji: '✈️', icon: 'Plane', gradient: ['#5BC8FF', '#24D1C3'], category: 'core', value: (c) => c.journeys.byMode.flight, target: 10 },
  { id: 'storyteller', title: 'Storyteller', description: 'Save 25 memories', emoji: '📸', icon: 'Images', gradient: ['#FF6B9A', '#9B7CFF'], category: 'core', value: (c) => c.captures, target: 25 },
  { id: 'collector', title: 'Collector', description: 'Earn 10 achievements', emoji: '✨', icon: 'Gem', gradient: ['#FFD36E', '#FFB84D'], category: 'core', value: () => 0, target: 10, meta: 'collector' },

  // ── Explorer ──
  { id: 'coffee-trail', title: 'Coffee Trail', description: 'Save 25 cafés', emoji: '☕', icon: 'Coffee', gradient: ['#C58E5B', '#FF8E53'], category: 'explorer', value: (c) => sub(c, 'cafe'), target: 25 },
  { id: 'festival-fan', title: 'Festival Fan', description: 'Save 5 festivals or events', emoji: '🎉', icon: 'PartyPopper', gradient: ['#FF6B9A', '#FFB84D'], category: 'explorer', value: (c) => sub(c, 'festival'), target: 5 },
  { id: 'night-owl', title: 'Night Owl', description: 'Log 10 nightlife spots', emoji: '🌙', icon: 'Moon', gradient: ['#5B6CFF', '#2D2A6E'], category: 'explorer', value: (c) => sub(c, 'nightlife'), target: 10 },
  { id: 'continental', title: 'Continental Collector', description: 'Reach 4 continents', emoji: '🧭', icon: 'Globe', gradient: ['#24D1C3', '#5B6CFF'], category: 'explorer', value: (c) => c.stats.continentsDiscovered, target: 4 },
  { id: 'local-expert', title: 'Local Expert', description: 'Recommend 25 places', emoji: '⭐', icon: 'Star', gradient: ['#FFD36E', '#FF8E53'], category: 'explorer', value: (c) => c.discovery.recommended, target: 25 },
  { id: 'gem-hunter', title: 'Gem Hunter', description: 'Flag 5 hidden gems', emoji: '💎', icon: 'Gem', gradient: ['#2BD9A8', '#24D1C3'], category: 'explorer', value: (c) => c.discovery.hiddenGems, target: 5 },
  { id: 'repeat-visitor', title: 'Repeat Visitor', description: 'Return to the same country on 3 trips', emoji: '🔁', icon: 'Repeat', gradient: ['#FF8E53', '#FFB84D'], category: 'explorer', value: maxCountryRepeats, target: 3 },
  { id: 'winter-wanderer', title: 'Winter Wanderer', description: 'Set off on 3 trips in Dec–Feb', emoji: '❄️', icon: 'Snowflake', gradient: ['#5B6CFF', '#24D1C3'], category: 'explorer', value: winterTrips, target: 3 },
  { id: 'marathon-month', title: 'Marathon Month', description: 'Start 2 trips in one month', emoji: '⚡', icon: 'Zap', gradient: ['#FF6B9A', '#9B7CFF'], category: 'explorer', value: maxTripsInMonth, target: 2 },
  { id: 'four-seasons', title: 'Four Seasons', description: 'Travel in all four seasons', emoji: '🍂', icon: 'Leaf', gradient: ['#2BD9A8', '#FFB84D'], category: 'explorer', value: seasonsTravelled, target: 4 },
  { id: 'society', title: 'Society of Discovery', description: 'Earn every other achievement', emoji: '🏆', icon: 'Award', gradient: ['#FFB84D', '#FF6B9A'], category: 'explorer', value: () => 0, target: 1, meta: 'society' },

  // ── More ways to earn ──
  { id: 'world-wanderer', title: 'World Wanderer', description: 'Visit 25 countries', emoji: '🌐', icon: 'Map', gradient: ['#5B6CFF', '#24D1C3'], category: 'earn', value: (c) => c.stats.countriesDiscovered, target: 25 },
  { id: 'rail-rider', title: 'Rail Rider', description: 'Take 10 rail journeys', emoji: '🚆', icon: 'TrainFront', gradient: ['#FF8E53', '#FF6B6B'], category: 'earn', value: (c) => c.journeys.byMode.rail, target: 10 },
  { id: 'sea-explorer', title: 'Sea Explorer', description: 'Take a ferry or cruise', emoji: '🚢', icon: 'Ship', gradient: ['#4DA8FF', '#5B6CFF'], category: 'earn', value: (c) => c.journeys.byMode.cruise + c.journeys.byMode.ferry, target: 1 },
  { id: 'road-tripper', title: 'Road Tripper', description: 'Log 5 road trips', emoji: '🚗', icon: 'Car', gradient: ['#FFB84D', '#FF8E53'], category: 'earn', value: (c) => c.journeys.byMode.road, target: 5 },
  { id: 'wildlife-watcher', title: 'Wildlife Watcher', description: 'Save 10 wildlife spots', emoji: '🦁', icon: 'Bird', gradient: ['#2BD9A8', '#3BAFDA'], category: 'earn', value: (c) => sub(c, 'wildlife'), target: 10 },
  { id: 'attraction-seeker', title: 'Attraction Seeker', description: 'Save 10 attractions', emoji: '🎢', icon: 'Ticket', gradient: ['#9B7CFF', '#FF6B9A'], category: 'earn', value: (c) => sub(c, 'attraction'), target: 10 },

  // ── Places & culture ──
  { id: 'ancient-explorer', title: 'Ancient Explorer', description: 'Save 10 historic sites', emoji: '🏺', icon: 'Building', gradient: ['#C58E5B', '#9B7CFF'], category: 'places', value: (c) => sub(c, 'historic-site'), target: 10 },
  { id: 'skyline-chaser', title: 'Skyline Chaser', description: 'Save 10 viewpoints', emoji: '🌆', icon: 'Telescope', gradient: ['#FF6B9A', '#5B6CFF'], category: 'places', value: (c) => sub(c, 'viewpoint'), target: 10 },
  { id: 'beach-bum', title: 'Beach Bum', description: 'Save 10 beaches', emoji: '🏖️', icon: 'Umbrella', gradient: ['#5BC8FF', '#FFD36E'], category: 'places', value: (c) => sub(c, 'beach'), target: 10 },
  { id: 'pilgrim', title: 'Pilgrim', description: 'Save 5 religious sites', emoji: '⛩️', icon: 'Church', gradient: ['#9B7CFF', '#6C5CE7'], category: 'places', value: (c) => sub(c, 'religious-site'), target: 5 },
  { id: 'local-living', title: 'Local Living', description: 'Live somewhere new', emoji: '🏡', icon: 'Home', gradient: ['#2BD9A8', '#24D1C3'], category: 'places', value: (c) => c.stats.countriesLived, target: 1 },
  { id: 'at-home-abroad', title: 'At Home Abroad', description: 'Live in 2 countries', emoji: '🗝️', icon: 'House', gradient: ['#FF8E53', '#FF6B9A'], category: 'places', value: (c) => c.stats.countriesLived, target: 2 },

  // ── Memories & impact ──
  { id: 'moment-capturer', title: 'Moment Capturer', description: 'Save your first memory', emoji: '📷', icon: 'Camera', gradient: ['#FF6B9A', '#FF8E72'], category: 'memories', value: (c) => c.captures, target: 1 },
  { id: 'memory-keeper', title: 'Memory Keeper', description: 'Save 50 memories', emoji: '🖼️', icon: 'Image', gradient: ['#9B7CFF', '#FF6B9A'], category: 'memories', value: (c) => c.captures, target: 50 },
  { id: 'snapshot-collector', title: 'Snapshot Collector', description: 'Save 100 memories', emoji: '📚', icon: 'Images', gradient: ['#5B6CFF', '#9B7CFF'], category: 'memories', value: (c) => c.captures, target: 100 },
  { id: 'journal-writer', title: 'Journal Writer', description: 'Add notes to 25 discoveries', emoji: '📝', icon: 'BookOpen', gradient: ['#24D1C3', '#5B6CFF'], category: 'memories', value: (c) => c.discovery.withNote, target: 25 },
  { id: 'recommendation-machine', title: 'Recommendation Machine', description: 'Recommend 50 places', emoji: '💛', icon: 'Heart', gradient: ['#FF6B9A', '#FFB84D'], category: 'memories', value: (c) => c.discovery.recommended, target: 50 },
];

export function computeBadges(ctx: BadgeCtx): Badge[] {
  // First pass: every non-meta badge.
  const base = BADGE_DEFS.map((d) => {
    if (d.meta) return null;
    const value = d.value(ctx);
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      emoji: d.emoji,
      icon: d.icon,
      gradient: d.gradient,
      category: d.category,
      value,
      target: d.target,
      earned: value >= d.target,
      progress: Math.min(1, d.target ? value / d.target : 0),
    } satisfies Badge;
  });
  const earnedCount = base.filter((b): b is Badge => !!b && b.earned).length;
  const nonMetaCount = base.filter(Boolean).length;

  // Second pass: meta badges derived from how many others are earned.
  return BADGE_DEFS.map((d, i) => {
    if (!d.meta) return base[i] as Badge;
    const value = earnedCount;
    const target = d.meta === 'society' ? nonMetaCount : d.target;
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      emoji: d.emoji,
      icon: d.icon,
      gradient: d.gradient,
      category: d.category,
      value,
      target,
      earned: value >= target,
      progress: Math.min(1, target ? value / target : 0),
    } satisfies Badge;
  });
}
