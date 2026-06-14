import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import {
  UtensilsCrossed,
  BedDouble,
  Landmark,
  Ticket,
  Mountain,
  MapPin,
  Search,
  Bookmark,
  BookmarkCheck,
  Check,
  Compass,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { PageHero } from '../../components/PageHero';
import { Fab } from '../../components/Fab';
import { AddDiscoverySheet } from '../../components/AddDiscoverySheet';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, COUNTRIES } from '../../src/data/countries';
import {
  CONTINENTS,
  DISCOVERY_CATEGORY_META,
  VERDICT_META,
  type Continent,
  type DiscoveryCategory,
} from '../../src/types';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useData } from '../../src/store/data';

type Tab = 'browse' | 'discoveries';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};

export default function ExploreScreen() {
  const { discoveries, places, aggregates } = useWorldly();
  const { addPlace, removePlace } = useData();
  const [tab, setTab] = useState<Tab>('browse');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const discoveredCodes = useMemo(
    () => new Set(aggregates.filter((a) => a.discovered).map((a) => a.code)),
    [aggregates],
  );
  // code -> place id for wish-listed (aspiring, not yet discovered) countries.
  const wishlist = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of places) {
      if (
        p.kind === 'country' &&
        p.relationships.includes('aspiring') &&
        !discoveredCodes.has(p.countryCode)
      ) {
        m.set(p.countryCode, p.id);
      }
    }
    return m;
  }, [places, discoveredCodes]);

  function toggleWishlist(code: string) {
    const existing = wishlist.get(code);
    if (existing) removePlace(existing);
    else addPlace({ kind: 'country', countryCode: code, relationships: ['aspiring'] });
  }

  // Group the browse list: a flat filtered list while searching, else by continent.
  const q = query.trim().toLowerCase();
  const sections = useMemo(() => {
    if (q) {
      const hits = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
      return [{ title: `${hits.length} result${hits.length === 1 ? '' : 's'}`, rows: hits }];
    }
    return CONTINENTS.map((cont: Continent) => ({
      title: cont,
      rows: COUNTRIES.filter((c) => c.continent === cont),
    })).filter((s) => s.rows.length > 0);
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <PageHero eyebrow="The world, country by country" title="Explore" subtitle="Find destinations and keep the places worth remembering." gradient={GRADIENTS.explore} />

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
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search every country"
                placeholderTextColor={COLORS.ink3}
                style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
              />
            </View>

            {/* wishlist summary */}
            {wishlist.size > 0 && !q ? (
              <View style={{ marginTop: 14 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, paddingHorizontal: 20 }}>
                  Your wishlist
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 10 }}>
                  {[...wishlist.keys()].map((code) => (
                    <Pressable key={code} onPress={() => toggleWishlist(code)}>
                      <View className="rounded-2xl items-center justify-center" style={{ width: 96, height: 96, backgroundColor: 'rgba(155,124,255,0.12)' }}>
                        <Text style={{ fontSize: 30 }}>{flagEmoji(code)}</Text>
                        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.navy, marginTop: 4, paddingHorizontal: 6 }}>
                          {countryName(code)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* country list, grouped */}
            <View style={{ marginTop: 6 }}>
              {sections.map((section) => (
                <View key={section.title} style={{ marginTop: 12 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: COLORS.ink3, paddingHorizontal: 20, marginBottom: 6 }}>
                    {section.title.toUpperCase()}
                  </Text>
                  {section.rows.map((c) => {
                    const discovered = discoveredCodes.has(c.code);
                    const saved = wishlist.has(c.code);
                    return (
                      <Pressable
                        key={c.code}
                        onPress={() => !discovered && toggleWishlist(c.code)}
                        className="flex-row items-center bg-white"
                        style={{ marginHorizontal: 20, marginBottom: 8, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, gap: 12 }}
                      >
                        <Text style={{ fontSize: 26 }}>{flagEmoji(c.code)}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>{c.name}</Text>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{c.continent}</Text>
                        </View>
                        {discovered ? (
                          <View className="rounded-full flex-row items-center" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
                            <Check size={13} color={COLORS.coral} />
                            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.coral }}>In your world</Text>
                          </View>
                        ) : (
                          <View className="rounded-full items-center justify-center" style={{ height: 36, width: 36, backgroundColor: saved ? COLORS.lavender : COLORS.warmwhite }}>
                            {saved ? <BookmarkCheck size={18} color="#fff" /> : <Bookmark size={18} color={COLORS.ink3} />}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>My discoveries</Text>
            {discoveries.length === 0 ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>
                Tap + to keep the first place worth remembering.
              </Text>
            ) : null}
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
        )}
      </ScrollView>

      {tab === 'discoveries' ? (
        <>
          <Fab onPress={() => setAddOpen(true)} />
          <AddDiscoverySheet visible={addOpen} onClose={() => setAddOpen(false)} />
        </>
      ) : null}
    </View>
  );
}
