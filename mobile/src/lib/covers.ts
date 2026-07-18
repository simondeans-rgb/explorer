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
}

export interface CoverSection {
  title: string;
  /** Editorial line under the section header (packs get one). */
  tagline?: string;
  /** Who gets this section once billing is live. 'earned' = achievement covers
   *  (free once unlocked — never sold); 'explorer' = included with Explorer. */
  access?: 'free' | 'explorer' | 'earned';
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
    ],
  },
  {
    title: 'Unlock these',
    tagline: 'Earned by travelling — yours free forever once unlocked.',
    access: 'earned',
    covers: [
      { name: 'Aurora', title: 'Aurora', tagline: 'Northern lights, bottled', preview: require('../../assets/icons/covers/previews/aurora.png'), unlock: { level: 5 } },
      { name: 'FrequentFlyer', title: 'Frequent Flyer', tagline: 'Contrails & departures', preview: require('../../assets/icons/covers/previews/frequent-flyer.png'), unlock: { countries: 10 } },
      { name: 'Luxury', title: 'Luxury', tagline: 'Gold dust & midnight', preview: require('../../assets/icons/covers/previews/luxury.png'), unlock: { level: 8 } },
      { name: 'Neon', title: 'Neon', tagline: 'Synthwave nights', preview: require('../../assets/icons/covers/previews/neon.png'), unlock: { countries: 25 } },
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

/** Apply a cover (null = the classic icon). Throws when it can't be applied. */
export async function applyCover(name: string | null): Promise<void> {
  if (!native) throw new Error('App icon switching unavailable in this build');
  await native.setIcon(name);
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
