import { memo, useEffect, useState, type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { destinationImage } from '../src/lib/destinationImage';

/** The slow Ken-Burns drift — only mounted when `motion` is on, so static
 *  tiles pay none of the reanimated cost (Explore can show dozens at once). */
function KenBurnsImage({ photo, transition = 280 }: { photo: string; transition?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 19000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: 1.08 + t.value * 0.1 },
      { translateX: (t.value - 0.5) * 14 },
      { translateY: (t.value - 0.5) * -18 },
    ],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={transition} cachePolicy="memory-disk" />
    </Animated.View>
  );
}

/** A country "tile": its bundled destination photo (same imagery as the web)
 *  over an always-on brand gradient, with an optional dark scrim for legible
 *  white text. Pass `motion` for a slow Ken-Burns drift on the photo. Children
 *  render on top, laid out by the caller. */
export const DestinationImage = memo(function DestinationImage({
  code,
  codes,
  rotateMs = 7000,
  style,
  scrim = false,
  motion = false,
  onActiveCode,
  children,
}: {
  code: string;
  /** When 2+ codes are given, the photo cross-fades between them on a timer. */
  codes?: string[];
  rotateMs?: number;
  style?: StyleProp<ViewStyle>;
  scrim?: boolean;
  motion?: boolean;
  /** Fires with the country code currently on screen (incl. on rotation). */
  onActiveCode?: (code: string) => void;
  children?: ReactNode;
}) {
  const rotate = !!codes && codes.length > 1;
  const list = rotate ? (codes as string[]) : [code];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!rotate) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), rotateMs);
    return () => clearInterval(t);
  }, [rotate, list.length, rotateMs]);

  const activeCode = list[idx % list.length];
  useEffect(() => {
    onActiveCode?.(activeCode);
  }, [activeCode, onActiveCode]);

  const gradient = destinationImage(list[0]).gradient;
  const photo = destinationImage(list[idx % list.length]).photo;
  const transition = rotate ? 800 : 280;

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: gradient[0] }, style]}>
      {/* always-on gradient behind the photo (and the fallback when no photo) */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {photo ? (
        motion ? (
          <KenBurnsImage photo={photo} transition={transition} />
        ) : (
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={transition} cachePolicy="memory-disk" />
        )
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={['rgba(20,33,61,0)', 'rgba(20,33,61,0.28)', 'rgba(20,33,61,0.82)']}
          locations={[0.2, 0.56, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
});
