import { memo, useEffect, type ReactNode } from 'react';
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
function KenBurnsImage({ photo }: { photo: string }) {
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
      <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={280} cachePolicy="memory-disk" />
    </Animated.View>
  );
}

/** A country "tile": its bundled destination photo (same imagery as the web)
 *  over an always-on brand gradient, with an optional dark scrim for legible
 *  white text. Pass `motion` for a slow Ken-Burns drift on the photo. Children
 *  render on top, laid out by the caller. */
export const DestinationImage = memo(function DestinationImage({
  code,
  style,
  scrim = false,
  motion = false,
  children,
}: {
  code: string;
  style?: StyleProp<ViewStyle>;
  scrim?: boolean;
  motion?: boolean;
  children?: ReactNode;
}) {
  const { photo, gradient } = destinationImage(code);

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
          <KenBurnsImage photo={photo} />
        ) : (
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={280} cachePolicy="memory-disk" />
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
