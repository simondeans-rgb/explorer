import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import {
  UtensilsCrossed,
  BedDouble,
  Landmark,
  Ticket,
  Mountain,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS, SHADOW, DISCOVERY_CATEGORY_COLOR } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import {
  DISCOVERY_CATEGORY_META,
  VERDICT_META,
  type Discovery,
  type DiscoveryCategory,
  type RecommendationVerdict,
} from '../src/types';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};

// Verdict badge colours, on-brand.
const VERDICT_CHIP: Record<RecommendationVerdict, { bg: string; fg: string }> = {
  recommend: { bg: COLORS.navy, fg: '#fff' },
  'hidden-gem': { bg: 'rgba(255,184,77,0.18)', fg: '#B5731A' },
  'worth-visiting': { bg: 'rgba(155,124,255,0.16)', fg: COLORS.lavender },
  overrated: { bg: 'rgba(20,33,61,0.06)', fg: COLORS.ink2 },
  avoid: { bg: 'rgba(224,36,94,0.12)', fg: '#E0245E' },
};

/** A discovery, rendered photo-first: its own photo thumbnail when present,
 *  else the category icon — with name, verdict badge, location and note. */
export function DiscoveryCard({ discovery: d, onPress }: { discovery: Discovery; onPress?: () => void }) {
  const Icon = CATEGORY_ICON[d.category];
  const cat = DISCOVERY_CATEGORY_COLOR[d.category];
  const place = [d.city, d.countryCode ? countryName(d.countryCode) : null].filter(Boolean).join(', ');
  const chip = d.verdict ? VERDICT_CHIP[d.verdict] : null;

  return (
    <Pressable onPress={onPress} className="bg-white rounded-3xl flex-row items-start" style={{ padding: 14, gap: 12, borderLeftWidth: 3, borderLeftColor: cat, ...SHADOW.card }}>
      {d.photo ? (
        <Image source={{ uri: d.photo }} style={{ height: 58, width: 58, borderRadius: 16 }} contentFit="cover" transition={200} cachePolicy="memory-disk" />
      ) : (
        <View className="rounded-2xl items-center justify-center" style={{ height: 48, width: 48, backgroundColor: `${cat}1F` }}>
          <Icon size={22} color={cat} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View className="flex-row items-start justify-between" style={{ gap: 8 }}>
          <Text style={{ flex: 1, fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{d.name}</Text>
          {chip ? (
            <View className="rounded-full" style={{ backgroundColor: chip.bg, paddingHorizontal: 9, paddingVertical: 3 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '700', color: chip.fg }}>{VERDICT_META[d.verdict!].label}</Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center" style={{ gap: 5, marginTop: 2 }}>
          {d.countryCode ? <Text style={{ fontSize: 12 }}>{flagEmoji(d.countryCode)}</Text> : null}
          <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
            {[place, DISCOVERY_CATEGORY_META[d.category].label].filter(Boolean).join(' · ')}
          </Text>
        </View>
        {d.note ? (
          <Text style={{ fontFamily: 'Fraunces', fontSize: 14, fontStyle: 'italic', color: COLORS.ink2, marginTop: 8, borderLeftWidth: 2, borderLeftColor: 'rgba(255,107,154,0.5)', paddingLeft: 10 }}>
            {d.note}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
