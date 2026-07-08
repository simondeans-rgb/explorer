import { Image } from 'expo-image';

const LOCKUP = require('../assets/images/worldly-lockup.png');
const LOCKUP_WHITE = require('../assets/images/worldly-lockup-white.png');
const ICON = require('../assets/images/worldly-icon.png');

const LOCKUP_RATIO = 1079 / 249; // full logo: map-pin "W" + "worldly" wordmark + coral route arc
const ICON_RATIO = 721 / 415; // colourful "W" cards icon alone

/** The full Worldly lockup (colourful "W" cards + "worldly" wordmark), sized by height.
 *  Transparent background. Pass `white` for the white-wordmark variant on dark surfaces. */
export function WorldlyLogo({ height = 24, white = false }: { height?: number; white?: boolean }) {
  return (
    <Image
      source={white ? LOCKUP_WHITE : LOCKUP}
      style={{ height, width: height * LOCKUP_RATIO }}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Worldly"
    />
  );
}

/** The colourful "W" travel-card icon alone (no wordmark), sized by height.
 *  Transparent background — reads well on any surface, light or dark. */
export function WorldlyIcon({ height = 40 }: { height?: number }) {
  return (
    <Image
      source={ICON}
      style={{ height, width: height * ICON_RATIO }}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Worldly"
    />
  );
}
