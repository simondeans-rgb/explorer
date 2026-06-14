import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Globe2, MapPinned } from 'lucide-react-native';
import { PageHero } from '../../components/PageHero';
import { WorldMap } from '../../components/WorldMap';
import { DestinationImage } from '../../components/DestinationImage';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { RELATIONSHIP_META, JOURNEY_MODE_META } from '../../src/types';
import { useWorldly } from '../../src/hooks/useWorldly';

type Tab = 'places' | 'journeys';

export default function AtlasScreen() {
  const { aggregates, discoveries, expeditions } = useWorldly();
  const [tab, setTab] = useState<Tab>('places');
  const discovered = aggregates.filter((a) => a.discovered);

  const discCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of discoveries) if (d.countryCode) m[d.countryCode] = (m[d.countryCode] ?? 0) + 1;
    return m;
  }, [discoveries]);

  const visited = useMemo(
    () => new Set(aggregates.filter((a) => a.discovered).map((a) => a.code)),
    [aggregates],
  );
  const wishlist = useMemo(
    () => new Set(aggregates.filter((a) => !a.discovered && a.aspiring).map((a) => a.code)),
    [aggregates],
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 110 }}>
      <PageHero eyebrow="Your collection" title="Atlas" subtitle="Every place you've been — map, country, journey." gradient={GRADIENTS.atlas} imageCode="WW" />

      {/* segmented control */}
      <View className="flex-row bg-white rounded-2xl" style={{ marginHorizontal: 20, marginTop: 6, padding: 5, gap: 5 }}>
        {([['places', 'Places', Globe2], ['journeys', 'Journeys', MapPinned]] as const).map(([id, label, Icon]) => {
          const active = tab === id;
          return (
            <Pressable key={id} onPress={() => setTab(id)} className="flex-row items-center justify-center rounded-xl" style={{ flex: 1, paddingVertical: 10, gap: 6, backgroundColor: active ? COLORS.navy : 'transparent' }}>
              <Icon size={15} color={active ? '#fff' : COLORS.ink3} />
              <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? '#fff' : COLORS.ink3 }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'places' ? (
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <WorldMap visited={visited} wishlist={wishlist} />
          <View className="flex-row" style={{ marginTop: 10, gap: 16, paddingHorizontal: 4 }}>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.coral }} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{visited.size} discovered</Text>
            </View>
            {wishlist.size > 0 ? (
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.lavender }} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{wishlist.size} wish-listed</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
        {tab === 'places' && discovered.length === 0 ? (
          <View className="bg-white rounded-3xl items-center" style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36 }}>🗺️</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>No places yet</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              Tap + to add the first country you've been to.
            </Text>
          </View>
        ) : null}
        {tab === 'journeys' && expeditions.length === 0 ? (
          <View className="bg-white rounded-3xl items-center" style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36 }}>✈️</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>No journeys yet</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              Tap + to record a trip and how you travelled.
            </Text>
          </View>
        ) : null}
        {tab === 'places'
          ? discovered.map((a) => {
              const chips = a.relationships.filter((r) => r !== 'aspiring');
              return (
                <Pressable key={a.code} onPress={() => router.push(`/country/${a.code}`)} className="bg-white rounded-3xl" style={{ overflow: 'hidden' }}>
                  <DestinationImage code={a.code} scrim style={{ height: 132, padding: 14, justifyContent: 'flex-end' }}>
                    <Text style={{ fontSize: 30, position: 'absolute', top: 12, left: 14 }}>{flagEmoji(a.code)}</Text>
                    {discCount[a.code] ? (
                      <View className="rounded-full" style={{ position: 'absolute', top: 12, right: 14, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{discCount[a.code]} found</Text>
                      </View>
                    ) : null}
                    <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>{countryName(a.code)}</Text>
                    <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95 }}>
                      {a.continent}{a.firstYear ? ` · since ${a.firstYear}` : ''}
                    </Text>
                  </DestinationImage>
                  {chips.length > 0 || a.cities.length > 0 ? (
                    <View className="flex-row flex-wrap" style={{ gap: 6, padding: 14 }}>
                      {chips.map((r) => (
                        <View key={r} className="rounded-full" style={{ backgroundColor: 'rgba(20,33,61,0.06)', paddingHorizontal: 10, paddingVertical: 4 }}>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink2 }}>{RELATIONSHIP_META[r].label}</Text>
                        </View>
                      ))}
                      {a.cities.map((c) => (
                        <View key={c.id} className="rounded-full" style={{ backgroundColor: 'rgba(20,33,61,0.04)', paddingHorizontal: 10, paddingVertical: 4 }}>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink2 }}>{c.name}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Pressable>
              );
            })
          : expeditions.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => e.countryCodes[0] && router.push(`/country/${e.countryCodes[0]}`)}
                className="bg-white rounded-3xl"
                style={{ overflow: 'hidden' }}
              >
                <DestinationImage code={e.countryCodes[0] ?? 'WW'} scrim style={{ height: 132, padding: 14, justifyContent: 'flex-end' }}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>{e.title}</Text>
                  <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95 }}>
                    {e.countryCodes.map((c) => flagEmoji(c)).join(' ')}  ·  {e.startDate?.slice(0, 4)}
                    {e.journeys[0] ? ` · ${JOURNEY_MODE_META[e.journeys[0].mode].label}` : ''}
                  </Text>
                </DestinationImage>
              </Pressable>
            ))}
      </View>
    </ScrollView>
    </View>
  );
}
