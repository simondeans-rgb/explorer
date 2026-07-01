import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';

// The signature hero curve, traced from the design: a softened tall peak, a
// steep drop to a deep narrow trough, a rounded second peak, a dip, then a long
// sweep up on the right. Shared by every section hero so the border matches.
const CURVE =
  'M0,83 C85,80 175,35 250,35 C305,35 382,102 410,102 C445,102 525,52 605,52 C695,52 731,83 821,83 C971,83 1190,30 1440,30';

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
