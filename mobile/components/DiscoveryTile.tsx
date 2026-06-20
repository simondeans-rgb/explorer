import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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

// Verdict label colour (on a white pill), reused from DiscoveryCard's palette.
const VERDICT_COLOR: Record<RecommendationVerdict, string> = {
  recommend: COLORS.navy,
  'hidden-gem': '#B5731A',
  'worth-visiting': COLORS.lavender,
  overrated: COLORS.ink2,
  avoid: '#E0245E',
};

const SCRIM = ['transparent', 'rgba(15,16,24,0.05)', 'rgba(15,16,24,0.8)'] as const;

/** A discovery as a visual gallery tile: its own photo (or the country's photo
 *  / a brand gradient when absent), with category, verdict, name and place. */
export const DiscoveryTile = memo(function DiscoveryTile({ discovery: d, width, onPress }: { discovery: Discovery; width: number; onPress?: () => void }) {
  const Icon = CATEGORY_ICON[d.category];
  const place = [d.city, d.countryCode ? countryName(d.countryCode) : null].filter(Boolean).join(', ');

  return (
    <Pressable onPress={onPress} style={{ width }}>
      <View style={{ height: 192, borderRadius: 22, overflow: 'hidden', backgroundColor: COLORS.warmwhite }}>
        {/* background */}
        {d.photo ? (
          <>
            <Image source={{ uri: d.photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
            <LinearGradient colors={SCRIM} locations={[0.25, 0.55, 1]} style={StyleSheet.absoluteFill} />
          </>
        ) : (
          <DestinationImage code={d.countryCode ?? 'WW'} scrim style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 5 }]}>
              <Camera size={22} color="rgba(255,255,255,0.85)" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Add a photo</Text>
            </View>
          </DestinationImage>
        )}

        {/* overlays */}
        <View style={[StyleSheet.absoluteFill, { padding: 12, justifyContent: 'flex-end' }]}>
          <View className="rounded-full items-center justify-center" style={{ position: 'absolute', top: 12, left: 12, height: 30, width: 30, backgroundColor: DISCOVERY_CATEGORY_COLOR[d.category] }}>
            <Icon size={15} color="#fff" />
          </View>
          {d.verdict ? (
            <View className="rounded-full" style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 9, paddingVertical: 4 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '800', color: VERDICT_COLOR[d.verdict] }}>{VERDICT_META[d.verdict].label}</Text>
            </View>
          ) : null}

          <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 17, lineHeight: 20 }}>{d.name}</Text>
          <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, opacity: 0.92, marginTop: 2 }}>
            {d.countryCode ? `${flagEmoji(d.countryCode)} ` : ''}{place || DISCOVERY_CATEGORY_META[d.category].label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
