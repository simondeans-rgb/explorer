import Svg, { Path } from 'react-native-svg';

const CORAL = '#FF6B9A';

/** A simple hand-drawn tapered underline stroke (used under the brand tagline). */
export function Squiggle({
  width = 130,
  height = 16,
  color = CORAL,
  strokeWidth = 4,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 22" fill="none">
      <Path
        d="M8 15 C46 9 104 7 172 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A hand-drawn swoosh that arcs right then doubles back into a small hook
 *  (used under the script tagline). */
export function SquiggleFlourish({
  width = 172,
  height = 53,
  color = CORAL,
  strokeWidth = 4.5,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 260 80" fill="none">
      <Path
        d="M12 30 C60 14 150 12 205 22 C224 26 236 27 242 31 C248 41 200 53 150 60 C138 63 128 60 126 52"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
