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
