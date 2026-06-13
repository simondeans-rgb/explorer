import { View, Text, ScrollView } from 'react-native';
import {
  UtensilsCrossed,
  BedDouble,
  Landmark,
  Ticket,
  Mountain,
  MapPin,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { PageHero } from '../../components/PageHero';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import {
  DISCOVERY_CATEGORY_META,
  VERDICT_META,
  type DiscoveryCategory,
} from '../../src/types';
import { useWorldly } from '../../src/hooks/useWorldly';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};

export default function ExploreScreen() {
  const { discoveries } = useWorldly();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 40 }}>
      <PageHero eyebrow="The world, country by country" title="Explore" subtitle="Find destinations and keep the places worth remembering." gradient={GRADIENTS.explore} />

      <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>My discoveries</Text>
        {discoveries.map((d) => {
          const Icon = CATEGORY_ICON[d.category];
          const place = [d.city, d.countryCode ? countryName(d.countryCode) : null].filter(Boolean).join(', ');
          return (
            <View key={d.id} className="bg-white rounded-3xl flex-row items-start" style={{ padding: 16, gap: 12 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: COLORS.warmwhite }}>
                <Icon size={18} color={COLORS.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{d.name}</Text>
                <View className="flex-row items-center" style={{ gap: 5, marginTop: 2 }}>
                  {d.countryCode ? <Text style={{ fontSize: 12 }}>{flagEmoji(d.countryCode)}</Text> : null}
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
                    {place} · {DISCOVERY_CATEGORY_META[d.category].label}
                  </Text>
                </View>
              </View>
              {d.verdict ? (
                <View className="rounded-full flex-row items-center" style={{ borderWidth: 1, borderColor: 'rgba(255,107,154,0.4)', paddingHorizontal: 9, paddingVertical: 3, gap: 3 }}>
                  <MapPin size={10} color={COLORS.coral} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '700', color: COLORS.coral }}>{VERDICT_META[d.verdict].label}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
