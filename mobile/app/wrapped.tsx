import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { goBack } from '../src/lib/nav';
import { X, Share2 } from 'lucide-react-native';
import { DestinationImage } from '../components/DestinationImage';
import { WorldlyIcon } from '../components/WorldlyLogo';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { hasDestinationPhoto } from '../src/lib/destinationImage';
import { continentOf } from '../src/data/countries';
import { DISCOVERY_CATEGORY_META, type DiscoveryCategory } from '../src/types';
import { useWorldly } from '../src/hooks/useWorldly';
import { useAuth } from '../src/store/auth';
import { shareWrappedPoster } from '../src/lib/wrappedPoster';
import { shareViewAsPng } from '../src/lib/shareImage';
import { track } from '../src/lib/analytics';

export default function WrappedScreen() {
  const { height } = useWindowDimensions();
  const { places, discoveries, expeditions, stats, discoveryStats, journeyStats, level, aggregates } = useWorldly();
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const posterRef = useRef<View>(null);
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Explorer');

  useEffect(() => {
    track('wrapped_viewed');
  }, []);

  // ---- Year scoping -------------------------------------------------------
  // "Wrapped" means *this year* — lifetime is the alternate edition, not the
  // default. Countries come from places first seen this year plus the
  // countries of this year's trips; discoveries/journeys by their own dates.
  const year = new Date().getFullYear();

  const yearStats = useMemo(() => {
    const inYear = (e: (typeof expeditions)[number]) =>
      e.startDate ? Number(e.startDate.slice(0, 4)) === year : new Date(e.createdAt).getFullYear() === year;
    const yearExp = expeditions.filter(inYear);
    const codes = new Set<string>();
    for (const p of places) if (p.kind === 'country' && p.firstYear === year && p.countryCode) codes.add(p.countryCode);
    for (const e of yearExp) for (const c of e.countryCodes) codes.add(c);
    const continents = new Set<string>();
    for (const c of codes) {
      const ct = continentOf(c);
      if (ct) continents.add(ct);
    }
    const yearDisc = discoveries.filter((d) => new Date(d.createdAt).getFullYear() === year);
    const byCategory = new Map<DiscoveryCategory, number>();
    for (const d of yearDisc) byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
    return {
      countries: codes.size,
      flagCodes: [...codes],
      continents: [...continents],
      cities: places.filter((p) => p.kind === 'city' && p.firstYear === year).length,
      journeys: yearExp.reduce((n, e) => n + e.journeys.length, 0),
      discoveries: yearDisc.length,
      recommended: yearDisc.filter((d) => d.verdict === 'recommend' || d.verdict === 'hidden-gem').length,
      topCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
    };
  }, [places, discoveries, expeditions, year]);

  const yearHasData = yearStats.countries > 0 || yearStats.journeys > 0 || yearStats.discoveries > 0;
  const [scopeChoice, setScopeChoice] = useState<'year' | 'life' | null>(null);
  const scope = scopeChoice ?? (yearHasData ? 'year' : 'life');
  const isYear = scope === 'year';

  const lifeTop = (Object.entries(discoveryStats.byCategory) as [DiscoveryCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, n]) => n > 0)[0]?.[0];

  const view = isYear
    ? { ...yearStats, topCategory: yearStats.topCategory }
    : {
        countries: stats.countriesDiscovered,
        flagCodes: stats.flagCodes,
        continents: stats.continents,
        cities: stats.citiesDiscovered,
        journeys: journeyStats.total,
        discoveries: discoveryStats.total,
        recommended: discoveryStats.recommended,
        topCategory: lifeTop,
      };

  // Backdrop codes: discovered countries that have a photo, to vary each slide.
  const photoCodes = aggregates.filter((a) => a.discovered && hasDestinationPhoto(a.code)).map((a) => a.code);
  const bg = (i: number) => (photoCodes.length ? photoCodes[i % photoCodes.length] : 'WW');

  // The most deeply explored country, featured on the shareable poster.
  const topCountry = [...aggregates]
    .filter((a) => a.discovered)
    .sort((a, b) => b.discoveryScore - a.discoveryScore)[0];

  async function share() {
    if (sharing) return;
    setSharing(true);
    try {
      // Prefer a PNG story card (previews inline when shared); fall back to
      // the PDF poster on binaries without the capture module.
      const asImage = posterRef.current
        ? await shareViewAsPng(posterRef.current, isYear ? `Share your ${year}, wrapped` : 'Share your world, wrapped')
        : false;
      if (!asImage) {
        await shareWrappedPoster({
          firstName,
          countries: view.countries,
          continents: view.continents.length,
          cities: view.cities,
          journeys: view.journeys,
          discoveries: view.discoveries,
          levelNumber: level.level,
          levelTitle: level.title,
          xp: level.xp,
          topCountryName: topCountry?.name,
          topCountryCode: topCountry?.code,
          flagCodes: view.flagCodes,
          year: isYear ? year : undefined,
        });
      }
      track('wrapped_shared', { scope, format: asImage ? 'png' : 'pdf' });
    } catch {
      /* user dismissed or print unavailable */
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.night }}>
      <ScrollView pagingEnabled showsVerticalScrollIndicator={false} decelerationRate="fast">
        {/* Intro */}
        <Slide code={bg(0)} height={height}>
          <WorldlyIcon height={66} />
          <Text style={S.eyebrow}>{firstName}, here's</Text>
          <Text style={S.bigTitle}>{isYear ? `Your ${year}, wrapped` : 'Your world, wrapped'}</Text>
          <Text style={S.sub}>{isYear ? `Everywhere ${year} took you, in numbers. Swipe up ↑` : "Everywhere you've been, in numbers. Swipe up ↑"}</Text>
        </Slide>

        {/* Countries */}
        <Slide code={bg(1)} height={height}>
          <Text style={S.eyebrow}>{isYear ? `IN ${year} YOU EXPLORED` : "YOU'VE EXPLORED"}</Text>
          <Text style={S.giant}>{view.countries}</Text>
          <Text style={S.bigLabel}>{view.countries === 1 ? 'country' : 'countries'}</Text>
          {view.flagCodes.length > 0 ? (
            <View className="flex-row flex-wrap items-center justify-center" style={{ gap: 4, marginTop: 22, maxWidth: 320 }}>
              {view.flagCodes.slice(0, 40).map((c) => (
                <Text key={c} style={{ fontSize: 22 }}>{flagEmoji(c)}</Text>
              ))}
            </View>
          ) : null}
        </Slide>

        {/* Continents */}
        <Slide code={bg(2)} height={height}>
          <Text style={S.eyebrow}>ACROSS</Text>
          <Text style={S.giant}>{view.continents.length}</Text>
          <Text style={S.bigLabel}>{view.continents.length === 1 ? 'continent' : 'continents'}</Text>
          {view.continents.length > 0 ? (
            <Text style={[S.sub, { marginTop: 18 }]}>{view.continents.join(' · ')}</Text>
          ) : null}
        </Slide>

        {/* Cities + journeys */}
        <Slide code={bg(3)} height={height}>
          <Text style={S.eyebrow}>ON THE GROUND</Text>
          <View className="flex-row" style={{ gap: 40, marginTop: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={S.medium}>{view.cities}</Text>
              <Text style={S.smallLabel}>{view.cities === 1 ? 'city' : 'cities'}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={S.medium}>{view.journeys}</Text>
              <Text style={S.smallLabel}>{view.journeys === 1 ? 'journey' : 'journeys'}</Text>
            </View>
          </View>
        </Slide>

        {/* Discoveries */}
        <Slide code={bg(4)} height={height}>
          <Text style={S.eyebrow}>YOU KEPT</Text>
          <Text style={S.giant}>{view.discoveries}</Text>
          <Text style={S.bigLabel}>{view.discoveries === 1 ? 'discovery' : 'discoveries'}</Text>
          {view.topCategory ? (
            <Text style={[S.sub, { marginTop: 18 }]}>
              Mostly {DISCOVERY_CATEGORY_META[view.topCategory].label.toLowerCase()} · {view.recommended} you'd recommend
            </Text>
          ) : null}
        </Slide>

        {/* Level */}
        <Slide code={bg(5)} height={height}>
          <Text style={S.eyebrow}>EXPLORER LEVEL {level.level}</Text>
          <Text style={[S.bigTitle, { marginTop: 8 }]}>{level.title}</Text>
          <Text style={[S.sub, { marginTop: 10 }]}>{level.xp.toLocaleString()} XP earned</Text>
        </Slide>

        {/* Outro */}
        <Slide code={bg(6)} height={height}>
          <WorldlyIcon height={58} />
          <Text style={[S.bigTitle, { marginTop: 16 }]}>The world is waiting</Text>
          <Text style={S.sub}>Where will your next story take you?</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Share my Worldly" onPress={share} disabled={sharing} className="flex-row items-center rounded-full bg-white dark:bg-card" style={{ marginTop: 26, paddingHorizontal: 24, paddingVertical: 14, gap: 8, opacity: sharing ? 0.6 : 1 }}>
            <Share2 size={18} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.coral }}>{sharing ? 'Preparing…' : 'Share my Worldly'}</Text>
          </Pressable>
        </Slide>
      </ScrollView>

      {/* Scope: this year vs all time */}
      <View className="flex-row" style={{ position: 'absolute', top: 58, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 3, gap: 2 }}>
        {([
          ['year', String(year)],
          ['life', 'All time'],
        ] as const).map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={key === 'year' ? `Show ${year}` : 'Show all time'}
            accessibilityState={{ selected: scope === key }}
            onPress={() => setScopeChoice(key)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: scope === key ? '#fff' : 'transparent' }}
          >
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: scope === key ? COLORS.navySolid : 'rgba(255,255,255,0.85)' }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Close */}
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={goBack} hitSlop={8} className="absolute rounded-full items-center justify-center" style={{ top: 56, right: 20, height: 40, width: 40, backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <X size={20} color="#fff" />
      </Pressable>

      {/* Offscreen share card (9:16) captured to PNG by share(). Rendered but
          parked out of view; collapsable=false so Android keeps the native view. */}
      <View ref={posterRef} collapsable={false} style={{ position: 'absolute', left: -9999, top: 0, width: 360, height: 640 }}>
        <LinearGradient colors={['#FF6B9A', '#9B7CFF', '#24D1C3']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flex: 1, alignItems: 'center', paddingTop: 44, paddingHorizontal: 28 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 24, color: '#fff' }}>worldly</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 2.5, color: 'rgba(255,255,255,0.92)', marginTop: 22 }}>
            {`${firstName.toUpperCase()}’S ${isYear ? year : 'WORLD,'} WRAPPED`}
          </Text>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 110, lineHeight: 116, color: '#fff', marginTop: 14 }}>{view.countries}</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff', marginTop: -2 }}>
            {view.countries === 1 ? 'country' : 'countries'} explored
          </Text>
          <View className="flex-row flex-wrap justify-center" style={{ gap: 10, marginTop: 24 }}>
            {([
              [view.continents.length, 'CONTINENTS'],
              [view.cities, 'CITIES'],
              [view.journeys, 'JOURNEYS'],
              [view.discoveries, 'DISCOVERIES'],
            ] as const).map(([n, l]) => (
              <View key={l} style={{ width: 140, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 34, lineHeight: 38, color: '#fff' }}>{n}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.9)', marginTop: 1 }}>{l}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 22, backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>
              Explorer Level {level.level} · {level.title}
            </Text>
          </View>
          <Text style={{ fontSize: 19, lineHeight: 28, textAlign: 'center', marginTop: 16, maxWidth: 300 }} numberOfLines={2}>
            {view.flagCodes.slice(0, 24).map((c) => flagEmoji(c)).join(' ')}
          </Text>
          <Text style={{ position: 'absolute', bottom: 22, fontFamily: 'PlusJakarta', fontSize: 11.5, color: 'rgba(255,255,255,0.72)' }}>
            worldly · your travel story
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

function Slide({ code, height, children }: { code: string; height: number; children: ReactNode }) {
  return (
    <DestinationImage code={code} scrim motion style={{ height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
      {/* extra darkening so big text always reads */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,16,24,0.35)' }} />
      <View style={{ alignItems: 'center' }}>{children}</View>
    </DestinationImage>
  );
}

const S = {
  eyebrow: { fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '800' as const, letterSpacing: 2, color: 'rgba(255,255,255,0.9)', marginTop: 14, textAlign: 'center' as const },
  bigTitle: { fontFamily: 'Fraunces', fontSize: 40, lineHeight: 44, color: '#fff', textAlign: 'center' as const, marginTop: 6 },
  giant: { fontFamily: 'Fraunces', fontSize: 132, lineHeight: 140, color: '#fff', textAlign: 'center' as const },
  bigLabel: { fontFamily: 'Fraunces', fontSize: 28, color: '#fff', textAlign: 'center' as const, marginTop: -6 },
  medium: { fontFamily: 'Fraunces', fontSize: 76, lineHeight: 82, color: '#fff' },
  smallLabel: { fontFamily: 'PlusJakarta', fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  sub: { fontFamily: 'PlusJakarta', fontSize: 15, color: 'rgba(255,255,255,0.92)', textAlign: 'center' as const, marginTop: 10, maxWidth: 300 },
};
