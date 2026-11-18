import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Line,
  Path,
  G,
} from 'react-native-svg';

/** The Worldly globe mark — a gradient roundel with a clean meridian globe.
 *  React-native-svg port of the web Brand mark. */
export function WorldlyMark({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessible accessibilityRole="image" accessibilityLabel="Worldly">
      <Defs>
        {/* Matches BRAND_GRADIENT (coral → lavender → aqua) so the mark can't
            diverge from the brand gradient used everywhere else (R5). */}
        <LinearGradient id="wm" x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FF6B9A" />
          <Stop offset="0.5" stopColor="#9B7CFF" />
          <Stop offset="1" stopColor="#24D1C3" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="56" height="56" rx="16" fill="url(#wm)" />
      <G fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round">
        <Circle cx="32" cy="32" r="15" opacity={0.95} />
        <Ellipse cx="32" cy="32" rx="6.4" ry="15" opacity={0.85} />
        <Line x1="17" y1="32" x2="47" y2="32" opacity={0.85} />
        <Path d="M20 24 Q32 30 44 24" opacity={0.7} />
        <Path d="M20 40 Q32 34 44 40" opacity={0.7} />
      </G>
    </Svg>
  );
}
