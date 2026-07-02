import Svg, { Path, Defs, ClipPath } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';

// The signature hero curve, traced from the design: a small rounded peak at the
// left, a deep narrow notch, a gentle recovery, then a long smooth sweep up to
// the right with a slight settle at the edge. Shared by every section hero so
// the border matches.
const CURVE =
  'M0,93 C16.3,91.2 64.2,78.5 98,82 C131.8,85.5 161.8,114 203,114 C244.2,114 296.8,86.7 345,82 C393.2,77.3 442.8,86.7 492,86 C541.2,85.3 582.5,83.2 640,78 C697.5,72.8 771.3,63.7 837,55 C902.7,46.3 966.8,34.3 1034,26 C1101.2,17.7 1182.3,8.3 1240,5 C1297.7,1.7 1346.7,5 1380,6 C1413.3,7 1430,10.2 1440,11';

/** The wave edge where a hero image melts into the page: a `pageColor` fill
 *  below the curve, plus a very soft warm-neutral shadow tucked under the wave
 *  edge (no stroke, no coloured border) to lift the page off the image. Pass
 *  `curve` to override the shape. Absolutely positioned at the hero's bottom. */
export function HeroWave({
  pageColor = COLORS.warmwhite,
  height = 82,
  curve = CURVE,
}: {
  pageColor?: string;
  height?: number;
  curve?: string;
}) {
  const fill = `${curve} L1440,121 L0,121 Z`;
  return (
    <Svg width="100%" height={height} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
      <Defs>
        {/* Clip the shadow to the page side so it only shows on the underside. */}
        <ClipPath id="heroWaveBelow">
          <Path d={fill} />
        </ClipPath>
      </Defs>
      {/* Page fill below the wave. */}
      <Path d={fill} fill={pageColor} />
      {/* Soft warm-neutral drop shadow hugging the underside of the wave edge —
          built from a few stacked translucent strokes so it reads as a ~5px
          blur without relying on SVG filters (which are flaky on Android). */}
      <Path d={curve} clipPath="url(#heroWaveBelow)" fill="none" stroke="rgba(74,55,40,0.05)" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={curve} clipPath="url(#heroWaveBelow)" fill="none" stroke="rgba(74,55,40,0.06)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={curve} clipPath="url(#heroWaveBelow)" fill="none" stroke="rgba(74,55,40,0.085)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
