import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../src/lib/theme';
import { DestinationImage } from './DestinationImage';
import { HeroWave } from './HeroWave';
import { BackButton } from './BackButton';

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
  imageCodes,
  motion = false,
  onBack,
  dark = false,
  waveColor,
  minHeight,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  gradient: import('../src/lib/theme').Gradient;
  imageCode?: string;
  /** 2+ codes → the hero photo cross-fades between them on a timer. */
  imageCodes?: string[];
  motion?: boolean;
  onBack?: () => void;
  dark?: boolean;
  /** The section's accent colour for the wave line (Coral/Aqua/…). */
  waveColor?: string;
  /** Force a taller hero band so sections line up (e.g. to match Passport). */
  minHeight?: number;
}) {
  const pageColor = dark ? COLORS.night : COLORS.warmwhite;

  const inner = (
    <View style={{ paddingHorizontal: 20 }}>
      {onBack && <BackButton onPress={onBack} style={{ marginBottom: 10 }} />}
      {eyebrow ? (
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 2.5, opacity: 0.9 }}>
          {eyebrow.toUpperCase()}
        </Text>
      ) : null}
      <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 36, marginTop: 4 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, marginTop: 6, opacity: 0.95, maxWidth: 340 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  // The wave is a full-bleed child of the (un-padded) container so it reaches
  // both edges — an absolute child gets inset by container padding otherwise.
  const wave = <HeroWave color={waveColor} pageColor={pageColor} />;

  const padding = { position: 'relative' as const, paddingTop: 64, paddingBottom: 52, minHeight };

  return (
    <View>
      {imageCode || (imageCodes && imageCodes.length) ? (
        <DestinationImage code={imageCode ?? imageCodes![0]} codes={imageCodes} scrim motion={motion} style={padding}>
          {inner}
          {wave}
        </DestinationImage>
      ) : (
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={padding}>
          {inner}
          {wave}
        </LinearGradient>
      )}
    </View>
  );
}
