import Svg, { Path, Defs, ClipPath } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';

// The signature hero curve, traced from the design: a small "W" scallop at the
// lower left (the Worldly mark echoed in the border — a shoulder, two sharp
// valleys with a middle peak, another shoulder), a gentle plateau, then a long
// smooth sweep up to the right. Shared by every section hero so the border
// matches.
const CURVE =
  'M0,93 C12.2,91.3 62.5,77.9 86,81 C109.5,84.1 148.6,113 166,115 C183.4,117 197.7,95 209,95 C220.3,95 229.4,117 246,115 C262.6,113 291.1,85.1 326,81 C360.9,76.9 447.5,86.4 492,86 C536.5,85.6 591.1,82.4 640,78 C688.9,73.6 781.2,62.4 837,55 C892.8,47.6 976.9,33.1 1034,26 C1091.1,18.9 1191,7.8 1240,5 C1289,2.2 1351.7,5.2 1380,6 C1408.3,6.8 1431.5,10.3 1440,11';

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
