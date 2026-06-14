import type { ReactNode } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { destinationImage } from '../src/lib/destinationImage';

/** A country "tile": its bundled destination photo (same imagery as the web)
 *  over an always-on brand gradient, with an optional dark scrim for legible
 *  white text. Children render on top, laid out by the caller. */
export function DestinationImage({
  code,
  style,
  scrim = false,
  children,
}: {
  code: string;
  style?: StyleProp<ViewStyle>;
  scrim?: boolean;
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
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={280}
          cachePolicy="memory-disk"
        />
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={['rgba(20,33,61,0)', 'rgba(20,33,61,0.28)', 'rgba(20,33,61,0.82)']}
          locations={[0.2, 0.56, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      ) : null}
      {children}
    </View>
  );
}
