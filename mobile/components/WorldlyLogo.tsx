import { Image } from 'expo-image';

const SRC = require('../assets/images/worldly-logo.png');
const RATIO = 640 / 304; // intrinsic aspect of the wordmark

/** The Worldly wordmark logo, sized by height. */
export function WorldlyLogo({ height = 24 }: { height?: number }) {
  return <Image source={SRC} style={{ height, width: height * RATIO }} contentFit="contain" />;
}
