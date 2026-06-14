import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Globe2, MapPinned } from 'lucide-react-native';
import { PageHero } from '../../components/PageHero';
import { WorldMap } from '../../components/WorldMap';
import { RouteMap } from '../../components/RouteMap';
import { DestinationImage } from '../../components/DestinationImage';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { RELATIONSHIP_META, JOURNEY_MODE_META } from '../../src/types';
import { routeSegments } from '../../src/lib/journeyGeo';
import { useWorldly } from '../../src/hooks/useWorldly';

type Tab = 'places' | 'journeys';
type Scope = 'all' | number;

const yearOf = (iso?: string, created?: number) =>
  iso ? new Date(iso).getFullYear() : created ? new Date(created).getFullYear() : undefined;

function ScopeChips({ scope, years, onChange }: { scope: Scope; years: number[]; onChange: (s: Scope) => void }) {
  if (years.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, gap: 8 }}>
      {(['all', ...years] as Scope[]).map((s) => {
        const active = scope === s;
        return (
          <Pressable key={String(s)} onPress={() => onChange(s)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? COLORS.navy : '#fff' }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: active ? '#fff' : COLORS.ink3 }}>{s === 'all' ? 'All time' : s}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function AtlasScreen() {
  const { aggregates, discoveries, expeditions } = useWorldly();
  const [tab, setTab] = useState<Tab>('places');
  const [scope, setScope] = useState<Scope>('all');
  const discovered = useMemo(() => aggregates.filter((a) => a.discovered), [aggregates]);

  const discCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of discoveries) if (d.countryCode) m[d.countryCode] = (m[d.countryCode] ?? 0) + 1;
    return m;
  }, [discoveries]);

  // Year lists for the two maps.
  const placeYears = useMemo(() => {
    const set = new Set<number>();
    for (const a of discovered) {
      if (a.firstYear) set.add(a.firstYear);
      for (const c of a.cities) if (c.firstYear) set.add(c.firstYear);
    }
    return [...set].sort((x, y) => y - x);
  }, [discovered]);
  const journeyYears = useMemo(() => {
    const set = new Set<number>();
    for (const e of expeditions) {
      const y = yearOf(e.startDate, e.createdAt);
      if (y) set.add(y);
    }
    return [...set].sort((x, y) => y - x);
  }, [expeditions]);

  const inScope = (a: (typeof discovered)[number]) =>
    scope === 'all' || a.firstYear === scope || a.cities.some((c) => c.firstYear === scope);

  const shownPlaces = useMemo(() => discovered.filter(inScope), [discovered, scope]);
  const visited = useMemo(() => new Set(shownPlaces.map((a) => a.code)), [shownPlaces]);
  const wishlist = useMemo(
    () => (scope === 'all' ? new Set(aggregates.filter((a) => !a.discovered && a.aspiring).map((a) => a.code)) : new Set<string>()),
    [aggregates, scope],
  );

  const shownJourneys = useMemo(
    () => (scope === 'all' ? expeditions : expeditions.filter((e) => yearOf(e.startDate, e.createdAt) === scope)),
    [expeditions, scope],
  );
  const segments = useMemo(() => routeSegments(shownJourneys), [shownJourneys]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 110 }}>
      <PageHero eyebrow="Your collection" title="Atlas" subtitle="Every place you've been — map, country, journey." gradient={GRADIENTS.atlas} imageCode="WW" />

      {/* segmented control */}
      <View className="flex-row bg-white rounded-2xl" style={{ marginHorizontal: 20, marginTop: 6, padding: 5, gap: 5 }}>
        {([['places', 'Places', Globe2], ['journeys', 'Journeys', MapPinned]] as const).map(([id, label, Icon]) => {
          const active = tab === id;
          return (
            <Pressable key={id} onPress={() => { setTab(id); setScope('all'); }} className="flex-row items-center justify-center rounded-xl" style={{ flex: 1, paddingVertical: 10, gap: 6, backgroundColor: active ? COLORS.navy : 'transparent' }}>
              <Icon size={15} color={active ? '#fff' : COLORS.ink3} />
              <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? '#fff' : COLORS.ink3 }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'places' ? (
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <ScopeChips scope={scope} years={placeYears} onChange={setScope} />
          <WorldMap visited={visited} wishlist={wishlist} />
          <View className="flex-row" style={{ marginTop: 10, gap: 16, paddingHorizontal: 4 }}>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.coral }} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{visited.size} discovered{scope === 'all' ? '' : ` in ${scope}`}</Text>
            </View>
            {wishlist.size > 0 ? (
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.lavender }} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{wishlist.size} wish-listed</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <ScopeChips scope={scope} years={journeyYears} onChange={setScope} />
          <RouteMap segments={segments} />
          <View className="flex-row items-center" style={{ marginTop: 10, gap: 6, paddingHorizontal: 4 }}>
            <View style={{ height: 3, width: 16, borderRadius: 2, backgroundColor: COLORS.coral }} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
              {segments.length} flight route{segments.length === 1 ? '' : 's'}{scope === 'all' ? '' : ` in ${scope}`}
            </Text>
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
        {tab === 'places' && shownPlaces.length === 0 ? (
          <View className="bg-white rounded-3xl items-center" style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36 }}>🗺️</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>{scope === 'all' ? 'No places yet' : `Nothing from ${scope}`}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              {scope === 'all' ? "Tap + to add the first country you've been to." : 'Try another year.'}
            </Text>
          </View>
        ) : null}
        {tab === 'journeys' && shownJourneys.length === 0 ? (
          <View className="bg-white rounded-3xl items-center" style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36 }}>✈️</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>{scope === 'all' ? 'No journeys yet' : `Nothing from ${scope}`}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              {scope === 'all' ? 'Tap + to record a trip and how you travelled.' : 'Try another year.'}
            </Text>
          </View>
        ) : null}
        {tab === 'places'
          ? shownPlaces.map((a) => {
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
          : shownJourneys.map((e) => (
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
