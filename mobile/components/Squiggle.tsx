import Svg, { Path } from 'react-native-svg';

/** A short hand-drawn wavy underline (used under the brand tagline). */
export function Squiggle({
  width = 120,
  height = 10,
  color = '#B7A6FF',
  strokeWidth = 3,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 10" fill="none">
      <Path
        d="M3 6 Q18 1 33 6 T63 6 T93 6 T117 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A looping hand-drawn flourish (used under the script tagline). */
export function SquiggleFlourish({
  width = 150,
  height = 26,
  color = '#B7A6FF',
  strokeWidth = 3,
}: {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 150 26" fill="none">
      <Path
        d="M10 19 C-1 11 16 3 20 13 C23 21 41 19 59 12 C88 1 120 8 146 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
