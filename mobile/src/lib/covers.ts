// Passport Covers — switchable app icons. The icon assets live in the native
// binary (via the expo-alternate-app-icons config plugin); this registry holds
// the product metadata: display copy, bundled previews and unlock rules.
//
// The package's JS entry calls requireNativeModule at import time, which
// throws on binaries built before the plugin was added — so it's require()'d
// lazily and everything degrades to a read-only preview. OTA-safe.

export interface CoverDef {
  /** Plugin icon name (PascalCase); null = the default Worldly icon. */
  name: string | null;
  title: string;
  tagline: string;
  preview: number;
  /** Requirement to unlock; covers without one are always available. */
  unlock?: { countries?: number; level?: number };
}

export interface CoverSection {
  title: string;
  covers: CoverDef[];
}

/* eslint-disable @typescript-eslint/no-require-imports -- static require paths, resolved by the bundler */
export const COVER_SECTIONS: CoverSection[] = [
  {
    title: 'Core collection',
    covers: [
      { name: null, title: 'Classic Worldly', tagline: 'The vibrant original', preview: require('../../assets/icons/covers/previews/classic.png') },
      { name: 'Midnight', title: 'Midnight', tagline: 'Sleek & sophisticated', preview: require('../../assets/icons/covers/previews/midnight.png') },
      { name: 'Pearl', title: 'Pearl', tagline: 'Clean & elegant', preview: require('../../assets/icons/covers/previews/pearl.png') },
      { name: 'Pride', title: 'Pride', tagline: 'Celebrate every journey', preview: require('../../assets/icons/covers/previews/pride.png') },
      { name: 'Earth', title: 'Earth', tagline: 'Natural & grounded', preview: require('../../assets/icons/covers/previews/earth.png') },
      { name: 'Sunset', title: 'Sunset', tagline: 'Warm & optimistic', preview: require('../../assets/icons/covers/previews/sunset.png') },
      { name: 'Ocean', title: 'Ocean', tagline: 'Calm & refreshing', preview: require('../../assets/icons/covers/previews/ocean.png') },
      { name: 'Aurora', title: 'Aurora', tagline: 'Magical & inspiring', preview: require('../../assets/icons/covers/previews/aurora.png'), unlock: { level: 5 } },
    ],
  },
  {
    title: 'Lifestyle',
    covers: [
      { name: 'Sakura', title: 'Sakura', tagline: 'Japan-inspired', preview: require('../../assets/icons/covers/previews/sakura.png') },
      { name: 'Tropical', title: 'Tropical', tagline: 'Sun, sea, paradise', preview: require('../../assets/icons/covers/previews/tropical.png') },
      { name: 'Winter', title: 'Winter', tagline: 'Cool & serene', preview: require('../../assets/icons/covers/previews/winter.png') },
      { name: 'Coffee', title: 'Coffee', tagline: 'Warm & comforting', preview: require('../../assets/icons/covers/previews/coffee.png') },
      { name: 'FrequentFlyer', title: 'Frequent Flyer', tagline: 'Travel in style', preview: require('../../assets/icons/covers/previews/frequent-flyer.png'), unlock: { countries: 10 } },
      { name: 'Luxury', title: 'Luxury', tagline: 'Premium & exclusive', preview: require('../../assets/icons/covers/previews/luxury.png'), unlock: { level: 8 } },
      { name: 'Neon', title: 'Neon', tagline: 'Bold & energetic', preview: require('../../assets/icons/covers/previews/neon.png'), unlock: { countries: 25 } },
    ],
  },
  {
    title: 'Seasonal & special',
    covers: [
      { name: 'Christmas', title: 'Christmas', tagline: 'Festive cheer', preview: require('../../assets/icons/covers/previews/christmas.png') },
      { name: 'Halloween', title: 'Halloween', tagline: 'Spooky season', preview: require('../../assets/icons/covers/previews/halloween.png') },
    ],
  },
];
/* eslint-enable @typescript-eslint/no-require-imports */

type AltIconsModule = {
  supportsAlternateIcons: boolean;
  setAlternateAppIcon(name: string | null): Promise<string | null>;
  getAppIconName(): string | null;
};

/** The alternate-icons native module, or null on binaries without it. */
export function altIcons(): AltIconsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: native module absent in older builds
    const mod = require('expo-alternate-app-icons') as AltIconsModule;
    return mod.supportsAlternateIcons ? mod : null;
  } catch {
    return null;
  }
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
