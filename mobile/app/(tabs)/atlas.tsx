import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useTabReselect } from '../../src/hooks/useTabReselect';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Globe2, MapPinned, Search, X, Plane, TrainFront, Ship, Car, Anchor, Home, RotateCcw, ChevronRight } from 'lucide-react-native';
import { geoCentroid, geoInterpolate } from 'd3-geo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONTINENTS, type Continent, type JourneyMode, type Relationship } from '../../src/types';

const MODE_FILTERS: { key: JourneyMode | 'all'; label: string; Icon: ComponentType<{ size?: number; color?: string }> | null }[] = [
  { key: 'all', label: 'All types', Icon: null },
  { key: 'flight', label: 'Flights', Icon: Plane },
  { key: 'rail', label: 'Rail', Icon: TrainFront },
  { key: 'cruise', label: 'Cruise', Icon: Ship },
  { key: 'road', label: 'Road', Icon: Car },
  { key: 'ferry', label: 'Ferry', Icon: Anchor },
];
import { HeroWave } from '../../components/HeroWave';
import { JourneyGlobe, type GlobeFocus, type GlobePin } from '../../components/JourneyGlobe';
import { JourneyStatsPanel } from '../../components/JourneyStatsPanel';
import { DestinationImage } from '../../components/DestinationImage';
import { AtlasCountryCard } from '../../components/AtlasCountryCard';
import { AtlasSummary } from '../../components/AtlasSummary';
import { MapPoster } from '../../components/MapPoster';
import { shareViewAsPng } from '../../src/lib/shareImage';
import { DiscoveryScoreSheet } from '../../components/DiscoveryScoreSheet';
import { COLORS, SHADOW } from '../../src/lib/theme';
import { WORLD_FEATURES } from '../../src/lib/worldGeo';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, COUNTRIES } from '../../src/data/countries';
import { routeSegments, cityCoord, resolveEndpoint, type Segment } from '../../src/lib/journeyGeo';
import type { FlightExtreme } from '../../src/lib/travelStats';
import { shareMapPoster } from '../../src/lib/mapPoster';
import { useWorldly } from '../../src/hooks/useWorldly';
import { isUpcoming } from '../../src/lib/tripPhase';
import { useFlightAutoRefresh } from '../../src/hooks/useFlightAutoRefresh';
import type { CountryAggregate } from '../../src/lib/stats';
import { useAuth } from '../../src/store/auth';
import { useData } from '../../src/store/data';
import { useConfirm } from '../../src/store/confirm';
import { useCelebration } from '../../src/store/celebration';
import { useToast } from '../../src/store/toast';
import { countryMilestone } from '../../src/lib/milestone';
import { hImpact } from '../../src/lib/haptics';

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

// The globe band's own surface colour (matches JourneyGlobe's deep ocean).
const SPACE = '#0D1B2E';

/** A filter chip that sits on the dark globe band. */
function HeroChip({ label, active, onPress, dot }: { label: string; active: boolean; onPress: () => void; dot?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="flex-row items-center rounded-full"
      style={{ paddingHorizontal: 13, paddingVertical: 7, gap: 6, backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.12)' }}
    >
      {dot ? <View style={{ height: 7, width: 7, borderRadius: 4, backgroundColor: dot }} /> : null}
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: active ? COLORS.navySolid : 'rgba(255,255,255,0.86)' }}>{label}</Text>
    </Pressable>
  );
}

function ScopeChips({ scope, years, onChange }: { scope: Scope; years: number[]; onChange: (s: Scope) => void }) {
  if (years.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
      {(['all', ...years] as Scope[]).map((s) => (
        <HeroChip key={String(s)} label={s === 'all' ? 'All time' : String(s)} active={scope === s} onPress={() => onChange(s)} />
      ))}
    </ScrollView>
  );
}

/** How you know a place — the relationship filters offered on the globe. */
type RelFilter = 'all' | 'lived' | 'worked' | 'studied' | 'wishlist';
const REL_FILTERS: { id: Exclude<RelFilter, 'all'>; label: string; rel: Relationship; dot: string }[] = [
  { id: 'lived', label: 'Lived', rel: 'lived', dot: '#9B7CFF' },
  { id: 'worked', label: 'Worked', rel: 'worked', dot: '#24D1C3' },
  { id: 'studied', label: 'Studied', rel: 'studied', dot: '#FFB84D' },
  { id: 'wishlist', label: 'Wishlist', rel: 'aspiring', dot: '#A48BFF' },
];

/** Geographic centre [lng, lat] of a country, for flying the globe to it. */
function countryCentre(code: string): [number, number] | undefined {
  const wf = WORLD_FEATURES.find((f) => f.alpha2 === code);
  return wf ? (geoCentroid(wf.feature as never) as [number, number]) : undefined;
}

export default function AtlasScreen() {
  const { aggregates, discoveries, expeditions, stats } = useWorldly();
  const { updateExpedition, addPlace } = useData();
  const confirm = useConfirm();
  const { celebrate } = useCelebration();
  const { toast } = useToast();

  // Bumped whenever a country is added on the globe, so the map replays its
  // west→east light-up with the new country colouring in last — the reward.
  const [addFlash, setAddFlash] = useState(0);

  function spotlight(code: string) {
    hImpact('light');
    setSelCode(code);
    const c = countryCentre(code);
    if (c) setFocus({ lon: c[0], lat: c[1], key: `c:${code}:${Date.now()}` });
  }

  // Tap an undiscovered country on the globe to add it — the map becomes the
  // way you fill the map. Discovered countries still open their page.
  async function onGlobeCountry(code: string) {
    const discoveredCodes = new Set(discovered.map((a) => a.code));
    if (discoveredCodes.has(code)) {
      // First tap spotlights the country and tells you about it; the callout
      // (or a second tap) opens its page.
      if (selCode === code) {
        router.push(`/country/${code}`);
        return;
      }
      spotlight(code);
      return;
    }
    const name = countryName(code);
    if (!name) return;
    const yes = await confirm({
      title: `Add ${name}?`,
      message: `Mark ${flagEmoji(code)}  ${name} as somewhere you've been?`,
      confirmLabel: 'Add to my world',
    });
    if (!yes) return;
    addPlace({ kind: 'country', countryCode: code, relationships: ['visited'] });
    setAddFlash((n) => n + 1); // replay the globe light-up as the reward
    const cel = countryMilestone(discoveredCodes, code);
    if (cel) celebrate(cel);
    else hImpact('medium');
    toast.success(`${name} added`);
  }
  // Flights logged ahead of time refresh their actual times/delays once flown.
  useFlightAutoRefresh(expeditions, updateExpedition);
  const [tab, setTab] = useState<Tab>('places');
  const [scope, setScope] = useState<Scope>('all');
  const [journeyMode, setJourneyMode] = useState<JourneyMode | 'all'>('all');
  const [showDomestic, setShowDomestic] = useState(true);
  const insets = useSafeAreaInsets();
  // What the globe is filtered to, beyond the year: a continent and/or how you
  // know the place. Both recolour the sphere as well as the list below.
  const [continent, setContinent] = useState<Continent | 'all'>('all');
  const [rel, setRel] = useState<RelFilter>('all');
  // The country / route currently spotlighted on the globe (drives the callout).
  const [selCode, setSelCode] = useState<string | null>(null);
  const [selSeg, setSelSeg] = useState<Segment | null>(null);
  const [focus, setFocus] = useState<GlobeFocus | undefined>(undefined);
  const [replay, setReplay] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  useTabReselect('/atlas', () => scrollRef.current?.scrollTo({ y: 0, animated: true }));
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('az');
  const [scoreAgg, setScoreAgg] = useState<CountryAggregate | null>(null);
  const discovered = useMemo(() => aggregates.filter((a) => a.discovered), [aggregates]);
  // Home countries (lived/based) — excluded from expedition flag rows so cards
  // lead with the destination, not the country you flew from.
  const homeCodes = useMemo(
    () => new Set(aggregates.filter((a) => a.relationships.some((r) => r === 'lived' || r === 'based')).map((a) => a.code)),
    [aggregates],
  );

  // Discovered-country count per continent (numerator for progress).
  const discByContinent = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of discovered) if (a.continent) m[a.continent] = (m[a.continent] ?? 0) + 1;
    return m;
  }, [discovered]);
  const worldPct = (stats.countriesDiscovered / COUNTRIES.length) * 100;

  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const posterRef = useRef<View>(null);
  const allVisited = useMemo(() => new Set(discovered.map((a) => a.code)), [discovered]);
  async function shareMap() {
    if (sharing) return;
    setSharing(true);
    try {
      // Share the globe-styled image (previews inline in Messages/Instagram);
      // fall back to the PDF poster on binaries without the capture module.
      if (posterRef.current && (await shareViewAsPng(posterRef.current, 'Share your world'))) return;
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

  // Year + relationship + continent, applied together. "Wishlist" swaps the
  // set to the places you're dreaming of (which have no year, so the year
  // scope doesn't apply to them).
  const shownPlaces = useMemo(() => {
    let base: typeof discovered;
    if (rel === 'wishlist') base = aggregates.filter((a) => a.aspiring);
    else {
      base = discovered.filter(inScope);
      const want = REL_FILTERS.find((f) => f.id === rel)?.rel;
      if (want) base = base.filter((a) => a.relationships.includes(want));
    }
    return continent === 'all' ? base : base.filter((a) => a.continent === continent);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- inScope is derived from scope
  }, [discovered, aggregates, scope, rel, continent]);
  // Only offer filters that would show something.
  const continentsHere = useMemo(() => CONTINENTS.filter((c) => (discByContinent[c] ?? 0) > 0), [discByContinent]);
  const relsHere = useMemo(
    () =>
      REL_FILTERS.filter((f) =>
        f.id === 'wishlist' ? aggregates.some((a) => a.aspiring) : discovered.some((a) => a.relationships.includes(f.rel)),
      ),
    [aggregates, discovered],
  );

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

  const visited = useMemo(() => (rel === 'wishlist' ? new Set<string>() : new Set(shownPlaces.map((a) => a.code))), [shownPlaces, rel]);
  // Visited codes in the order they were first reached — drives the globe's
  // colour-in-by-visit-order reveal.
  const visitOrder = useMemo(
    () => shownPlaces.slice().sort((a, b) => (a.firstYear ?? 9999) - (b.firstYear ?? 9999) || a.name.localeCompare(b.name)).map((a) => a.code),
    [shownPlaces],
  );
  // Wish-listed places stay on the globe whatever year you scrub to — a year
  // filter shouldn't erase where you're dreaming of going next.
  const wishlist = useMemo(
    () =>
      rel === 'all' || rel === 'wishlist'
        ? new Set(aggregates.filter((a) => !a.discovered && a.aspiring && (continent === 'all' || a.continent === continent)).map((a) => a.code))
        : new Set<string>(),
    [aggregates, rel, continent],
  );
  // The cities you've been to, pinned on the sphere (labelled once zoomed in).
  const cityPins = useMemo<GlobePin[]>(() => {
    if (rel === 'wishlist') return [];
    const out: GlobePin[] = [];
    for (const a of shownPlaces) {
      for (const c of a.cities) {
        if (!c.relationships.some((r) => r !== 'aspiring')) continue;
        const co = cityCoord(a.code, c.name);
        if (co) out.push({ lon: co[0], lat: co[1], label: c.name });
        if (out.length >= 160) return out;
      }
    }
    return out;
  }, [shownPlaces, rel]);
  const selAgg = useMemo(() => (selCode ? aggregates.find((a) => a.code === selCode) : undefined), [aggregates, selCode]);

  // Search doubles as a camera: as you type, the globe flies to the best match
  // and spotlights it (debounced so it doesn't chase every keystroke).
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (tab !== 'places' || q.length < 2) return;
    const t = setTimeout(() => {
      const hit =
        shownPlaces.find((a) => countryName(a.code).toLowerCase().startsWith(q)) ??
        shownPlaces.find((a) => countryName(a.code).toLowerCase().includes(q) || a.cities.some((c) => c.name.toLowerCase().includes(q)));
      if (!hit) return;
      setSelCode(hit.code);
      const c = countryCentre(hit.code);
      if (c) setFocus({ lon: c[0], lat: c[1], key: `q:${hit.code}:${q}` });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run on the query only
  }, [query, tab]);

  // Stats → globe: show one flight (longest/shortest) on the sphere.
  function showFlight(f: FlightExtreme) {
    const from = f.fromCoord ?? resolveEndpoint(f.from);
    const to = f.toCoord ?? resolveEndpoint(f.to);
    if (!from || !to) return;
    hImpact('light');
    const mid = geoInterpolate(from, to)(0.5) as [number, number];
    setSelSeg({ from, to, fromLabel: f.from, toLabel: f.to, date: f.date });
    setFocus({ lon: mid[0], lat: mid[1], key: `f:${f.from}:${f.to}:${Date.now()}` });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }
  function showYear(year: number) {
    hImpact('light');
    setSelSeg(null);
    setScope(year);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }
  function onGlobeSegment(seg: Segment) {
    hImpact('light');
    setSelSeg(seg);
    const mid = geoInterpolate(seg.from, seg.to)(0.5) as [number, number];
    setFocus({ lon: mid[0], lat: mid[1], key: `s:${seg.from.join(',')}:${seg.to.join(',')}:${Date.now()}` });
  }
  const selTrip = useMemo(() => (selSeg?.expeditionId ? expeditions.find((e) => e.id === selSeg.expeditionId) : undefined), [selSeg, expeditions]);

  const scopedJourneys = useMemo(() => {
    // Journeys view = recorded trips. A purely-planned upcoming trip (no legs)
    // belongs on the Home countdown, not here; an upcoming trip WITH legs still
    // shows so its future flights stay editable.
    const today = new Date().toISOString().slice(0, 10);
    const recorded = expeditions.filter((e) => e.journeys.length > 0 || !isUpcoming(e, today));
    return scope === 'all' ? recorded : recorded.filter((e) => yearOf(e.startDate, e.createdAt) === scope);
  }, [expeditions, scope]);
  const [journeyLimit, setJourneyLimit] = useState(40);
  // Cap the rendered country cards; heavy travellers can have ~195. "Show more"
  // reveals the rest, mirroring the journeys list.
  const [placeLimit, setPlaceLimit] = useState(60);
  const shownJourneys = useMemo(() => {
    let list = scopedJourneys;
    if (!showDomestic) list = list.filter((e) => new Set(e.countryCodes).size > 1);
    if (journeyMode !== 'all') list = list.filter((e) => e.journeys.some((j) => j.mode === journeyMode));
    return list;
  }, [scopedJourneys, showDomestic, journeyMode]);
  const segments = useMemo(() => routeSegments(shownJourneys), [shownJourneys]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 110 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      {/* The globe IS the hero: a deep-space band from the very top edge, with
          the title, your share of the world, the filters and the sphere itself —
          then the signature wave into the page. */}
      <View style={{ backgroundColor: SPACE, paddingTop: insets.top + 14, paddingBottom: 96 }}>
        <View className="flex-row items-end" style={{ paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 2.5, color: 'rgba(255,255,255,0.7)' }}>YOUR ATLAS</Text>
            <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Fraunces', fontSize: 34, lineHeight: 40, color: '#fff', marginTop: 2 }}>
              {stats.countriesDiscovered > 0 ? `${stats.countriesDiscovered} ${stats.countriesDiscovered === 1 ? 'country' : 'countries'}` : 'Your world'}
            </Text>
          </View>
          {stats.countriesDiscovered > 0 ? (
            <View accessible accessibilityLabel={`${Math.round(worldPct)} percent of the world explored`} style={{ alignItems: 'flex-end', paddingBottom: 4 }}>
              <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Fraunces', fontSize: 30, lineHeight: 34, color: COLORS.coral }}>
                {worldPct > 0 && worldPct < 1 ? '<1' : Math.round(worldPct)}%
              </Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>of the world</Text>
            </View>
          ) : null}
        </View>

        {/* segmented control */}
        <View className="flex-row rounded-2xl" style={{ marginHorizontal: 20, marginTop: 14, padding: 4, gap: 4, backgroundColor: 'rgba(255,255,255,0.1)' }}>
          {([['places', 'Places', Globe2], ['journeys', 'Journeys', MapPinned]] as const).map(([id, label, Icon]) => {
            const active = tab === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => { setTab(id); setScope('all'); setSelCode(null); setSelSeg(null); }}
                className="flex-row items-center justify-center rounded-xl"
                style={{ flex: 1, paddingVertical: 9, gap: 6, backgroundColor: active ? '#FFFFFF' : 'transparent' }}
              >
                <Icon size={15} color={active ? COLORS.navySolid : 'rgba(255,255,255,0.8)'} />
                <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? COLORS.navySolid : 'rgba(255,255,255,0.8)' }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 12, gap: 8 }}>
          <ScopeChips scope={scope} years={tab === 'places' ? placeYears : journeyYears} onChange={(sc) => { setScope(sc); setSelSeg(null); }} />
          {tab === 'places' && continentsHere.length + relsHere.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
              <HeroChip label="Everywhere" active={continent === 'all' && rel === 'all'} onPress={() => { setContinent('all'); setRel('all'); setSelCode(null); }} />
              {continentsHere.map((c) => (
                <HeroChip key={c} label={c} active={continent === c} onPress={() => { setContinent(continent === c ? 'all' : c); setSelCode(null); }} />
              ))}
              {relsHere.map((f) => (
                <HeroChip key={f.id} label={f.label} dot={f.dot} active={rel === f.id} onPress={() => { setRel(rel === f.id ? 'all' : f.id); setSelCode(null); }} />
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={{ marginTop: 10 }}>
          {tab === 'places' ? (
            <JourneyGlobe
              segments={[]}
              maxSize={400}
              resetKey={`${scope}:${continent}:${rel}:${addFlash}:${replay}`}
              scrollRef={scrollRef}
              places={{ visited, wishlist, order: visitOrder, onPressCountry: onGlobeCountry }}
              pins={cityPins}
              focus={focus}
              highlight={selCode ? { code: selCode } : undefined}
            />
          ) : (
            <JourneyGlobe
              segments={segments}
              maxSize={400}
              resetKey={`${scope}:${replay}`}
              scrollRef={scrollRef}
              focus={focus}
              highlight={selSeg ? { segment: selSeg } : undefined}
              onPressSegment={onGlobeSegment}
            />
          )}

          {/* Replay the chronological light-up on demand. */}
          {(tab === 'places' ? visited.size : segments.length) > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tab === 'places' ? 'Replay your travels lighting up in order' : 'Replay your routes in order'}
              onPress={() => { hImpact('light'); setSelCode(null); setSelSeg(null); setReplay((n) => n + 1); }}
              hitSlop={8}
              className="flex-row items-center rounded-full"
              style={{ position: 'absolute', top: 10, right: 16, paddingHorizontal: 11, paddingVertical: 7, gap: 5, backgroundColor: 'rgba(13,27,46,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}
            >
              <RotateCcw size={13} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: '#fff' }}>Replay</Text>
            </Pressable>
          ) : null}

          {/* Callout: the globe narrates what you tapped. */}
          {tab === 'places' && selAgg ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${countryName(selAgg.code)}`}
              onPress={() => router.push(`/country/${selAgg.code}`)}
              className="flex-row items-center rounded-2xl"
              style={{ position: 'absolute', left: 16, right: 16, bottom: 10, padding: 12, gap: 12, backgroundColor: 'rgba(255,255,255,0.96)', ...SHADOW.float }}
            >
              <Text style={{ fontSize: 30 }}>{flagEmoji(selAgg.code)}</Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navySolid }}>{countryName(selAgg.code)}</Text>
                <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: '#5E6377', marginTop: 1 }}>
                  {[
                    selAgg.discovered ? (selAgg.firstYear ? `Since ${selAgg.firstYear}` : 'Discovered') : 'On your wishlist',
                    selAgg.cities.length ? `${selAgg.cities.length} ${selAgg.cities.length === 1 ? 'city' : 'cities'}` : null,
                    discCount[selAgg.code] ? `${discCount[selAgg.code]} ${discCount[selAgg.code] === 1 ? 'discovery' : 'discoveries'}` : null,
                  ].filter(Boolean).join('  ·  ')}
                </Text>
              </View>
              <Pressable onPress={() => setSelCode(null)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss" style={{ padding: 4 }}>
                <X size={16} color="#5E6377" />
              </Pressable>
              <ChevronRight size={18} color={COLORS.coral} />
            </Pressable>
          ) : null}
          {tab === 'journeys' && selSeg ? (
            <Pressable
              accessibilityRole="button"
              disabled={!selTrip}
              accessibilityLabel={selTrip ? `Open ${selTrip.title}` : undefined}
              onPress={selTrip ? () => router.push(`/journey/${selTrip.id}`) : undefined}
              className="flex-row items-center rounded-2xl"
              style={{ position: 'absolute', left: 16, right: 16, bottom: 10, padding: 12, gap: 12, backgroundColor: 'rgba(255,255,255,0.96)', ...SHADOW.float }}
            >
              <View className="rounded-full items-center justify-center" style={{ height: 38, width: 38, backgroundColor: 'rgba(255,107,154,0.14)' }}>
                <Plane size={18} color={COLORS.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 16.5, color: COLORS.navySolid }}>
                  {(selSeg.fromLabel ?? 'Origin').replace(/\s*\(.*?\)/, '')} → {(selSeg.toLabel ?? 'Destination').replace(/\s*\(.*?\)/, '')}
                </Text>
                <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: '#5E6377', marginTop: 1 }}>
                  {[selTrip?.title, selSeg.date ? `First flown ${selSeg.date.slice(0, 4)}` : null].filter(Boolean).join('  ·  ') || 'Flight route'}
                </Text>
              </View>
              <Pressable onPress={() => setSelSeg(null)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss" style={{ padding: 4 }}>
                <X size={16} color="#5E6377" />
              </Pressable>
              {selTrip ? <ChevronRight size={18} color={COLORS.coral} /> : null}
            </Pressable>
          ) : null}
        </View>

        {/* Legend — an invitation, not a footnote. */}
        <View className="flex-row items-center" style={{ marginTop: 12, gap: 14, paddingHorizontal: 20, flexWrap: 'wrap' }}>
          {tab === 'places' ? (
            <>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.coral }} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.86)' }}>{visited.size} discovered{scope === 'all' ? '' : ` in ${scope}`}</Text>
              </View>
              {wishlist.size > 0 ? (
                <View className="flex-row items-center" style={{ gap: 6 }}>
                  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: COLORS.lavender }} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.86)' }}>{wishlist.size} wish-listed</Text>
                </View>
              ) : null}
            </>
          ) : (
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <View style={{ height: 3, width: 16, borderRadius: 2, backgroundColor: COLORS.coral }} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.86)' }}>
                {segments.length} flight route{segments.length === 1 ? '' : 's'}{scope === 'all' ? '' : ` in ${scope}`}
              </Text>
            </View>
          )}
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#fff', marginLeft: 'auto' }}>
            {tab === 'places' ? 'Tap any country' : 'Tap a route'}
          </Text>
        </View>
        <HeroWave />
      </View>

      {tab === 'places' ? (
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
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
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
          {scopedJourneys.length > 0 ? (
            <JourneyStatsPanel expeditions={scopedJourneys} onSelectYear={scope === 'all' ? showYear : undefined} onSelectFlight={showFlight} />
          ) : null}
        </View>
      )}

      <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
        {tab === 'places' && shownPlaces.length === 0 ? (
          <View className="rounded-3xl items-center" style={{ paddingVertical: 32, paddingHorizontal: 22, backgroundColor: 'rgba(124,107,255,0.08)' }}>
            <View className="rounded-full items-center justify-center" style={{ height: 60, width: 60, backgroundColor: COLORS.card, ...SHADOW.card }}>
              <Globe2 size={26} color={COLORS.lavender} />
            </View>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: COLORS.navy, marginTop: 12 }}>{discovered.length === 0 && rel !== 'wishlist' ? 'Start your atlas' : 'Nothing matches these filters'}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
              {discovered.length === 0 && rel !== 'wishlist' ? 'Tap any country on the globe — or use the ＋ button — and watch your world fill in.' : 'Try another year, continent or filter.'}
            </Text>
          </View>
        ) : null}
        {tab === 'journeys' && scopedJourneys.length === 0 ? (
          <View className="rounded-3xl items-center" style={{ paddingVertical: 32, paddingHorizontal: 22, backgroundColor: 'rgba(36,209,195,0.09)' }}>
            <View className="rounded-full items-center justify-center" style={{ height: 60, width: 60, backgroundColor: COLORS.card, ...SHADOW.card }}>
              <MapPinned size={26} color={COLORS.aqua} />
            </View>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: COLORS.navy, marginTop: 12 }}>{scope === 'all' ? 'Map your first journey' : `Nothing from ${scope}`}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
              {scope === 'all' ? 'Record a trip and how you travelled — it’ll trace onto your spinning globe.' : 'Try another year.'}
            </Text>
          </View>
        ) : null}

        {/* journey filters — by transport type + domestic toggle */}
        {tab === 'journeys' && scopedJourneys.length > 0 ? (
          <View style={{ gap: 9 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {MODE_FILTERS.map(({ key, label, Icon }) => {
                const active = journeyMode === key;
                return (
                  <Pressable key={key} onPress={() => setJourneyMode(key)} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 13, paddingVertical: 7, gap: 5, backgroundColor: active ? COLORS.navySolid : COLORS.card }}>
                    {Icon ? <Icon size={13} color={active ? '#fff' : COLORS.ink3} /> : null}
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: active ? '#fff' : COLORS.ink3 }}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setShowDomestic((v) => !v)} className="flex-row items-center self-start rounded-full" style={{ paddingHorizontal: 13, paddingVertical: 7, gap: 6, backgroundColor: showDomestic ? 'rgba(36,209,195,0.16)' : COLORS.card }}>
              <Home size={13} color={showDomestic ? '#12A594' : COLORS.ink3} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: showDomestic ? '#12A594' : COLORS.ink3 }}>{showDomestic ? 'Domestic trips shown' : 'Domestic trips hidden'}</Text>
            </Pressable>
          </View>
        ) : null}
        {tab === 'journeys' && scopedJourneys.length > 0 && shownJourneys.length === 0 ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, textAlign: 'center', paddingVertical: 16 }}>No journeys match these filters.</Text>
        ) : null}

        {/* search + sort (Places) */}
        {tab === 'places' && shownPlaces.length > 0 ? (
          <>
            <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
              <Search size={18} color={COLORS.ink3} />
              <TextInput value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} accessibilityHint="The globe flies to the best match" placeholder="Search your countries & cities" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink }} />
              {query ? (
                <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10}>
                  <X size={17} color={COLORS.ink3} />
                </Pressable>
              ) : null}
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              {([['az', 'A–Z'], ['found', 'Most found'], ['recent', 'Recent']] as [SortBy, string][]).map(([id, label]) => {
                const active = sortBy === id;
                return (
                  <Pressable key={id} onPress={() => setSortBy(id)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? COLORS.navySolid : COLORS.card }}>
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
          ? listPlaces.slice(0, placeLimit).map((a) => (
              <AtlasCountryCard key={a.code} aggregate={a} discoveries={discCount[a.code] ?? 0} onScorePress={() => setScoreAgg(a)} />
            ))
          : shownJourneys.slice(0, journeyLimit).map((e) => (
              <Pressable
                key={e.id}
                onPress={() => router.push(`/journey/${e.id}`)}
                className="bg-white dark:bg-card rounded-3xl"
                style={{ overflow: 'hidden' }}
              >
                <DestinationImage code={e.countryCodes[0] ?? 'WW'} scrim style={{ height: 132, padding: 14, justifyContent: 'flex-end' }}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>{e.title}</Text>
                  <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95 }}>
                    {(() => {
                      const dest = e.countryCodes.filter((c) => !homeCodes.has(c));
                      return (dest.length ? dest : e.countryCodes.slice(0, 1)).map((c) => flagEmoji(c)).join(' ');
                    })()}  ·  {e.startDate?.slice(0, 4)}
                    {e.journeys.length ? ` · ${e.journeys.length} ${e.journeys.length === 1 ? 'leg' : 'legs'}` : ''}
                  </Text>
                  {e.note ? (
                    <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.8, marginTop: 1 }}>{e.note}</Text>
                  ) : null}
                </DestinationImage>
              </Pressable>
            ))}
        {tab === 'journeys' && shownJourneys.length > journeyLimit ? (
          <Pressable accessibilityRole="button" onPress={() => setJourneyLimit((n) => n + 40)} className="items-center rounded-2xl bg-white dark:bg-card" style={{ marginHorizontal: 20, marginTop: 10, paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>
              Show more ({shownJourneys.length - journeyLimit} remaining)
            </Text>
          </Pressable>
        ) : null}
        {tab === 'places' && listPlaces.length > placeLimit ? (
          <Pressable accessibilityRole="button" onPress={() => setPlaceLimit((n) => n + 60)} className="items-center rounded-2xl bg-white dark:bg-card" style={{ marginHorizontal: 20, marginTop: 10, paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>
              Show more ({listPlaces.length - placeLimit} remaining)
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
    {/* Off-screen share poster, captured to a PNG by shareMap(). */}
    {discovered.length > 0 ? (
      <View pointerEvents="none" style={{ position: 'absolute', left: -9999, top: 0 }}>
        <MapPoster
          ref={posterRef}
          firstName={user?.displayName || (user?.email ? user.email.split('@')[0] : 'Explorer')}
          countries={stats.countriesDiscovered}
          cities={stats.citiesDiscovered}
          continents={stats.continentsDiscovered}
          pct={worldPct}
          visited={allVisited}
          flagCodes={stats.flagCodes}
        />
      </View>
    ) : null}
    <DiscoveryScoreSheet visible={!!scoreAgg} onClose={() => setScoreAgg(null)} aggregate={scoreAgg} />
    </View>
  );
}
