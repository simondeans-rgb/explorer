import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

/** A coloured page header in the Worldly language: eyebrow, Fraunces title,
 *  optional subtitle, and the signature wave edge melting into the page.
 *  Native port of the web PageHero. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  gradient,
  onBack,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  gradient: import('../src/lib/theme').Gradient;
  onBack?: () => void;
  dark?: boolean;
}) {
  const pageColor = dark ? COLORS.night : COLORS.warmwhite;
  return (
    <View>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'relative', paddingTop: 64, paddingBottom: 52, paddingHorizontal: 20 }}
      >
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
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 2.5, opacity: 0.85 }}>
          {eyebrow.toUpperCase()}
        </Text>
        <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 36, marginTop: 4 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, marginTop: 6, opacity: 0.9, maxWidth: 340 }}>
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
      </LinearGradient>
    </View>
  );
}
