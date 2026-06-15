import { Image } from 'expo-image';

const LOCKUP = require('../assets/images/worldly-lockup.png');
const ICON = require('../assets/images/worldly-icon.png');

const LOCKUP_RATIO = 1672 / 450; // colourful "W" cards + "worldly" wordmark, side by side
const ICON_RATIO = 762 / 450; // colourful "W" cards icon alone

/** The full Worldly lockup (colourful "W" + "worldly" wordmark), sized by height.
 *  Transparent background — the wordmark is dark navy, best on light surfaces. */
export function WorldlyLogo({ height = 24 }: { height?: number }) {
  return (
    <Image
      source={LOCKUP}
      style={{ height, width: height * LOCKUP_RATIO }}
      contentFit="contain"
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
    />
  );
}
