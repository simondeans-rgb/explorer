// Worldly palette + gradient stops, shared across native components (used where
// NativeWind classes can't express a value, e.g. LinearGradient).

export const COLORS = {
  navy: '#14213D',
  coral: '#FF6B9A',
  lavender: '#9B7CFF',
  aqua: '#24D1C3',
  sunburst: '#FFB84D',
  warmwhite: '#FAFAFC',
  night: '#0E1018',
  ink2: '#48506B',
  ink3: '#8A90A6',
  white: '#FFFFFF',
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
