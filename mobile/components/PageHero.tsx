import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { DestinationImage } from './DestinationImage';

/** A page header in the Worldly language: eyebrow, Fraunces title, optional
 *  subtitle, and the signature wave edge melting into the page. Pass `imageCode`
 *  to back it with a destination photo (scrim applied) instead of a flat
 *  gradient. Native port of the web PageHero. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  gradient,
  imageCode,
  onBack,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  gradient: import('../src/lib/theme').Gradient;
  imageCode?: string;
  onBack?: () => void;
  dark?: boolean;
}) {
  const pageColor = dark ? COLORS.night : COLORS.warmwhite;

  const content = (
    <>
      {onBack && (
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={{ marginBottom: 8 }}
          className="h-9 w-9 rounded-full items-center justify-center bg-white/20"
        >
          <ChevronLeft size={20} color="#fff" />
        </Pressable>
      )}
      <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 2.5, opacity: 0.9 }}>
        {eyebrow.toUpperCase()}
      </Text>
      <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 36, marginTop: 4 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, marginTop: 6, opacity: 0.95, maxWidth: 340 }}>
          {subtitle}
        </Text>
      ) : null}

      <Svg
        width="100%"
        height={42}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}
      >
        <Path
          d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z"
          fill={pageColor}
        />
      </Svg>
    </>
  );

  const padding = { position: 'relative' as const, paddingTop: 64, paddingBottom: 52, paddingHorizontal: 20 };

  return (
    <View>
      {imageCode ? (
        <DestinationImage code={imageCode} scrim style={padding}>
          {content}
        </DestinationImage>
      ) : (
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={padding}>
          {content}
        </LinearGradient>
      )}
    </View>
  );
}
