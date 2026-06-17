import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, FlatList, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import {
  MapPin,
  Search,
  Bookmark,
  BookmarkCheck,
  Check,
  Compass,
  Users,
  Maximize2,
  Sun,
  Snowflake,
  Sparkles,
  UtensilsCrossed,
  BedDouble,
  Landmark,
  Ticket,
  Mountain,
} from 'lucide-react-native';
import { PageHero } from '../../components/PageHero';
import { DestinationImage } from '../../components/DestinationImage';
import { DiscoveryTile } from '../../components/DiscoveryTile';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, COUNTRIES } from '../../src/data/countries';
import { CONTINENTS, DISCOVERY_CATEGORIES, type Continent, type DiscoveryCategory } from '../../src/types';
import { COUNTRY_FACTS, type CountryFacts } from '../../src/data/countryFacts';
import { useWorldly } from '../../src/hooks/useWorldly';
import { HERO_CODES } from '../../src/lib/heroImages';
import { useData } from '../../src/store/data';

type Tab = 'browse' | 'discoveries';
type Entry = [string, CountryFacts];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DISC_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};
const DISC_LABEL: Record<DiscoveryCategory, string> = {
  food: 'Food',
  accommodation: 'Stays',
  culture: 'Culture',
  experience: 'Experiences',
  nature: 'Nature',
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/** A tappable country tile (image card) used in the continent carousels and
 *  the search grid. Tap opens the country; the bookmark toggles the wishlist. */
const CountryCard = memo(function CountryCard({
  code,
  width,
  discovered,
  saved,
  onToggle,
}: {
  code: string;
  width: number;
  discovered: boolean;
  saved: boolean;
  onToggle: (code: string) => void;
}) {
  return (
    <Pressable onPress={() => router.push(`/country/${code}`)} style={{ width }}>
      <DestinationImage code={code} scrim style={{ height: 168, borderRadius: 22, padding: 12, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 24, position: 'absolute', top: 10, left: 12 }}>{flagEmoji(code)}</Text>
        {discovered ? (
          <View className="rounded-full items-center justify-center" style={{ position: 'absolute', top: 10, right: 12, height: 28, width: 28, backgroundColor: 'rgba(255,107,154,0.92)' }}>
            <Check size={15} color="#fff" />
          </View>
        ) : (
          <Pressable onPress={() => onToggle(code)} hitSlop={8} className="rounded-full items-center justify-center" style={{ position: 'absolute', top: 10, right: 12, height: 28, width: 28, backgroundColor: saved ? COLORS.lavender : 'rgba(255,255,255,0.85)' }}>
            {saved ? <BookmarkCheck size={15} color="#fff" /> : <Bookmark size={15} color={COLORS.ink2} />}
          </Pressable>
        )}
        <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 17 }}>{countryName(code)}</Text>
      </DestinationImage>
    </Pressable>
  );
});

function Superlative({ entry, icon: Icon, label, value }: { entry: Entry; icon: ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  const [code] = entry;
  return (
    <Pressable onPress={() => router.push(`/country/${code}`)} style={{ marginHorizontal: 20 }}>
      <DestinationImage code={code} scrim style={{ height: 124, borderRadius: 22, padding: 16, justifyContent: 'flex-end' }}>
        <View className="flex-row items-center" style={{ gap: 6, position: 'absolute', top: 14, left: 16 }}>
          <Icon size={14} color="#fff" />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, opacity: 0.95 }}>{label.toUpperCase()}</Text>
        </View>
        <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 24 }}>{flagEmoji(code)} {countryName(code)}</Text>
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, marginTop: 1 }}>{value}</Text>
      </DestinationImage>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const { discoveries, discoveryStats, places, aggregates } = useWorldly();
  const { addPlace, removePlace } = useData();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('browse');
  const [query, setQuery] = useState('');
  const [discCat, setDiscCat] = useState<DiscoveryCategory | 'all'>('all');

  const discoveredCodes = useMemo(
    () => new Set(aggregates.filter((a) => a.discovered).map((a) => a.code)),
    [aggregates],
  );
  const wishlist = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of places) {
      if (p.kind === 'country' && p.relationships?.includes('aspiring') && !discoveredCodes.has(p.countryCode)) {
        m.set(p.countryCode, p.id);
      }
    }
    return m;
  }, [places, discoveredCodes]);

  // Read the live wishlist from a ref so the handler stays stable across
  // renders — lets the memoised CountryCards skip re-rendering on every toggle.
  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;
  const toggleWishlist = useCallback(
    (code: string) => {
      const existing = wishlistRef.current.get(code);
      if (existing) removePlace(existing);
      else addPlace({ kind: 'country', countryCode: code, relationships: ['aspiring'] });
    },
    [addPlace, removePlace],
  );

  // Superlatives (from the bundled country facts).
  const month = new Date().getMonth();
  const superlatives = useMemo(() => {
    const entries = Object.entries(COUNTRY_FACTS) as Entry[];
    const withTemp = entries.filter(([, f]) => f.temps && f.temps.length === 12);
    const byTemp = [...withTemp].sort((a, b) => b[1].temps![month] - a[1].temps![month]);
    return {
      mostPopulous: [...entries].sort((a, b) => b[1].population - a[1].population)[0],
      largest: [...entries].sort((a, b) => b[1].areaKm2 - a[1].areaKm2)[0],
      warmest: byTemp[0],
      coolest: byTemp[byTemp.length - 1],
    };
  }, [month]);

  const q = query.trim().toLowerCase();
  const searchHits = useMemo(
    () => (q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : []),
    [q],
  );
  const continents = useMemo(
    () =>
      CONTINENTS.map((cont: Continent) => ({ cont, rows: COUNTRIES.filter((c) => c.continent === cont) })).filter((s) => s.rows.length > 0),
    [],
  );

  const gridW = (width - 40 - 12) / 2;

  // Discoveries: filter by category, newest first.
  const shownDiscoveries = useMemo(() => {
    const list = discCat === 'all' ? discoveries : discoveries.filter((d) => d.category === discCat);
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [discoveries, discCat]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <PageHero eyebrow="The world, by the numbers" title="Explore" subtitle="Superlatives, your wishlist, and every country to dive into." gradient={GRADIENTS.explore} imageCodes={HERO_CODES.explore} motion />

        {/* segmented control */}
        <View className="flex-row bg-white rounded-2xl" style={{ marginHorizontal: 20, marginTop: 6, padding: 5, gap: 5 }}>
          {([['browse', 'Browse', Compass], ['discoveries', 'Discoveries', MapPin]] as const).map(([id, label, Icon]) => {
            const active = tab === id;
            return (
              <Pressable key={id} onPress={() => setTab(id)} className="flex-row items-center justify-center rounded-xl" style={{ flex: 1, paddingVertical: 10, gap: 6, backgroundColor: active ? COLORS.navy : 'transparent' }}>
                <Icon size={15} color={active ? '#fff' : COLORS.ink3} />
                <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? '#fff' : COLORS.ink3 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'browse' ? (
          <>
            {/* search */}
            <View className="flex-row items-center bg-white rounded-2xl" style={{ marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 8 }}>
              <Search size={18} color={COLORS.ink3} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search every country" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
            </View>

            {q ? (
              /* search results grid */
              <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
                {searchHits.length === 0 ? (
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>No countries found.</Text>
                ) : null}
                {searchHits.map((c) => (
                  <CountryCard key={c.code} code={c.code} width={gridW} discovered={discoveredCodes.has(c.code)} saved={wishlist.has(c.code)} onToggle={toggleWishlist} />
                ))}
              </View>
            ) : (
              <>
                {/* superlatives */}
                <Text style={H}>AROUND THE WORLD</Text>
                <View style={{ gap: 12 }}>
                  <Superlative entry={superlatives.mostPopulous} icon={Users} label="Most populous" value={`${fmtNum(superlatives.mostPopulous[1].population)} people`} />
                  <Superlative entry={superlatives.largest} icon={Maximize2} label="Largest country" value={`${fmtNum(superlatives.largest[1].areaKm2)} km²`} />
                  {superlatives.warmest ? <Superlative entry={superlatives.warmest} icon={Sun} label={`Warmest in ${MONTHS[month]}`} value={`${superlatives.warmest[1].temps![month]}°C average`} /> : null}
                  {superlatives.coolest ? <Superlative entry={superlatives.coolest} icon={Snowflake} label={`Coolest in ${MONTHS[month]}`} value={`${superlatives.coolest[1].temps![month]}°C average`} /> : null}
                </View>

                {/* wishlist */}
                {wishlist.size > 0 ? (
                  <>
                    <Text style={H}>YOUR WISHLIST</Text>
                    <FlatList
                      horizontal
                      data={[...wishlist.keys()]}
                      keyExtractor={(c) => c}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                      renderItem={({ item }) => (
                        <CountryCard code={item} width={132} discovered={false} saved onToggle={toggleWishlist} />
                      )}
                    />
                  </>
                ) : null}

                {/* continent carousels */}
                {continents.map((section) => (
                  <View key={section.cont} style={{ marginTop: 20 }}>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, paddingHorizontal: 20, marginBottom: 4 }}>{section.cont}</Text>
                    <FlatList
                      horizontal
                      data={section.rows}
                      keyExtractor={(c) => c.code}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12 }}
                      initialNumToRender={4}
                      windowSize={3}
                      renderItem={({ item }) => (
                        <CountryCard code={item.code} width={132} discovered={discoveredCodes.has(item.code)} saved={wishlist.has(item.code)} onToggle={toggleWishlist} />
                      )}
                    />
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={{ marginTop: 14 }}>
            {/* header + stats */}
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>My discoveries</Text>
              {discoveries.length > 0 ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 2 }}>
                  {[
                    `${discoveryStats.total} saved`,
                    discoveryStats.recommended ? `${discoveryStats.recommended} recommended` : null,
                    discoveryStats.hiddenGems ? `${discoveryStats.hiddenGems} hidden ${discoveryStats.hiddenGems === 1 ? 'gem' : 'gems'}` : null,
                  ].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>

            {discoveries.length === 0 ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 10 }}>Tap + to keep the first place worth remembering.</Text>
            ) : (
              <>
                {/* category filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
                  {(['all', ...DISCOVERY_CATEGORIES.filter((c) => discoveryStats.byCategory[c] > 0)] as const).map((c) => {
                    const active = discCat === c;
                    const Icon = c === 'all' ? Sparkles : DISC_ICON[c];
                    const label = c === 'all' ? 'All' : DISC_LABEL[c];
                    const count = c === 'all' ? discoveryStats.total : discoveryStats.byCategory[c];
                    return (
                      <Pressable key={c} onPress={() => setDiscCat(c)} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 13, paddingVertical: 8, gap: 6, backgroundColor: active ? COLORS.navy : '#fff' }}>
                        <Icon size={14} color={active ? '#fff' : COLORS.coral} />
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.ink2 }}>{label}</Text>
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: active ? 'rgba(255,255,255,0.7)' : COLORS.ink3 }}>{count}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* gallery grid */}
                {shownDiscoveries.length === 0 ? (
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, paddingHorizontal: 20 }}>No {discCat === 'all' ? '' : `${DISC_LABEL[discCat]} `}discoveries yet.</Text>
                ) : (
                  <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, gap: 12 }}>
                    {shownDiscoveries.map((d) => (
                      <DiscoveryTile key={d.id} discovery={d} width={gridW} onPress={() => router.push(`/discovery/${d.id}`)} />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const H = {
  fontFamily: 'PlusJakarta',
  fontSize: 12,
  fontWeight: '800' as const,
  letterSpacing: 1.5,
  color: COLORS.ink3,
  paddingHorizontal: 20,
  marginTop: 18,
  marginBottom: 10,
};
