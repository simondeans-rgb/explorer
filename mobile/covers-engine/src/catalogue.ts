/**
 * THE WORLDLY PASSPORT COVER CATALOGUE — first generation.
 *
 * This is the product/creative source of truth: every cover's collection,
 * rarity, how it's unlocked, and how it will be monetised when billing turns
 * on. `catalog.ts` holds the visual THEME per cover; this file holds the
 * COMMERCIAL + COLLECTION metadata. Together they let the app present covers
 * as a collectible set and let the engine grow for years by appending rows.
 *
 * See CATALOGUE.md for the full creative-director writeup (audience, animation
 * profiles, marketing artwork direction, and the multi-year roadmap).
 */

/** Collectible rarity. Drives the unlock celebration + badge, never price alone. */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** Where a cover sits in the catalogue hierarchy. */
export type Tier = 'core' | 'seasonal' | 'lifestyle' | 'achievement' | 'premium' | 'limited';

/** How a cover becomes available. */
export type Unlock =
  | { kind: 'free' } // Core — everyone, always
  | { kind: 'season'; months: number[]; returns: string } // free while its season is active
  | { kind: 'achievement'; metric: 'countries' | 'flights' | 'continents' | 'airports' | 'level' | 'discoveries'; value: number; label: string }
  | { kind: 'achievement-special'; id: string; label: string } // bespoke achievements (UK nations, US states, foodie…)
  | { kind: 'purchase' } // Premium — buy the collection when billing is live
  | { kind: 'event'; window: string }; // Limited edition — time-boxed drop

/** Commercial category once monetisation is enabled. */
export type Monetisation =
  | 'free' // Core + active Seasonal
  | 'explorer' // included with the Explorer subscription
  | 'premium-pack' // one-off purchasable collection
  | 'earned' // achievement-only, never for sale
  | 'limited'; // event drop, time-limited

export interface CoverEntry {
  /** Icon name in app.json / catalog.ts theme (PascalCase), or null for Classic. */
  icon: string;
  rarity: Rarity;
  unlock: Unlock;
  monetisation: Monetisation;
  /** false = designed + roadmapped but art not yet rendered (see CATALOGUE.md). */
  shipped: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  tier: Tier;
  covers: CoverEntry[];
}

const free: Unlock = { kind: 'free' };

export const CATALOGUE: Collection[] = [
  // ── 1. CORE — free, defines the brand ────────────────────────────────────
  {
    id: 'core',
    name: 'Core Collection',
    description: 'The signature Worldly covers — free for everyone, forever.',
    tier: 'core',
    covers: [
      { icon: 'Classic', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Midnight', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Pearl', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Earth', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Sunset', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Ocean', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Linen', rarity: 'common', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'Explorer', rarity: 'uncommon', unlock: free, monetisation: 'free', shipped: true },
    ],
  },

  // ── 2. SEASONAL — free while active, return every year ────────────────────
  {
    id: 'spring',
    name: 'Spring',
    description: 'Blossom, fresh air and long light — the world waking up.',
    tier: 'seasonal',
    covers: [{ icon: 'Spring', rarity: 'uncommon', unlock: { kind: 'season', months: [3, 4, 5], returns: 'Returns in March' }, monetisation: 'free', shipped: true }],
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Sun, sea and palms — peak wandering season.',
    tier: 'seasonal',
    covers: [{ icon: 'Summer', rarity: 'uncommon', unlock: { kind: 'season', months: [6, 7, 8], returns: 'Returns in June' }, monetisation: 'free', shipped: true }],
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Amber light and falling leaves — the golden season.',
    tier: 'seasonal',
    covers: [{ icon: 'Autumn', rarity: 'uncommon', unlock: { kind: 'season', months: [9, 10, 11], returns: 'Returns in September' }, monetisation: 'free', shipped: true }],
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'First-snow quiet and cabin warmth.',
    tier: 'seasonal',
    covers: [
      { icon: 'Winter', rarity: 'uncommon', unlock: { kind: 'season', months: [12, 1, 2], returns: 'Returns in December' }, monetisation: 'free', shipped: true },
      { icon: 'CozyWinter', rarity: 'uncommon', unlock: { kind: 'season', months: [12, 1, 2], returns: 'Returns in December' }, monetisation: 'free', shipped: true },
    ],
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Three festive editions for the season.',
    tier: 'seasonal',
    covers: [
      { icon: 'Christmas', rarity: 'rare', unlock: { kind: 'season', months: [11, 12, 1], returns: 'Returns in November' }, monetisation: 'free', shipped: true },
      { icon: 'CandyCane', rarity: 'uncommon', unlock: { kind: 'season', months: [11, 12, 1], returns: 'Returns in November' }, monetisation: 'free', shipped: true },
    ],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'Spooky editions — if you dare.',
    tier: 'seasonal',
    covers: [
      { icon: 'Halloween', rarity: 'rare', unlock: { kind: 'season', months: [10], returns: 'Returns in October' }, monetisation: 'free', shipped: true },
      { icon: 'Ghost', rarity: 'rare', unlock: { kind: 'season', months: [10], returns: 'Returns in October' }, monetisation: 'free', shipped: true },
      { icon: 'WitchingHour', rarity: 'uncommon', unlock: { kind: 'season', months: [10], returns: 'Returns in October' }, monetisation: 'free', shipped: true },
    ],
  },
  {
    id: 'lunar-new-year',
    name: 'Lunar New Year',
    description: 'Lanterns and gold — a new year of journeys.',
    tier: 'seasonal',
    covers: [{ icon: 'LunarNewYear', rarity: 'rare', unlock: { kind: 'season', months: [1, 2], returns: 'Returns in late January' }, monetisation: 'free', shipped: true }],
  },
  {
    id: 'pride',
    name: 'Pride',
    description: 'Celebrate every journey, loudly or quietly.',
    tier: 'seasonal',
    covers: [
      { icon: 'Pride', rarity: 'rare', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'PrideNeon', rarity: 'uncommon', unlock: free, monetisation: 'free', shipped: true },
      { icon: 'PrideNight', rarity: 'uncommon', unlock: free, monetisation: 'free', shipped: true },
    ],
  },

  // ── 3. LIFESTYLE — aspirational, Explorer-included ────────────────────────
  {
    id: 'lifestyle-signature',
    name: 'Lifestyle',
    description: 'Aspirational covers inspired by how you travel.',
    tier: 'lifestyle',
    covers: [
      { icon: 'Sakura', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Tropical', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Coffee', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Nordic', rarity: 'rare', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Safari', rarity: 'rare', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Mediterranean', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
    ],
  },
  {
    id: 'voyager',
    name: 'Voyager',
    description: 'Four journeys for the shelf — city, memory, mountain, desert.',
    tier: 'lifestyle',
    covers: [
      { icon: 'Metropolis', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'VintageVoyage', rarity: 'rare', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Summit', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
      { icon: 'Oasis', rarity: 'uncommon', unlock: free, monetisation: 'explorer', shipped: true },
    ],
  },

  // ── 4. ACHIEVEMENT — earned only, never for sale ──────────────────────────
  {
    id: 'achievement',
    name: 'Earned',
    description: 'Unlocked only by exploring — the most prestigious covers of all.',
    tier: 'achievement',
    covers: [
      { icon: 'FrequentFlyer', rarity: 'rare', unlock: { kind: 'achievement', metric: 'countries', value: 10, label: 'Explore 10 countries' }, monetisation: 'earned', shipped: true },
      { icon: 'Aurora', rarity: 'rare', unlock: { kind: 'achievement', metric: 'level', value: 5, label: 'Reach Explorer Level 5' }, monetisation: 'earned', shipped: true },
      { icon: 'Neon', rarity: 'epic', unlock: { kind: 'achievement', metric: 'countries', value: 25, label: 'Explore 25 countries' }, monetisation: 'earned', shipped: true },
      { icon: 'Luxury', rarity: 'epic', unlock: { kind: 'achievement', metric: 'level', value: 8, label: 'Reach Explorer Level 8' }, monetisation: 'earned', shipped: true },
      { icon: 'EveryContinent', rarity: 'legendary', unlock: { kind: 'achievement', metric: 'continents', value: 7, label: 'Set foot on every continent' }, monetisation: 'earned', shipped: true },
      { icon: 'WorldlyLegend', rarity: 'mythic', unlock: { kind: 'achievement', metric: 'countries', value: 50, label: 'Explore 50 countries' }, monetisation: 'earned', shipped: true },
    ],
  },

  // ── 5. PREMIUM — purchasable when billing is enabled ──────────────────────
  {
    id: 'premium-materials',
    name: 'Materials',
    description: 'Precious finishes on the Worldly mark — pure craft.',
    tier: 'premium',
    covers: [
      { icon: 'Gold', rarity: 'epic', unlock: { kind: 'purchase' }, monetisation: 'premium-pack', shipped: true },
      { icon: 'Marble', rarity: 'epic', unlock: { kind: 'purchase' }, monetisation: 'premium-pack', shipped: true },
    ],
  },
  {
    id: 'premium-atmosphere',
    name: 'Atmosphere',
    description: 'Cosmic and deco statement covers for collectors.',
    tier: 'premium',
    covers: [
      { icon: 'Galaxy', rarity: 'legendary', unlock: { kind: 'purchase' }, monetisation: 'premium-pack', shipped: true },
      { icon: 'ArtDeco', rarity: 'epic', unlock: { kind: 'purchase' }, monetisation: 'premium-pack', shipped: true },
    ],
  },
];

/**
 * ROADMAP — designed collections whose art is scheduled for later generations.
 * Each becomes a real collection above by adding a recipe + theme + entry. This
 * list keeps the catalogue honest about what's shipped vs. planned and gives
 * the product years of runway. (See CATALOGUE.md for full treatments.)
 */
export const ROADMAP: { name: string; tier: Tier; monetisation: Monetisation; note: string }[] = [
  { name: 'Modern / Monochrome', tier: 'core', monetisation: 'free', note: 'Minimal type-led core covers.' },
  { name: 'Cherry Blossom (night)', tier: 'seasonal', monetisation: 'free', note: 'Hanami lanterns — extends Sakura.' },
  { name: 'Coffee Culture', tier: 'lifestyle', monetisation: 'explorer', note: 'Latte art + to-go cup pack (extends Coffee).' },
  { name: 'Road Trip / Camping / Beach Escape', tier: 'lifestyle', monetisation: 'explorer', note: 'Adventure sub-collections.' },
  { name: 'City Breaks (Paris / New York / London / Tokyo)', tier: 'lifestyle', monetisation: 'premium-pack', note: 'Iconic-skyline pack.' },
  { name: 'Northern Lights / National Parks / Rainforest', tier: 'lifestyle', monetisation: 'explorer', note: 'Nature sub-collections.' },
  { name: 'Golden Age of Travel / Retro Airlines / Vintage Luggage', tier: 'premium', monetisation: 'premium-pack', note: 'Nostalgia pack (extends Vintage Voyage).' },
  { name: 'First Class / Business Class / Luxury Hotels / Luxury Cruise', tier: 'premium', monetisation: 'premium-pack', note: 'Luxury travel pack.' },
  { name: 'Glass / Chrome / Carbon', tier: 'premium', monetisation: 'premium-pack', note: 'More material finishes.' },
  { name: 'First Flight / First Country / 5·100 Countries / 100·500 Flights', tier: 'achievement', monetisation: 'earned', note: 'Milestone ladder.' },
  { name: 'All UK Nations / Every US State / 50·100 Airports', tier: 'achievement', monetisation: 'earned', note: 'Completionist achievements.' },
  { name: 'Foodie / Museum Collector / Hiking / UNESCO / Sunrise Chaser / Night Owl', tier: 'achievement', monetisation: 'earned', note: 'Interest-based achievements.' },
  { name: 'Olympics / World Cup / World Expo / Earth Day / Anniversary', tier: 'limited', monetisation: 'limited', note: 'Event drops, time-boxed.' },
];

/** Every shipped cover, flattened — handy for validation + the app registry. */
export function shippedCovers(): CoverEntry[] {
  return CATALOGUE.flatMap((c) => c.covers).filter((c) => c.shipped);
}
