import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  MapPin,
  Camera,
  Plus,
  UtensilsCrossed,
  BedDouble,
  Landmark,
  Ticket,
  Mountain,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { AddDiscoverySheet } from '../../components/AddDiscoverySheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { DestinationImage } from '../../components/DestinationImage';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, continentOf } from '../../src/data/countries';
import {
  RELATIONSHIP_META,
  DISCOVERY_CATEGORY_META,
  VERDICT_META,
  JOURNEY_MODE_META,
  type DiscoveryCategory,
} from '../../src/types';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useData } from '../../src/store/data';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginBottom: 10 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function CountryScreen() {
  const { code: rawCode } = useLocalSearchParams<{ code: string }>();
  const code = (rawCode ?? '').toUpperCase();
  const { aggregates, discoveries, expeditions } = useWorldly();
  const { captures } = useData();
  const [discOpen, setDiscOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const agg = useMemo(() => aggregates.find((a) => a.code === code), [aggregates, code]);
  const myDiscoveries = useMemo(() => discoveries.filter((d) => d.countryCode === code), [discoveries, code]);
  const myJourneys = useMemo(() => expeditions.filter((e) => e.countryCodes.includes(code)), [expeditions, code]);
  const myPhotos = useMemo(() => captures.filter((c) => c.countryCode === code), [captures, code]);

  const name = countryName(code) || code;
  const continent = agg?.continent ?? continentOf(code);
  const rels = (agg?.relationships ?? []).filter((r) => r !== 'aspiring');
  const cities = agg?.cities ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <DestinationImage code={code} scrim style={{ position: 'relative', paddingTop: 60, paddingBottom: 52, paddingHorizontal: 20, minHeight: 240, justifyContent: 'flex-end' }}>
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, left: 20 }}>
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <Text style={{ fontSize: 52 }}>{flagEmoji(code)}</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38, marginTop: 6 }}>{name}</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95, marginTop: 2 }}>
            {continent ?? 'Somewhere on Earth'}
            {agg?.firstYear ? ` · since ${agg.firstYear}` : ''}
          </Text>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {/* Quick actions */}
        <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          <Pressable onPress={() => setDiscOpen(true)} className="flex-row items-center justify-center bg-white rounded-2xl" style={{ flex: 1, paddingVertical: 13, gap: 7 }}>
            <Plus size={16} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Discovery</Text>
          </Pressable>
          <Pressable onPress={() => setPhotoOpen(true)} className="flex-row items-center justify-center bg-white rounded-2xl" style={{ flex: 1, paddingVertical: 13, gap: 7 }}>
            <Camera size={16} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Photo</Text>
          </Pressable>
        </View>

        {/* Your connection */}
        {rels.length > 0 || agg?.aspiring ? (
          <Section title="Your connection">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {agg?.aspiring && rels.length === 0 ? (
                <View className="rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.16)', paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.lavender }}>On your wishlist</Text>
                </View>
              ) : null}
              {rels.map((r) => (
                <View key={r} className="rounded-full" style={{ backgroundColor: COLORS.navy, paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: '#fff' }}>{RELATIONSHIP_META[r].label}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {/* Cities */}
        {cities.length > 0 ? (
          <Section title="Cities">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {cities.map((c) => (
                <View key={c.id} className="rounded-full bg-white" style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>{c.name}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {/* Memories */}
        {myPhotos.length > 0 ? (
          <Section title={`Memories (${myPhotos.length})`}>
            <View style={{ marginHorizontal: -20 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {myPhotos.map((p) => (
                  <View key={p.id} style={{ width: 150, borderRadius: 20, overflow: 'hidden' }}>
                    <Image source={{ uri: p.dataUrl }} style={{ width: 150, height: 190 }} contentFit="cover" transition={200} />
                    {p.caption ? (
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, paddingTop: 30 }}>
                        <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600' }}>{p.caption}</Text>
                      </LinearGradient>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </View>
          </Section>
        ) : null}

        {/* Discoveries */}
        {myDiscoveries.length > 0 ? (
          <Section title={`Discoveries (${myDiscoveries.length})`}>
            <View style={{ gap: 10 }}>
              {myDiscoveries.map((d) => {
                const Icon = CATEGORY_ICON[d.category];
                return (
                  <View key={d.id} className="bg-white rounded-3xl flex-row items-start" style={{ padding: 16, gap: 12 }}>
                    <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: COLORS.warmwhite }}>
                      <Icon size={18} color={COLORS.coral} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{d.name}</Text>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2 }}>
                        {[d.city, DISCOVERY_CATEGORY_META[d.category].label].filter(Boolean).join(' · ')}
                      </Text>
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
          </Section>
        ) : null}

        {/* Journeys */}
        {myJourneys.length > 0 ? (
          <Section title={`Journeys (${myJourneys.length})`}>
            <View style={{ gap: 10 }}>
              {myJourneys.map((e) => (
                <View key={e.id} className="bg-white rounded-3xl" style={{ padding: 16 }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{e.title}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2 }}>
                    {e.countryCodes.map((c) => flagEmoji(c)).join(' ')}
                    {e.startDate ? ` · ${e.startDate.slice(0, 4)}` : ''}
                    {e.journeys[0] ? ` · ${JOURNEY_MODE_META[e.journeys[0].mode].label}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {/* Empty */}
        {rels.length === 0 && !agg?.aspiring && myDiscoveries.length === 0 && myPhotos.length === 0 && myJourneys.length === 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, textAlign: 'center' }}>
              Nothing here yet. Add a discovery or photo to start {name}'s story.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <AddDiscoverySheet visible={discOpen} onClose={() => setDiscOpen(false)} initialCountryCode={code} />
      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} initialCountryCode={code} />
    </View>
  );
}
