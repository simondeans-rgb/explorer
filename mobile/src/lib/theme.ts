// Worldly palette + gradient stops, shared across native components (used where
// NativeWind classes can't express a value, e.g. LinearGradient).

export const COLORS = {
  navy: '#14213D',
  coral: '#FF6B9A',
  lavender: '#9B7CFF',
  aqua: '#24D1C3',
  sunburst: '#FFB84D',
  sky: '#4DA6FF',
  warmwhite: '#FAFAFC',
  night: '#0E1018',
  ink: '#14213D',
  ink2: '#48506B',
  ink3: '#8A90A6',
  white: '#FFFFFF',
  danger: '#F2557D', // brand-aligned destructive (coral-red, not finance red)
} as const;

/** Shared scales so new/edited components stop hardcoding ad-hoc values. */
export const RADIUS = { sm: 12, md: 16, lg: 24, xl: 28, pill: 999 } as const;
export const SPACE = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 } as const;

/** Soft, premium elevation — spread into a `style`. `glow(color)` tints the shadow. */
export const SHADOW = {
  card: { shadowColor: '#14213D', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  float: { shadowColor: '#14213D', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  glow: (color: string) => ({ shadowColor: color, shadowOpacity: 0.33, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 }),
} as const;

/** Coral → lavender → aqua: the signature brand gradient. */
export const BRAND_GRADIENT = ['#FF6B9A', '#9B7CFF', '#24D1C3'] as const;

/** Per-surface gradients (mirror the web page-hero system). */
export const GRADIENTS = {
  story: ['#FF6B9A', '#9B7CFF', '#24D1C3'],
  atlas: ['#7C6BFF', '#5B6CFF', '#24D1C3'],
  explore: ['#FF6B9A', '#FF7A66', '#FFB84D'],
  you: ['#FF6B9A', '#9B7CFF', '#24D1C3'],
  saved: ['#9B7CFF', '#FF6B9A'],
  sunrise: ['#9B7CFF', '#FF6B9A', '#FFB84D'],
} as const;

export type Gradient = readonly [string, string, ...string[]];

/** A distinct hue per discovery category so categories read as categories — coral
 *  is reserved for primary actions, not blanket-applied to every category icon. */
export const DISCOVERY_CATEGORY_COLOR = {
  food: '#FFB84D', // amber
  accommodation: '#9B7CFF', // purple
  culture: '#24D1C3', // teal
  experience: '#FF8A5B', // warm orange
  nature: '#34C77B', // green
} as const;
