import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/** A compact circular gauge showing a 0–100 discovery score, for use over a
 *  dark photo (white track + coloured progress + centred number). */
export function ScoreRing({
  score,
  size = 40,
  stroke = 4,
  color = '#FF6B9A',
}: {
  score: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.4)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ fontFamily: 'PlusJakarta-Bold', fontSize: size * 0.3, color: '#fff' }}>{Math.round(score)}</Text>
    </View>
  );
}
