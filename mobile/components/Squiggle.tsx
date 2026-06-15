import Svg, { Path } from 'react-native-svg';

const CORAL = '#FF6B9A';

/** A short hand-drawn wavy underline (used under the brand tagline). */
export function Squiggle({
  width = 120,
  height = 12,
  color = CORAL,
  strokeWidth = 3.4,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 12" fill="none">
      <Path
        d="M3 7 Q18 2 33 7 T63 7 T93 7 T117 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A flowing hand-drawn squiggle underline with an upward flick (used under
 *  the script tagline). */
export function SquiggleFlourish({
  width = 150,
  height = 26,
  color = CORAL,
  strokeWidth = 3.4,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 150 26" fill="none">
      <Path
        d="M3 14 Q20 6 38 13 T74 13 T110 12 C126 11 138 12 147 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
