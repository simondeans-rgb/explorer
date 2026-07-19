// Passport Covers — switchable app icons. The icon assets live in the native
// binary (the expo-alternate-app-icons CONFIG PLUGIN generates the icon
// catalog at build time); this registry holds the product metadata: display
// copy, bundled previews and unlock rules.
//
// Runtime switching goes through our local WorldlyAppIcon module, which
// dispatches every UIApplication access to the main thread. The package's own
// native runtime is excluded from the build: it reads UIApplication state on
// the calling queue during lazy module creation, which hard-crashes the app
// the first time JS touches it. Binaries without WorldlyAppIcon degrade to a
// read-only preview. OTA-safe.
import { requireOptionalNativeModule } from 'expo-modules-core';
import { type CoverSeason, seasonActive, lockProgress } from './coverRules';

export { seasonActive, lockProgress, type CoverSeason };

/** Collectible rarity — shown as a badge; drives the unlock celebration. */
export type CoverRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const RARITY_META: Record<CoverRarity, { label: string; color: string }> = {
  common: { label: 'Common', color: '#8A90A6' },
  uncommon: { label: 'Uncommon', color: '#2FA36B' },
  rare: { label: 'Rare', color: '#2E86C4' },
  epic: { label: 'Epic', color: '#9B5CFF' },
  legendary: { label: 'Legendary', color: '#F0A020' },
  mythic: { label: 'Mythic', color: '#E0245E' },
};

export interface CoverDef {
  /** Plugin icon name (PascalCase); null = the default Worldly icon. */
  name: string | null;
  title: string;
  tagline: string;
  preview: number;
  /** Requirement to unlock; covers without one are always available. */
  unlock?: { countries?: number; level?: number };
  /** Highlight as a fresh addition to the collection. */
  isNew?: boolean;
  /** Collectible rarity (defaults to common when omitted). */
  rarity?: CoverRarity;
}

export interface CoverSection {
  title: string;
  /** Editorial line under the section header (packs get one). */
  tagline?: string;
  /** Who gets this section once billing is live. 'earned' = achievement covers
   *  (free once unlocked — never sold); 'explorer' = included with Explorer;
   *  'premium' = a purchasable pack (locked, preview-only, until bought). */
  access?: 'free' | 'explorer' | 'earned' | 'premium';
  /** Present on calendar-gated packs; absent = available year-round. */
  season?: CoverSeason;
  covers: CoverDef[];
}

/* eslint-disable @typescript-eslint/no-require-imports -- static require paths, resolved by the bundler */
export const COVER_SECTIONS: CoverSection[] = [
  {
    title: 'Core collection',
    access: 'explorer',
    covers: [
      { name: null, title: 'Classic Worldly', tagline: 'The vibrant original', preview: require('../../assets/icons/covers/previews/classic.png') },
      { name: 'Midnight', title: 'Midnight', tagline: 'Starlit & sophisticated', preview: require('../../assets/icons/covers/previews/midnight.png') },
      { name: 'Pearl', title: 'Pearl', tagline: 'Clean & elegant', preview: require('../../assets/icons/covers/previews/pearl.png') },
      { name: 'Earth', title: 'Earth', tagline: 'Rolling hills & open air', preview: require('../../assets/icons/covers/previews/earth.png') },
      { name: 'Sunset', title: 'Sunset', tagline: 'Golden-hour glow', preview: require('../../assets/icons/covers/previews/sunset.png') },
      { name: 'Ocean', title: 'Ocean', tagline: 'Waves & sea air', preview: require('../../assets/icons/covers/previews/ocean.png') },
      { name: 'Linen', title: 'Linen', tagline: 'Woven & understated', preview: require('../../assets/icons/covers/previews/linen.png'), isNew: true },
      { name: 'Explorer', title: 'Explorer', tagline: 'Contours & compass', preview: require('../../assets/icons/covers/previews/explorer.png'), rarity: 'uncommon', isNew: true },
    ],
  },
  {
    title: 'Lifestyle',
    access: 'explorer',
    covers: [
      { name: 'Sakura', title: 'Sakura', tagline: 'Petals on the wind', preview: require('../../assets/icons/covers/previews/sakura.png') },
      { name: 'Tropical', title: 'Tropical', tagline: 'Palms & paradise', preview: require('../../assets/icons/covers/previews/tropical.png') },
      { name: 'Winter', title: 'Winter', tagline: 'First-snow quiet', preview: require('../../assets/icons/covers/previews/winter.png') },
      { name: 'Coffee', title: 'Coffee', tagline: 'Beans, steam & mornings', preview: require('../../assets/icons/covers/previews/coffee.png') },
      { name: 'Nordic', title: 'Nordic', tagline: 'Fjord & midnight sun', preview: require('../../assets/icons/covers/previews/nordic.png'), rarity: 'rare', isNew: true },
      { name: 'Safari', title: 'Safari', tagline: 'Savanna at golden hour', preview: require('../../assets/icons/covers/previews/safari.png'), rarity: 'rare', isNew: true },
      { name: 'Mediterranean', title: 'Mediterranean', tagline: 'Whitewashed & blue', preview: require('../../assets/icons/covers/previews/mediterranean.png'), isNew: true },
    ],
  },
  {
    title: 'Unlock these',
    tagline: 'Earned by travelling — yours free forever once unlocked.',
    access: 'earned',
    covers: [
      { name: 'Aurora', title: 'Aurora', tagline: 'Northern lights, bottled', preview: require('../../assets/icons/covers/previews/aurora.png'), unlock: { level: 5 }, rarity: 'rare' },
      { name: 'FrequentFlyer', title: 'Frequent Flyer', tagline: 'Contrails & departures', preview: require('../../assets/icons/covers/previews/frequent-flyer.png'), unlock: { countries: 10 }, rarity: 'rare' },
      { name: 'Luxury', title: 'Luxury', tagline: 'Gold dust & midnight', preview: require('../../assets/icons/covers/previews/luxury.png'), unlock: { level: 8 }, rarity: 'epic' },
      { name: 'Neon', title: 'Neon', tagline: 'Synthwave nights', preview: require('../../assets/icons/covers/previews/neon.png'), unlock: { countries: 25 }, rarity: 'epic' },
      { name: 'EveryContinent', title: 'Every Continent', tagline: 'A world, completed', preview: require('../../assets/icons/covers/previews/every-continent.png'), unlock: { countries: 40 }, rarity: 'legendary', isNew: true },
      { name: 'WorldlyLegend', title: 'Worldly Legend', tagline: 'The rarest cover of all', preview: require('../../assets/icons/covers/previews/worldly-legend.png'), unlock: { countries: 50 }, rarity: 'mythic', isNew: true },
    ],
  },
  {
    title: 'Christmas Pack',
    tagline: 'Three festive editions for the season.',
    access: 'explorer',
    season: { months: [11, 12, 1], returns: 'Returns in November' },
    covers: [
      { name: 'Christmas', title: 'Classic Christmas', tagline: 'Fairy lights on the W', preview: require('../../assets/icons/covers/previews/christmas.png'), isNew: true },
      { name: 'CandyCane', title: 'Candy Cane', tagline: 'Striped & glossy', preview: require('../../assets/icons/covers/previews/candy-cane.png'), isNew: true },
      { name: 'CozyWinter', title: 'Cozy Winter', tagline: 'Cabin lights in the snow', preview: require('../../assets/icons/covers/previews/cozy-winter.png'), isNew: true },
    ],
  },
  {
    title: 'Halloween Pack',
    tagline: 'Three spooky editions — if you dare.',
    access: 'explorer',
    season: { months: [10], returns: 'Returns in October' },
    covers: [
      { name: 'Halloween', title: 'Spooky Night', tagline: 'Bats, moon & pumpkins', preview: require('../../assets/icons/covers/previews/halloween.png'), isNew: true },
      { name: 'Ghost', title: 'Ghost', tagline: 'Boo. (Look at the eyes.)', preview: require('../../assets/icons/covers/previews/ghost.png'), isNew: true },
      { name: 'WitchingHour', title: 'Witching Hour', tagline: 'Hats, stars & spells', preview: require('../../assets/icons/covers/previews/witching-hour.png'), isNew: true },
    ],
  },
  {
    title: 'Voyager Pack',
    tagline: 'Four new journeys for the shelf — city, memory, mountain, desert.',
    access: 'explorer',
    covers: [
      { name: 'Metropolis', title: 'Metropolis', tagline: 'Dusk over the skyline', preview: require('../../assets/icons/covers/previews/metropolis.png'), isNew: true },
      { name: 'VintageVoyage', title: 'Vintage Voyage', tagline: 'A well-stamped passport page', preview: require('../../assets/icons/covers/previews/vintage-voyage.png'), isNew: true },
      { name: 'Summit', title: 'Summit', tagline: 'Alpine dawn, thin air', preview: require('../../assets/icons/covers/previews/summit.png'), isNew: true },
      { name: 'Oasis', title: 'Oasis', tagline: 'Desert dusk, warm sand', preview: require('../../assets/icons/covers/previews/oasis.png'), isNew: true },
    ],
  },
  {
    title: 'Pride Pack',
    tagline: 'Celebrate every journey, loudly or quietly.',
    access: 'explorer',
    covers: [
      { name: 'Pride', title: 'Pride', tagline: 'The full flag, full volume', preview: require('../../assets/icons/covers/previews/pride.png') },
      { name: 'PrideNeon', title: 'Pride Neon', tagline: 'Glowing after dark', preview: require('../../assets/icons/covers/previews/pride-neon.png'), isNew: true },
      { name: 'PrideNight', title: 'Quiet Pride', tagline: 'Subtle rainbow, navy calm', preview: require('../../assets/icons/covers/previews/pride-night.png'), isNew: true },
    ],
  },
  {
    title: 'Spring',
    tagline: 'Blossom & fresh light — the world waking up.',
    access: 'explorer',
    season: { months: [3, 4, 5], returns: 'Returns in March' },
    covers: [
      { name: 'Spring', title: 'Spring', tagline: 'Petals on a soft breeze', preview: require('../../assets/icons/covers/previews/spring.png'), rarity: 'uncommon', isNew: true },
    ],
  },
  {
    title: 'Summer',
    tagline: 'Sun, sea & palms — peak wandering.',
    access: 'explorer',
    season: { months: [6, 7, 8], returns: 'Returns in June' },
    covers: [
      { name: 'Summer', title: 'Summer', tagline: 'Sea, sand & sunshine', preview: require('../../assets/icons/covers/previews/summer.png'), rarity: 'uncommon', isNew: true },
    ],
  },
  {
    title: 'Autumn',
    tagline: 'Amber light & falling leaves.',
    access: 'explorer',
    season: { months: [9, 10, 11], returns: 'Returns in September' },
    covers: [
      { name: 'Autumn', title: 'Autumn', tagline: 'The golden season', preview: require('../../assets/icons/covers/previews/autumn.png'), rarity: 'uncommon', isNew: true },
    ],
  },
  {
    title: 'Lunar New Year',
    tagline: 'Lanterns & gold — a new year of journeys.',
    access: 'explorer',
    season: { months: [1, 2], returns: 'Returns in late January' },
    covers: [
      { name: 'LunarNewYear', title: 'Lunar New Year', tagline: 'Red & gold, lanterns lit', preview: require('../../assets/icons/covers/previews/lunar-new-year.png'), rarity: 'rare', isNew: true },
    ],
  },
  {
    title: 'Materials',
    tagline: 'Precious finishes on the Worldly mark.',
    access: 'premium',
    covers: [
      { name: 'Gold', title: 'Gold', tagline: '18-karat, midnight ground', preview: require('../../assets/icons/covers/previews/gold.png'), rarity: 'epic', isNew: true },
      { name: 'Marble', title: 'Marble', tagline: 'Carrara & gold veining', preview: require('../../assets/icons/covers/previews/marble.png'), rarity: 'epic', isNew: true },
    ],
  },
  {
    title: 'Atmosphere',
    tagline: 'Statement covers for collectors.',
    access: 'premium',
    covers: [
      { name: 'Galaxy', title: 'Galaxy', tagline: 'Nebula & starlight', preview: require('../../assets/icons/covers/previews/galaxy.png'), rarity: 'legendary', isNew: true },
      { name: 'ArtDeco', title: 'Art Deco', tagline: 'The golden age of travel', preview: require('../../assets/icons/covers/previews/art-deco.png'), rarity: 'epic', isNew: true },
    ],
  },
];
/* eslint-enable @typescript-eslint/no-require-imports */

type AppIconNative = {
  getState(): Promise<{ supported: boolean; current?: string | null }>;
  setIcon(name: string | null): Promise<string | null>;
};

const native = requireOptionalNativeModule<AppIconNative>('WorldlyAppIcon');

export interface CoverState {
  current: string | null;
}

/** Current cover state, or null when switching isn't available (older binary,
 *  Android, or a device that doesn't support alternate icons). Never throws. */
export async function getCoverState(): Promise<CoverState | null> {
  if (!native) return null;
  try {
    const s = await native.getState();
    return s.supported ? { current: s.current ?? null } : null;
  } catch {
    return null;
  }
}

// Listeners notified when the active cover changes — lets the cover theme
// (and thus the widget) update live rather than only on next app launch.
const coverListeners = new Set<() => void>();
export function subscribeCover(fn: () => void): () => void {
  coverListeners.add(fn);
  return () => {
    coverListeners.delete(fn);
  };
}

/** Apply a cover (null = the classic icon). Throws when it can't be applied. */
export async function applyCover(name: string | null): Promise<void> {
  if (!native) throw new Error('App icon switching unavailable in this build');
  await native.setIcon(name);
  for (const fn of coverListeners) fn();
}

/** Why a cover is still locked for this user, or null when it's available. */
export function lockReason(cover: CoverDef, countries: number, level: number): string | null {
  if (!cover.unlock) return null;
  if (cover.unlock.countries && countries < cover.unlock.countries) {
    return `Explore ${cover.unlock.countries} countries to unlock`;
  }
  if (cover.unlock.level && level < cover.unlock.level) {
    return `Reach Explorer Level ${cover.unlock.level} to unlock`;
  }
  return null;
}
