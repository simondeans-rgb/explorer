import { memo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { UtensilsCrossed, BedDouble, Landmark, Ticket, Mountain, Camera } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { DestinationImage } from './DestinationImage';
import { COLORS, DISCOVERY_CATEGORY_COLOR } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import { DISCOVERY_CATEGORY_META, VERDICT_META, type Discovery, type DiscoveryCategory, type RecommendationVerdict } from '../src/types';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};

const VERDICT_COLOR: Record<RecommendationVerdict, string> = {
  recommend: COLORS.navy,
  'hidden-gem': '#B5731A',
  'worth-visiting': COLORS.lavender,
  overrated: COLORS.ink2,
  avoid: '#E0245E',
};

const SCRIM = ['transparent', 'rgba(15,16,24,0.05)', 'rgba(15,16,24,0.82)'] as const;

/** A swipeable "fan" of discovery cards — a hand-of-cards coverflow. The centred
 *  card sits upright and forward; neighbours rotate out from a shared bottom
 *  pivot and fall back. Snaps card-to-card. */
export function DiscoveryFan({ discoveries, onPress }: { discoveries: Discovery[]; onPress: (d: Discovery) => void }) {
  const { width } = useWindowDimensions();
  const cardW = Math.min(198, Math.round(width * 0.52));
  const cardH = Math.round(cardW * 1.42);
  const step = Math.round(cardW * 0.66); // < cardW so cards overlap into a fan
  const sidePad = (width - step) / 2;

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: sidePad, height: cardH + 44, alignItems: 'flex-start', paddingTop: 4 }}
    >
      {discoveries.map((d, i) => (
        <FanCard key={d.id} d={d} i={i} scrollX={scrollX} step={step} cardW={cardW} cardH={cardH} onPress={onPress} />
      ))}
    </Animated.ScrollView>
  );
}

const FanCard = memo(function FanCard({
  d,
  i,
  scrollX,
  step,
  cardW,
  cardH,
  onPress,
}: {
  d: Discovery;
  i: number;
  scrollX: SharedValue<number>;
  step: number;
  cardW: number;
  cardH: number;
  onPress: (d: Discovery) => void;
}) {
  const Icon = CATEGORY_ICON[d.category];
  const place = [d.city, d.countryCode ? countryName(d.countryCode) : null].filter(Boolean).join(', ');
  const input = [(i - 1) * step, i * step, (i + 1) * step];

  const animated = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${interpolate(scrollX.value, input, [13, 0, -13], Extrapolation.CLAMP)}deg` },
      { translateY: interpolate(scrollX.value, input, [22, 0, 22], Extrapolation.CLAMP) },
      { scale: interpolate(scrollX.value, input, [0.9, 1, 0.9], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, input, [0.8, 1, 0.8], Extrapolation.CLAMP),
    zIndex: Math.round(interpolate(scrollX.value, input, [1, 3, 1], Extrapolation.CLAMP)),
  }));

  return (
    // The slot is `step` wide; the card (wider) overflows it to overlap neighbours.
    <View style={{ width: step, alignItems: 'center' }}>
      <Animated.View style={[{ width: cardW, transformOrigin: 'center bottom' }, animated]}>
        <Pressable onPress={() => onPress(d)}>
          <View style={{ width: cardW, height: cardH, borderRadius: 26, overflow: 'hidden', backgroundColor: COLORS.warmwhite, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } }}>
            {d.photo ? (
              <>
                <Image source={{ uri: d.photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                <LinearGradient colors={SCRIM} locations={[0.25, 0.55, 1]} style={StyleSheet.absoluteFill} />
              </>
            ) : (
              <DestinationImage code={d.countryCode ?? 'WW'} scrim style={StyleSheet.absoluteFill}>
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 6 }]}>
                  <Camera size={26} color="rgba(255,255,255,0.85)" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Add a photo</Text>
                </View>
              </DestinationImage>
            )}

            <View style={[StyleSheet.absoluteFill, { padding: 16, justifyContent: 'flex-end' }]}>
              <View className="rounded-full items-center justify-center" style={{ position: 'absolute', top: 14, left: 14, height: 34, width: 34, backgroundColor: DISCOVERY_CATEGORY_COLOR[d.category] }}>
                <Icon size={17} color="#fff" />
              </View>
              {d.verdict ? (
                <View className="rounded-full" style={{ position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', color: VERDICT_COLOR[d.verdict] }}>{VERDICT_META[d.verdict].label}</Text>
                </View>
              ) : null}

              <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22, lineHeight: 25 }}>{d.name}</Text>
              <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.92, marginTop: 3 }}>
                {d.countryCode ? `${flagEmoji(d.countryCode)} ` : ''}{place || DISCOVERY_CATEGORY_META[d.category].label}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
});
