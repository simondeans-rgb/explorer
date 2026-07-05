import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import {
  Plane, Home, Briefcase, GraduationCap, Anchor, Sparkles, Compass,
  TrainFront, Ship, Car,
  UtensilsCrossed, BedDouble, Landmark, Ticket, Mountain,
  Globe2, Building2, Map as MapIcon, Award, BookOpen,
} from 'lucide-react-native';
import { PageHero } from '../components/PageHero';
import { DestinationImage } from '../components/DestinationImage';
import { BookPrinter, buildBookPages, type BookPageSpec } from '../components/AlmanacBookPages';
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
import { useData } from '../src/store/data';
import { useUnits } from '../src/store/units';
import { formatDistance, KM_PER_MI } from '../src/lib/units';
import { buildAlmanacStory, flightSentence } from '../src/lib/almanacStory';

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
  const { captures } = useData();
  const { unit } = useUnits();
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Explorer');
  const currentYear = new Date().getFullYear();
  const [edition, setEdition] = useState<'lifetime' | number>('lifetime');
  const [exporting, setExporting] = useState(false);
  const [printJob, setPrintJob] = useState<BookPageSpec[] | null>(null);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

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

  // Photo-bearing countries ranked by how deeply they were explored — the
  // imagery backbone of the Almanac (photo strip + continent chapter covers).
  const photoRanked = useMemo(
    () =>
      [...aggregates]
        .filter((a) => a.discovered && hasDestinationPhoto(a.code))
        .sort((a, b) => b.discoveryScore - a.discoveryScore),
    [aggregates],
  );

  const continentCover = (list: typeof discovered): string => {
    const sorted = [...list].sort((a, b) => b.discoveryScore - a.discoveryScore);
    return (sorted.find((a) => hasDestinationPhoto(a.code)) ?? sorted[0])?.code ?? 'WW';
  };

  // Countries touched in the selected year, for the edition's photo strip.
  const nameOf = useMemo(() => new Map(aggregates.map((a) => [a.code, a.name])), [aggregates]);
  const yearCodes = (() => {
    if (!yearView) return [];
    const codes = new Set<string>();
    for (const e of yearExpeditions) for (const c of e.countryCodes) codes.add(c);
    for (const p of yearPlaces) if (p.countryCode) codes.add(p.countryCode);
    return [...codes].filter((c) => hasDestinationPhoto(c)).map((code) => ({ code, name: nameOf.get(code) ?? code }));
  })();

  // The narrator: prologue paragraphs plus the id of the first-ever trip,
  // which gets its "WHERE IT ALL BEGAN" badge in the book.
  const storyParagraphs = useMemo(
    () =>
      buildAlmanacStory({
        expeditions,
        discoveries,
        countryName: (code) => nameOf.get(code) ?? code,
        formatKm: (km) => formatDistance(km / KM_PER_MI, unit),
      }),
    [expeditions, discoveries, nameOf, unit],
  );
  const firstTripId = useMemo(
    () =>
      [...expeditions]
        .filter((e) => e.startDate)
        .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0]?.id,
    [expeditions],
  );

  // "Journeys of record" — the trips with the most to show (own photos first,
  // then journeys/notes), capped at 8 pages and told in chronological order.
  const tripSpreads = useMemo(() => {
    const capsByTrip = new Map<string, typeof captures>();
    for (const c of captures) {
      if (!c.expeditionId) continue;
      const list = capsByTrip.get(c.expeditionId) ?? [];
      list.push(c);
      capsByTrip.set(c.expeditionId, list);
    }
    const discByTrip = new Map<string, typeof discoveries>();
    for (const d of discoveries) {
      if (!d.expeditionId) continue;
      const list = discByTrip.get(d.expeditionId) ?? [];
      list.push(d);
      discByTrip.set(d.expeditionId, list);
    }
    const fmtDay = (iso?: string) =>
      iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : undefined;
    return expeditions
      .map((e) => {
        const caps = [...(capsByTrip.get(e.id) ?? [])].sort(
          (a, b) => (a.takenAt ?? a.createdAt) - (b.takenAt ?? b.createdAt),
        );
        const discs = discByTrip.get(e.id) ?? [];
        const photos = [...caps.map((c) => c.dataUrl), ...discs.map((d) => d.photo).filter((p): p is string => !!p)];
        return { e, discs, photos, score: photos.length * 3 + e.journeys.length + (e.note ? 1 : 0) };
      })
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .sort((a, b) => (a.e.startDate ?? '9999').localeCompare(b.e.startDate ?? '9999'))
      .map(({ e, discs, photos }) => {
        const km = e.journeys.reduce((n, j) => n + (j.distanceKm ?? 0), 0);
        const meta = [
          [fmtDay(e.startDate), fmtDay(e.endDate)].filter(Boolean).join(' — '),
          e.journeys.length ? `${e.journeys.length} ${e.journeys.length === 1 ? 'journey' : 'journeys'}` : '',
          km > 0 ? formatDistance(km / KM_PER_MI, unit) : '',
        ]
          .filter(Boolean)
          .join(' · ');
        const quoted = discs.find((d) => d.note && d.note.trim().length > 12);
        return {
          title: e.title,
          meta,
          story: flightSentence(e.journeys) ?? undefined,
          badge: e.id === firstTripId ? 'WHERE IT ALL BEGAN' : undefined,
          flagCodes: e.countryCodes.slice(0, 12),
          photos: photos.slice(0, 4),
          heroCode: e.countryCodes.find((c) => hasDestinationPhoto(c)),
          quote: quoted
            ? {
                text: quoted.note!.trim().slice(0, 180),
                attribution: [quoted.name, quoted.city].filter(Boolean).join(', '),
              }
            : undefined,
        };
      });
  }, [captures, discoveries, expeditions, unit, firstTripId]);

  const figures: [string, number, IconCmp, string][] = [
    ['Countries discovered', stats.countriesDiscovered, Globe2, COLORS.coral],
    ['Cities discovered', stats.citiesDiscovered, Building2, COLORS.aqua],
    ['Journeys completed', expeditions.length, Plane, COLORS.lavender],
    ['Discoveries made', discoveryStats.total, Compass, COLORS.sunburst],
    ['Continents reached', stats.continentsDiscovered, MapIcon, COLORS.sky],
    ['Recognitions earned', earned.length, Award, '#F2557D'],
  ];

  const catRows: [keyof typeof discoveryStats.byCategory, string, IconCmp][] = [
    ['food', 'Food & Drink', UtensilsCrossed],
    ['accommodation', 'Stays', BedDouble],
    ['culture', 'Culture', Landmark],
    ['experience', 'Experiences', Ticket],
    ['nature', 'Nature', Mountain],
  ];

  function buildBookInput() {
    return {
      firstName,
      generatedOn: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      heroCode: photoRanked[0]?.code,
      photoStrip: photoRanked.slice(0, 7).map((a) => ({ code: a.code, name: a.name })),
      storyParagraphs,
      figures: figures.map(([label, value]) => ({ label, value })),
      continents: CONTINENTS.filter((c) => byContinent.has(c)).map((c) => {
        const list = byContinent.get(c) ?? [];
        const earliest = [...list].filter((a) => a.firstYear).sort((a, b) => a.firstYear! - b.firstYear!)[0];
        return {
          name: c,
          coverCode: continentCover(list),
          intro: earliest ? `You first set foot here in ${earliest.firstYear} — ${earliest.name}.` : undefined,
          countries: list.map((a) => ({ code: a.code, name: a.name })),
        };
      }),
      trips: tripSpreads,
      relationships: RELATIONSHIPS.filter((r) => relationshipCounts[r] > 0).map((r) => ({
        label: RELATIONSHIP_META[r].label,
        count: relationshipCounts[r],
      })),
      categories: catRows
        .map(([key, label]) => ({ label, count: discoveryStats.byCategory[key] }))
        .filter((c) => c.count > 0),
      recognitions: earned.map((r) => ({ symbol: r.symbol, title: r.title, description: r.description })),
    };
  }

  async function exportBook() {
    if (exporting || printJob) return;
    const input = buildBookInput();
    // Prefer the native-rendered book (real photography + brand typefaces,
    // captured from RN views); the WebView print path is the fallback for
    // binaries without the snapshot module.
    let canSnapshot = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: native module absent in older builds
      require('react-native-view-shot');
      canSnapshot = true;
    } catch {
      canSnapshot = false;
    }
    if (canSnapshot) {
      setPrintJob(buildBookPages(input));
      return;
    }
    setExporting(true);
    try {
      await shareAlmanacBook(input);
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
            {/* Your world in pictures — the places you know best, as photos */}
            {photoRanked.length > 0 ? (
              <View style={{ marginTop: 18 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, paddingHorizontal: 20 }}>Your world in pictures</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 3 }}>The places you know best. Tap one to relive it.</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
                  {photoRanked.slice(0, 12).map((a) => (
                    <CountryPhotoCard key={a.code} code={a.code} name={a.name} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* figures */}
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 20, gap: 10 }}>
              {figures.map(([label, value, Icon, color]) => (
                <View key={label} className="bg-white dark:bg-card rounded-3xl" style={{ flexBasis: '47%', flexGrow: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
                  <View className="rounded-xl items-center justify-center" style={{ height: 30, width: 30, backgroundColor: `${color}1F`, marginBottom: 8 }}>
                    <Icon size={16} color={color} />
                  </View>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 34, color, lineHeight: 38 }}>{value}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink3, marginTop: 2 }}>{label.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* export as a printable photo book */}
            <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
              <Pressable onPress={exportBook} disabled={exporting || printJob != null} style={{ borderRadius: 24, overflow: 'hidden', opacity: exporting || printJob ? 0.6 : 1 }}>
                <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 }}>
                  <BookOpen size={18} color="#fff" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>
                    {printJob ? (printStatus ?? 'Preparing your book…') : exporting ? 'Preparing your book…' : 'Export as photo book'}
                  </Text>
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

            {/* by continent — photo "chapter" cards, covered by the most deeply
                explored country of each continent */}
            <Section title="The world, by continent">
              <View style={{ gap: 12 }}>
                {CONTINENTS.filter((c) => byContinent.has(c)).map((c) => {
                  const list = byContinent.get(c) ?? [];
                  return (
                    <View key={c} className="bg-white dark:bg-card" style={{ borderRadius: 24, overflow: 'hidden' }}>
                      <DestinationImage code={continentCover(list)} scrim style={{ height: 112, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 10 }}>
                        <View className="flex-row items-end justify-between">
                          <Text style={{ fontFamily: 'Fraunces', fontSize: 23, color: '#fff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 1 } }}>{c}</Text>
                          <View className="rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)', paddingHorizontal: 11, paddingVertical: 4 }}>
                            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: '#fff' }}>{list.length} {list.length === 1 ? 'country' : 'countries'}</Text>
                          </View>
                        </View>
                      </DestinationImage>
                      <Text style={{ fontSize: 24, lineHeight: 34, paddingHorizontal: 16, paddingVertical: 12 }}>{list.map((a) => flagEmoji(a.code)).join('  ')}</Text>
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
                    <View key={r.id} className="bg-white dark:bg-card rounded-2xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
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
                {yearCodes.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                    {yearCodes.map(({ code, name }) => (
                      <CountryPhotoCard key={code} code={code} name={name} />
                    ))}
                  </ScrollView>
                ) : null}
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

      {/* Offscreen book printer: mounts on export, snapshots page by page. */}
      {printJob ? (
        <BookPrinter
          pages={printJob}
          firstName={firstName}
          dialogTitle="Share your Almanac"
          onProgress={setPrintStatus}
          onDone={() => {
            setPrintJob(null);
            setPrintStatus(null);
          }}
        />
      ) : null}
    </View>
  );
}

/** A tappable destination photo card — flag + name over the country's photo,
 *  leading into its country page. */
function CountryPhotoCard({ code, name }: { code: string; name: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}`}
      onPress={() => router.push(`/country/${code}`)}
      style={{ width: 122, height: 164, borderRadius: 20, overflow: 'hidden' }}
    >
      <DestinationImage code={code} scrim style={{ flex: 1, justifyContent: 'flex-end', padding: 10 }}>
        <Text style={{ fontSize: 17 }}>{flagEmoji(code)}</Text>
        <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 15, color: '#fff', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } }}>{name}</Text>
      </DestinationImage>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="rounded-full" style={{ paddingHorizontal: 16, paddingVertical: 9, backgroundColor: active ? COLORS.coral : COLORS.card }}>
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
    <View className="bg-white dark:bg-card rounded-2xl items-center" style={{ flexBasis: '30%', flexGrow: 1, paddingVertical: 14, paddingHorizontal: 6 }}>
      {Icon ? (
        <View className="rounded-xl items-center justify-center" style={{ height: 28, width: 28, backgroundColor: 'rgba(255,107,154,0.12)', marginBottom: 6 }}>
          <Icon size={14} color={COLORS.coral} />
        </View>
      ) : null}
      <Text style={{ fontFamily: 'Fraunces', fontSize: 24, color: COLORS.navy }}>{value}</Text>
      <Text numberOfLines={2} style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '600', letterSpacing: 0.3, color: COLORS.ink3, marginTop: 3, textAlign: 'center' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function Chips({ items }: { items: { key: string; code?: string; text: string }[] }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
      {items.map((it) => (
        <View key={it.key} className="bg-white dark:bg-card rounded-full flex-row items-center" style={{ paddingHorizontal: 12, paddingVertical: 7, gap: 6 }}>
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
