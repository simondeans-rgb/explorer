import Svg, { Path, Defs, ClipPath } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';

// The signature hero curve, traced from the design: a small rounded peak at the
// left, a deep narrow notch, a gentle recovery, then a long smooth sweep up to
// the right with a slight settle at the edge. Shared by every section hero so
// the border matches.
const CURVE =
  'M0,99 C12,97.2 37,85 72,88 C107,91 165.3,117.2 210,117 C254.7,116.8 288.3,92.2 340,87 C391.7,81.8 450,88.5 520,86 C590,83.5 678.3,79.7 760,72 C841.7,64.3 930,50.3 1010,40 C1090,29.7 1168.3,14.5 1240,10 C1311.7,5.5 1406.7,12.5 1440,13';

/** The wave edge where a hero image melts into the page: a `pageColor` fill
 *  below the curve, plus a very soft warm-neutral shadow tucked under the wave
 *  edge (no stroke, no coloured border) to lift the page off the image. Pass
 *  `curve` to override the shape. Absolutely positioned at the hero's bottom. */
export function HeroWave({
  pageColor = COLORS.warmwhite,
  height = 74,
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
