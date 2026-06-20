import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType } from 'react';
import {
  Plane, Home, Briefcase, GraduationCap, Anchor, Sparkles, Compass,
  TrainFront, Ship, Car,
  UtensilsCrossed, BedDouble, Landmark, Ticket, Mountain,
  Globe2, Building2, Map as MapIcon, Award, BookOpen,
} from 'lucide-react-native';
import { PageHero } from '../components/PageHero';
import { goBack } from '../src/lib/nav';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { shareAlmanacBook } from '../src/lib/almanacBook';
import { flagEmoji } from '../src/lib/flags';
import { hasDestinationPhoto } from '../src/lib/destinationImage';
import { evaluateRecognitions } from '../src/lib/recognitions';
import {
  CONTINENTS,
  JOURNEY_MODES,
  JOURNEY_MODE_META,
  RELATIONSHIPS,
  RELATIONSHIP_META,
  type Continent,
  type Relationship,
  type JourneyMode,
  type Expedition,
} from '../src/types';
import { useWorldly } from '../src/hooks/useWorldly';
import { useAuth } from '../src/store/auth';

type IconCmp = ComponentType<{ size?: number; color?: string }>;

const REL_ICON: Record<Relationship, IconCmp> = {
  visited: Plane, lived: Home, worked: Briefcase, studied: GraduationCap, based: Anchor, born: Sparkles, aspiring: Compass,
};
const MODE_ICON: Record<JourneyMode, IconCmp> = {
  flight: Plane, rail: TrainFront, cruise: Ship, road: Car, ferry: Anchor,
};

function expeditionYear(e: Expedition): number {
  return e.startDate ? new Date(e.startDate).getFullYear() : new Date(e.createdAt).getFullYear();
}

export default function AlmanacScreen() {
  const { places, aggregates, stats, discoveries, discoveryStats, expeditions, journeyStats } = useWorldly();
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Explorer');
  const currentYear = new Date().getFullYear();
  const [edition, setEdition] = useState<'lifetime' | number>('lifetime');
  const [exporting, setExporting] = useState(false);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const p of places) if (p.firstYear) set.add(p.firstYear);
    for (const d of discoveries) set.add(new Date(d.createdAt).getFullYear());
    for (const e of expeditions) set.add(expeditionYear(e));
    return [...set].sort((a, b) => b - a);
  }, [places, discoveries, expeditions]);

  const relationshipCounts = useMemo(() => {
    const counts = {} as Record<Relationship, number>;
    for (const r of RELATIONSHIPS) {
      counts[r] = r === 'aspiring'
        ? aggregates.filter((a) => a.aspiring).length
        : aggregates.filter((a) => a.discovered && a.relationships.includes(r)).length;
    }
    return counts;
  }, [aggregates]);

  const discovered = aggregates.filter((a) => a.discovered);
  const byContinent = useMemo(() => {
    const map = new Map<Continent, typeof discovered>();
    for (const a of discovered) {
      if (!a.continent) continue;
      const list = map.get(a.continent) ?? [];
      list.push(a);
      map.set(a.continent, list);
    }
    return map;
  }, [discovered]);

  const earned = useMemo(() => evaluateRecognitions(stats, discoveryStats).filter((r) => r.earned), [stats, discoveryStats]);

  const yearView = typeof edition === 'number';
  const yearPlaces = yearView ? places.filter((p) => p.firstYear === edition) : [];
  const yearDiscoveries = yearView ? discoveries.filter((d) => new Date(d.createdAt).getFullYear() === edition) : [];
  const yearExpeditions = yearView ? expeditions.filter((e) => expeditionYear(e) === edition) : [];

  const heroCode = discovered.find((a) => hasDestinationPhoto(a.code))?.code ?? 'WW';

  const figures: [string, number, IconCmp][] = [
    ['Countries discovered', stats.countriesDiscovered, Globe2],
    ['Cities discovered', stats.citiesDiscovered, Building2],
    ['Journeys completed', expeditions.length, Plane],
    ['Discoveries made', discoveryStats.total, Compass],
    ['Continents reached', stats.continentsDiscovered, MapIcon],
    ['Recognitions earned', earned.length, Award],
  ];

  const catRows: [keyof typeof discoveryStats.byCategory, string, IconCmp][] = [
    ['food', 'Food & Drink', UtensilsCrossed],
    ['accommodation', 'Stays', BedDouble],
    ['culture', 'Culture', Landmark],
    ['experience', 'Experiences', Ticket],
    ['nature', 'Nature', Mountain],
  ];

  async function exportBook() {
    if (exporting) return;
    setExporting(true);
    try {
      await shareAlmanacBook({
        firstName,
        generatedOn: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        figures: figures.map(([label, value]) => ({ label, value })),
        continents: CONTINENTS.filter((c) => byContinent.has(c)).map((c) => ({
          name: c,
          countries: (byContinent.get(c) ?? []).map((a) => ({ code: a.code, name: a.name })),
        })),
        relationships: RELATIONSHIPS.filter((r) => relationshipCounts[r] > 0).map((r) => ({
          label: RELATIONSHIP_META[r].label,
          count: relationshipCounts[r],
        })),
        categories: catRows
          .map(([key, label]) => ({ label, count: discoveryStats.byCategory[key] }))
          .filter((c) => c.count > 0),
        recognitions: earned.map((r) => ({ symbol: r.symbol, title: r.title, description: r.description })),
      });
    } catch {
      /* user dismissed or print unavailable */
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        <PageHero
          eyebrow="Your travel story"
          title="The Almanac"
          subtitle="A beautiful record of everywhere you've been — published from your own world."
          gradient={['#FFB84D', '#FF6B9A', '#9B7CFF']}
          imageCode={heroCode}
          onBack={goBack}
        />

        {/* edition chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>
          <Chip label="Lifetime" active={edition === 'lifetime'} onPress={() => setEdition('lifetime')} />
          {years.map((y) => (
            <Chip key={y} label={y === currentYear ? `${y} · this year` : String(y)} active={edition === y} onPress={() => setEdition(y)} />
          ))}
        </ScrollView>

        {!yearView ? (
          <>
            {/* figures */}
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
              {figures.map(([label, value, Icon]) => (
                <View key={label} className="bg-white rounded-3xl" style={{ flexBasis: '47%', flexGrow: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
                  <View className="rounded-xl items-center justify-center" style={{ height: 30, width: 30, backgroundColor: 'rgba(255,107,154,0.12)', marginBottom: 8 }}>
                    <Icon size={16} color={COLORS.coral} />
                  </View>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 34, color: COLORS.coral, lineHeight: 38 }}>{value}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink3, marginTop: 2 }}>{label.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* export as a printable photo book */}
            <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
              <Pressable onPress={exportBook} disabled={exporting} style={{ borderRadius: 24, overflow: 'hidden', opacity: exporting ? 0.6 : 1 }}>
                <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 }}>
                  <BookOpen size={18} color="#fff" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>{exporting ? 'Preparing your book…' : 'Export as photo book'}</Text>
                </LinearGradient>
              </Pressable>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 8, textAlign: 'center' }}>A printable PDF keepsake of your Almanac.</Text>
            </View>

            {/* relationships */}
            <Section title="Relationships with places">
              <Grid>
                {RELATIONSHIPS.map((r) => (
                  <Stat key={r} value={relationshipCounts[r]} label={RELATIONSHIP_META[r].label} icon={REL_ICON[r]} />
                ))}
              </Grid>
            </Section>

            {/* journeys */}
            {journeyStats.total > 0 ? (
              <Section title="Journeys taken">
                <Grid>
                  {JOURNEY_MODES.filter((m) => journeyStats.byMode[m] > 0).map((m) => (
                    <Stat key={m} value={journeyStats.byMode[m]} label={JOURNEY_MODE_META[m].label} icon={MODE_ICON[m]} />
                  ))}
                </Grid>
              </Section>
            ) : null}

            {/* discoveries */}
            {discoveryStats.total > 0 ? (
              <Section title="Discoveries">
                <Grid>
                  <Stat value={discoveryStats.total} label="Total" />
                  <Stat value={discoveryStats.recommended} label="Recommended" />
                  {catRows.map(([key, label, Icon]) => (
                    <Stat key={key} value={discoveryStats.byCategory[key]} label={label} icon={Icon} />
                  ))}
                </Grid>
              </Section>
            ) : null}

            {/* by continent */}
            <Section title="The world, by continent">
              <View style={{ gap: 10 }}>
                {CONTINENTS.filter((c) => byContinent.has(c)).map((c) => {
                  const list = byContinent.get(c) ?? [];
                  return (
                    <View key={c} className="bg-white rounded-2xl" style={{ padding: 16 }}>
                      <View className="flex-row items-center justify-between" style={{ marginBottom: 10 }}>
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>{c}</Text>
                        <View className="rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 10, paddingVertical: 3 }}>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.coral }}>{list.length} {list.length === 1 ? 'country' : 'countries'}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 24, lineHeight: 32 }}>{list.map((a) => flagEmoji(a.code)).join('  ')}</Text>
                    </View>
                  );
                })}
                {byContinent.size === 0 ? (
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>Add a country to begin your almanac.</Text>
                ) : null}
              </View>
            </Section>

            {/* recognitions */}
            {earned.length > 0 ? (
              <Section title="Recognitions">
                <View style={{ gap: 8 }}>
                  {earned.map((r) => (
                    <View key={r.id} className="bg-white rounded-2xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
                      <Text style={{ fontSize: 22 }}>{r.symbol}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy }}>{r.title}</Text>
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{r.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}
          </>
        ) : (
          <Section title={`The year ${edition}`}>
            {yearPlaces.length === 0 && yearDiscoveries.length === 0 && yearExpeditions.length === 0 ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>Nothing dated to this year yet.</Text>
            ) : (
              <View style={{ gap: 16 }}>
                {yearExpeditions.length > 0 ? (
                  <View>
                    <Text style={LABEL}>JOURNEYS OF RECORD</Text>
                    <Chips items={yearExpeditions.map((e) => ({ key: e.id, code: e.countryCodes[0], text: e.title }))} />
                  </View>
                ) : null}
                {yearPlaces.length > 0 ? (
                  <View>
                    <Text style={LABEL}>PLACES</Text>
                    <Chips items={yearPlaces.map((p) => ({ key: p.id, code: p.countryCode, text: p.name }))} />
                  </View>
                ) : null}
                {yearDiscoveries.length > 0 ? (
                  <View>
                    <Text style={LABEL}>{yearDiscoveries.length} {yearDiscoveries.length === 1 ? 'DISCOVERY' : 'DISCOVERIES'} RECORDED</Text>
                    <Chips items={yearDiscoveries.map((d) => ({ key: d.id, code: d.countryCode, text: d.name }))} />
                  </View>
                ) : null}
              </View>
            )}
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="rounded-full" style={{ paddingHorizontal: 16, paddingVertical: 9, backgroundColor: active ? COLORS.navy : '#fff' }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.ink2 }}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap" style={{ gap: 10 }}>{children}</View>;
}

function Stat({ value, label, icon: Icon }: { value: number; label: string; icon?: IconCmp }) {
  return (
    <View className="bg-white rounded-2xl items-center" style={{ flexBasis: '30%', flexGrow: 1, paddingVertical: 14, paddingHorizontal: 6 }}>
      {Icon ? (
        <View className="rounded-xl items-center justify-center" style={{ height: 28, width: 28, backgroundColor: 'rgba(255,107,154,0.12)', marginBottom: 6 }}>
          <Icon size={14} color={COLORS.coral} />
        </View>
      ) : null}
      <Text style={{ fontFamily: 'Fraunces', fontSize: 24, color: COLORS.navy }}>{value}</Text>
      <Text numberOfLines={2} style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '600', letterSpacing: 0.3, color: COLORS.ink3, marginTop: 3, textAlign: 'center' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function Chips({ items }: { items: { key: string; code?: string; text: string }[] }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
      {items.map((it) => (
        <View key={it.key} className="bg-white rounded-full flex-row items-center" style={{ paddingHorizontal: 12, paddingVertical: 7, gap: 6 }}>
          {it.code ? <Text style={{ fontSize: 14 }}>{flagEmoji(it.code)}</Text> : null}
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>{it.text}</Text>
        </View>
      ))}
    </View>
  );
}

const LABEL = {
  fontFamily: 'PlusJakarta',
  fontSize: 11,
  fontWeight: '700' as const,
  letterSpacing: 1,
  color: COLORS.ink3,
  marginBottom: 8,
};
