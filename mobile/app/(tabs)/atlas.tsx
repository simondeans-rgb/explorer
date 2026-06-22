import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Globe2, MapPinned, Search } from 'lucide-react-native';
import { PageHero } from '../../components/PageHero';
import { WorldMap } from '../../components/WorldMap';
import { JourneyGlobe } from '../../components/JourneyGlobe';
import { DestinationImage } from '../../components/DestinationImage';
import { AtlasCountryCard } from '../../components/AtlasCountryCard';
import { AtlasSummary } from '../../components/AtlasSummary';
import { DiscoveryScoreSheet } from '../../components/DiscoveryScoreSheet';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, COUNTRIES } from '../../src/data/countries';
import { routeSegments } from '../../src/lib/journeyGeo';
import { shareMapPoster } from '../../src/lib/mapPoster';
import { useWorldly } from '../../src/hooks/useWorldly';
import type { CountryAggregate } from '../../src/lib/stats';
import { HERO_CODES } from '../../src/lib/heroImages';
import { useAuth } from '../../src/store/auth';

type SortBy = 'az' | 'found' | 'recent';

// Total countries we know about per continent — the denominator for progress.
const TOTAL_BY_CONTINENT: Record<string, number> = (() => {
  const m: Record<string, number> = {};
  for (const c of COUNTRIES) m[c.continent] = (m[c.continent] ?? 0) + 1;
  return m;
})();

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
  const { aggregates, discoveries, expeditions, stats } = useWorldly();
  const [tab, setTab] = useState<Tab>('places');
  const [scope, setScope] = useState<Scope>('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('az');
  const [scoreAgg, setScoreAgg] = useState<CountryAggregate | null>(null);
  const discovered = useMemo(() => aggregates.filter((a) => a.discovered), [aggregates]);

  // Discovered-country count per continent (numerator for progress).
  const discByContinent = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of discovered) if (a.continent) m[a.continent] = (m[a.continent] ?? 0) + 1;
    return m;
  }, [discovered]);
  const worldPct = (stats.countriesDiscovered / COUNTRIES.length) * 100;

  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  async function shareMap() {
    if (sharing) return;
    setSharing(true);
    try {
      await shareMapPoster({
        firstName: user?.displayName || (user?.email ? user.email.split('@')[0] : 'Explorer'),
        countries: stats.countriesDiscovered,
        cities: stats.citiesDiscovered,
        continents: stats.continentsDiscovered,
        pct: worldPct,
        visited: new Set(discovered.map((a) => a.code)),
        flagCodes: stats.flagCodes,
      });
    } catch {
      // user cancelled or share unavailable — no-op
    } finally {
      setSharing(false);
    }
  }

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

  // Search + sort applied to the country list (not the map/legend).
  const listPlaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = shownPlaces;
    if (q) {
      list = list.filter(
        (a) => countryName(a.code).toLowerCase().includes(q) || a.cities.some((c) => c.name.toLowerCase().includes(q)),
      );
    }
    const byName = (a: (typeof list)[number], b: (typeof list)[number]) => countryName(a.code).localeCompare(countryName(b.code));
    const sorted = [...list];
    if (sortBy === 'found') sorted.sort((a, b) => (discCount[b.code] ?? 0) - (discCount[a.code] ?? 0) || byName(a, b));
    else if (sortBy === 'recent') sorted.sort((a, b) => (b.firstYear ?? 0) - (a.firstYear ?? 0) || byName(a, b));
    else sorted.sort(byName);
    return sorted;
  }, [shownPlaces, query, sortBy, discCount]);

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
      <PageHero title="Your Atlas" subtitle="The world you've explored" gradient={GRADIENTS.atlas} imageCodes={HERO_CODES.atlas} motion />

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
          <View style={{ marginHorizontal: -20, marginTop: 10 }}>
            <WorldMap visited={visited} wishlist={wishlist} onPressCountry={(code) => router.push(`/country/${code}`)} />
          </View>
          <View className="flex-row items-center" style={{ marginTop: 10, gap: 16, paddingHorizontal: 4 }}>
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
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginLeft: 'auto' }}>Pinch to zoom · tap a country ›</Text>
          </View>

          {/* Your world — overview stats + continent progress (all-time) */}
          {discovered.length > 0 ? (
            <AtlasSummary
              stats={stats}
              worldPct={worldPct}
              journeys={expeditions.length}
              discByContinent={discByContinent}
              totalByContinent={TOTAL_BY_CONTINENT}
              onShare={shareMap}
              sharing={sharing}
            />
          ) : null}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <ScopeChips scope={scope} years={journeyYears} onChange={setScope} />
          <View style={{ marginHorizontal: -20, marginTop: 10 }}>
            <JourneyGlobe segments={segments} maxSize={360} />
          </View>
          <View className="flex-row items-center" style={{ marginTop: 10, gap: 6, paddingHorizontal: 4 }}>
            <View style={{ height: 3, width: 16, borderRadius: 2, backgroundColor: COLORS.coral }} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
              {segments.length} flight route{segments.length === 1 ? '' : 's'}{scope === 'all' ? '' : ` in ${scope}`}
            </Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginLeft: 'auto' }}>Drag to spin ↺</Text>
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

        {/* search + sort (Places) */}
        {tab === 'places' && shownPlaces.length > 0 ? (
          <>
            <View className="flex-row items-center bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
              <Search size={18} color={COLORS.ink3} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search your countries & cities" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink }} />
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              {([['az', 'A–Z'], ['found', 'Most found'], ['recent', 'Recent']] as [SortBy, string][]).map(([id, label]) => {
                const active = sortBy === id;
                return (
                  <Pressable key={id} onPress={() => setSortBy(id)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? COLORS.navy : '#fff' }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: active ? '#fff' : COLORS.ink3 }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
        {tab === 'places' && shownPlaces.length > 0 && listPlaces.length === 0 ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, textAlign: 'center', paddingVertical: 16 }}>No countries match “{query}”.</Text>
        ) : null}

        {tab === 'places'
          ? listPlaces.map((a) => (
              <AtlasCountryCard key={a.code} aggregate={a} discoveries={discCount[a.code] ?? 0} onScorePress={() => setScoreAgg(a)} />
            ))
          : shownJourneys.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => router.push(`/journey/${e.id}`)}
                className="bg-white rounded-3xl"
                style={{ overflow: 'hidden' }}
              >
                <DestinationImage code={e.countryCodes[0] ?? 'WW'} scrim style={{ height: 132, padding: 14, justifyContent: 'flex-end' }}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>{e.title}</Text>
                  <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95 }}>
                    {e.countryCodes.map((c) => flagEmoji(c)).join(' ')}  ·  {e.startDate?.slice(0, 4)}
                    {e.journeys.length ? ` · ${e.journeys.length} ${e.journeys.length === 1 ? 'leg' : 'legs'}` : ''}
                  </Text>
                  {e.note ? (
                    <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.8, marginTop: 1 }}>{e.note}</Text>
                  ) : null}
                </DestinationImage>
              </Pressable>
            ))}
      </View>
    </ScrollView>
    <DiscoveryScoreSheet visible={!!scoreAgg} onClose={() => setScoreAgg(null)} aggregate={scoreAgg} />
    </View>
  );
}
