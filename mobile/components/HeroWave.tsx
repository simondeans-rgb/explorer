import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';

// The signature Story-hero curve, traced from the design: a crest near the
// left, a deep dip, a modest middle hump, a second dip, then a long sweep up on
// the right. Shared by every section hero so the border reads identically.
const CURVE =
  'M0,61 C50,58 90,44 144,44 C240,44 360,93 460,93 C560,93 640,57 720,57 C810,57 910,95 1008,95 C1130,95 1280,30 1440,30';

/** The wave edge where a hero image melts into the page: a `pageColor` fill
 *  below the curve, and an optional coloured line tracing it (the section's
 *  accent). Pass `curve` to override the default shape. Absolutely positioned
 *  at the bottom of its hero container. */
export function HeroWave({
  color,
  pageColor = COLORS.warmwhite,
  height = 74,
  curve = CURVE,
}: {
  color?: string;
  pageColor?: string;
  height?: number;
  curve?: string;
}) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
      <Path d={`${curve} L1440,121 L0,121 Z`} fill={pageColor} />
      {color ? <Path d={curve} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </Svg>
  );
}
