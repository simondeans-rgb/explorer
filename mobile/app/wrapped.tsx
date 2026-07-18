import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { goBack } from '../src/lib/nav';
import { router } from 'expo-router';
import { shouldGate } from '../src/lib/billing';
import { X, Share2, Film } from 'lucide-react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { DestinationImage } from '../components/DestinationImage';
import { WorldlyIcon } from '../components/WorldlyLogo';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { destinationImage, hasDestinationPhoto, heroImage } from '../src/lib/destinationImage';
import { continentOf } from '../src/data/countries';
import { DISCOVERY_CATEGORY_META, type DiscoveryCategory } from '../src/types';
import { useWorldly } from '../src/hooks/useWorldly';
import { useAuth } from '../src/store/auth';
import { shareWrappedPoster } from '../src/lib/wrappedPoster';
import { maybeAskForRating } from '../src/lib/rating';
import { shareViewAsPng } from '../src/lib/shareImage';
import { canExportFrameVideo, encodeFramesToVideo } from '../src/lib/frameVideo';
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

  // ---- Share poster data ---------------------------------------------------
  // Photo-first editorial card: a hero photo of the most deeply explored
  // country in scope, plus a strip of runner-up destinations, all ranked by
  // discovery score so the card leads with the strongest story.
  const scoreOf = new Map(aggregates.map((a) => [a.code, a.discoveryScore]));
  const nameOf = new Map(aggregates.map((a) => [a.code, a.name]));
  const rankedPhotoCodes = [...new Set(view.flagCodes)]
    .filter((c) => hasDestinationPhoto(c))
    .sort((a, b) => (scoreOf.get(b) ?? 0) - (scoreOf.get(a) ?? 0));
  const heroCode = rankedPhotoCodes[0] ?? (topCountry && hasDestinationPhoto(topCountry.code) ? topCountry.code : undefined);
  const heroSrc = heroImage(heroCode).photo!;
  const miniCodes = rankedPhotoCodes.filter((c) => c !== heroCode).slice(0, 3);
  const showMinis = miniCodes.length >= 2;

  // The capture must not fire before the poster's photos have decoded, or the
  // shared image ships with blank rectangles. Track loads so share() can wait
  // briefly (they're usually already disk-cached from the slides behind).
  const [loadedSrcs, setLoadedSrcs] = useState<ReadonlySet<string>>(new Set());
  const posterSrcs = [heroSrc, ...(showMinis ? miniCodes.map((c) => destinationImage(c).photo!) : [])];
  const posterReadyRef = useRef(false);
  posterReadyRef.current = posterSrcs.every((s) => loadedSrcs.has(s));
  const markLoaded = (src: string) =>
    setLoadedSrcs((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  // ---- Poster animation ----------------------------------------------------
  // posterT ∈ [0,1] drives the poster's entrance choreography; 1 is the
  // finished card (the state the still PNG captures). shareVideo() sweeps it
  // across frames and encodes them into an MP4 via the FrameVideo module.
  const [posterT, setPosterT] = useState(1);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const canVideo = canExportFrameVideo();
  const posterPhase = (start: number, dur: number) => Math.max(0, Math.min(1, (posterT - start) / dur));
  const easeOut = (p: number) => 1 - (1 - p) ** 3;
  const pPhoto = easeOut(posterPhase(0, 0.5));
  const pHead = easeOut(posterPhase(0.15, 0.45));
  const pCount = posterPhase(0.25, 0.5);
  const pPanel = easeOut(posterPhase(0.35, 0.5));
  const pFlags = easeOut(posterPhase(0.55, 0.4));
  const pMinis = easeOut(posterPhase(0.65, 0.35));
  const shownCountries = Math.round(view.countries * (1 - (1 - pCount) ** 2));

  async function shareVideo() {
    if (sharing || videoProgress !== null) return;
    if (shouldGate('wrapped')) {
      router.push('/upgrade?trigger=wrapped');
      return;
    }
    setVideoProgress(0);
    try {
      for (let i = 0; i < 10 && !posterReadyRef.current; i++) {
        await new Promise((r) => setTimeout(r, 150));
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: native module absent in older builds
      const { captureRef } = require('react-native-view-shot') as typeof import('react-native-view-shot');
      const ANIM = 40; // frames across the entrance…
      const FPS = 20; // …played at 20fps = 2s of motion, then held
      const frames: string[] = [];
      for (let i = 0; i < ANIM; i++) {
        setPosterT(i / (ANIM - 1));
        // Let React commit and the native view draw before capturing.
        await new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 24)));
        frames.push(
          await captureRef(posterRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 }),
        );
        setVideoProgress((i + 1) / ANIM);
      }
      for (let i = 0; i < 30; i++) frames.push(frames[ANIM - 1]); // hold the finished card 1.5s
      const uri = await encodeFramesToVideo(frames, FPS, 1080, 1920);
      if (uri) {
        const Sharing = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'video/mp4',
            dialogTitle: isYear ? `Share your ${year}, wrapped` : 'Share your world, wrapped',
            UTI: 'public.mpeg-4',
          });
        }
        track('wrapped_shared', { scope, format: 'mp4' });
        maybeAskForRating('wrapped_video_share');
      }
    } catch {
      /* user dismissed or capture/encode failed */
    } finally {
      setPosterT(1);
      setVideoProgress(null);
    }
  }

  async function share() {
    if (sharing || videoProgress !== null) return;
    if (shouldGate('wrapped')) {
      router.push('/upgrade?trigger=wrapped');
      return;
    }
    setSharing(true);
    try {
      // Give the poster's photos a moment to finish decoding before capture.
      for (let i = 0; i < 10 && !posterReadyRef.current; i++) {
        await new Promise((r) => setTimeout(r, 150));
      }
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
      maybeAskForRating('wrapped_share');
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
          <Pressable accessibilityRole="button" accessibilityLabel="Share my Worldly" onPress={share} disabled={sharing || videoProgress !== null} className="flex-row items-center rounded-full bg-white dark:bg-card" style={{ marginTop: 26, paddingHorizontal: 24, paddingVertical: 14, gap: 8, opacity: sharing ? 0.6 : 1 }}>
            <Share2 size={18} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.coral }}>{sharing ? 'Preparing…' : 'Share my Worldly'}</Text>
          </Pressable>
          {canVideo ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Share as video" onPress={shareVideo} disabled={sharing || videoProgress !== null} className="flex-row items-center rounded-full" style={{ marginTop: 12, paddingHorizontal: 22, paddingVertical: 12, gap: 8, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', opacity: videoProgress !== null ? 0.75 : 1 }}>
              <Film size={17} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>
                {videoProgress !== null ? `Rendering video… ${Math.round(videoProgress * 100)}%` : 'Share as video'}
              </Text>
            </Pressable>
          ) : null}
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
          parked out of view; collapsable=false so Android keeps the native view.
          Design: photo-first editorial poster — a hero destination photo up
          top, brand wave dividing into a deep-navy stat panel below. */}
      <View ref={posterRef} collapsable={false} style={{ position: 'absolute', left: -9999, top: 0, width: 360, height: 640, backgroundColor: '#0D1428' }}>
        {/* Hero photo of the most-explored destination in scope */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 358, overflow: 'hidden' }}>
          <Image source={{ uri: heroSrc }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: pPhoto, transform: [{ scale: 1.12 - 0.08 * pPhoto }] }} contentFit="cover" cachePolicy="disk" onLoad={() => markLoaded(heroSrc)} />
          <LinearGradient colors={['rgba(8,12,26,0.55)', 'rgba(8,12,26,0)']} locations={[0, 0.3]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <LinearGradient colors={['rgba(13,20,40,0)', 'rgba(13,20,40,0.92)']} locations={[0.42, 0.96]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </View>
        {/* Brand wave dividing photo from panel */}
        <Svg width="100%" height={30} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, top: 329 }}>
          <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill="#0D1428" />
        </Svg>

        {/* Brand row */}
        <View className="flex-row items-center justify-between" style={{ position: 'absolute', top: 23, left: 23, right: 23, opacity: pHead }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: '#fff', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 9, textShadowOffset: { width: 0, height: 1 } }}>worldly</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#fff' }}>{isYear ? year : 'ALL TIME'}</Text>
          </View>
        </View>

        {/* Headline over the photo's lower third */}
        <View style={{ position: 'absolute', left: 23, right: 23, top: 212, opacity: pHead, transform: [{ translateY: 17 * (1 - pHead) }] }}>
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '700', letterSpacing: 2.4, color: '#FFD9E5', textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 7, textShadowOffset: { width: 0, height: 1 } }}>
            {`${firstName.toUpperCase()}’S ${isYear ? 'YEAR' : 'LIFE'} IN TRAVEL`}
          </Text>
          <View style={{ width: 35, height: 2, borderRadius: 1, backgroundColor: COLORS.coral, marginTop: 6 }} />
          <View className="flex-row items-baseline" style={{ gap: 11, marginTop: 2 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 100, lineHeight: 106, color: '#fff', textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 17, textShadowOffset: { width: 0, height: 3 } }}>{shownCountries}</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, lineHeight: 22, color: '#fff', maxWidth: 133, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 1 } }}>
              {view.countries === 1 ? 'country explored' : 'countries explored'}
            </Text>
          </View>
        </View>

        {/* Stat panel */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 358, bottom: 0, paddingHorizontal: 23, paddingTop: 26, opacity: pPanel, transform: [{ translateY: 13 * (1 - pPanel) }] }}>
          <View className="flex-row">
            {([
              [view.continents.length, 'CONTINENTS'],
              [view.cities, 'CITIES'],
              [view.journeys, 'JOURNEYS'],
              [view.discoveries, 'DISCOVERIES'],
            ] as const).map(([n, l], i) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: 'rgba(255,255,255,0.14)' }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 27, lineHeight: 30, color: '#fff' }}>{n}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 7.5, fontWeight: '700', letterSpacing: 1.3, color: '#8E97B8', marginTop: 3 }}>{l}</Text>
              </View>
            ))}
          </View>

          {view.flagCodes.length > 0 ? (
            <Text numberOfLines={1} style={{ textAlign: 'center', fontSize: 17, lineHeight: 24, marginTop: 14, opacity: pFlags }}>
              {view.flagCodes.slice(0, 12).map((c) => flagEmoji(c)).join(' ')}
            </Text>
          ) : null}

          {showMinis ? (
            <View className="flex-row" style={{ gap: 8, marginTop: 14, opacity: pMinis, transform: [{ translateY: 9 * (1 - pMinis) }] }}>
              {miniCodes.map((c) => {
                const src = destinationImage(c).photo!;
                return (
                  <View key={c} style={{ flex: 1, height: 72, borderRadius: 11, overflow: 'hidden', backgroundColor: '#1A2138' }}>
                    <Image source={{ uri: src }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" cachePolicy="disk" onLoad={() => markLoaded(src)} />
                    <LinearGradient colors={['rgba(8,12,26,0)', 'rgba(8,12,26,0.55)']} locations={[0.45, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                    <Text numberOfLines={1} style={{ position: 'absolute', left: 6, right: 6, bottom: 5, fontFamily: 'PlusJakarta', fontSize: 8.5, fontWeight: '700', color: '#fff', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5, textShadowOffset: { width: 0, height: 1 } }}>
                      {nameOf.get(c) ?? c}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <Text numberOfLines={1} adjustsFontSizeToFit style={{ textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 9.5, fontWeight: '700', letterSpacing: 1.5, color: '#FFB84D', marginTop: showMinis ? 15 : 24, opacity: pFlags }}>
            {`EXPLORER LEVEL ${level.level}  ·  ${level.title.toUpperCase()}`}
          </Text>

          <View className="flex-row items-baseline justify-center" style={{ position: 'absolute', left: 0, right: 0, bottom: 15 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 10.5, color: '#9AA3C2' }}>worldly</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 9.5, color: '#6E7794' }}> · your travel story</Text>
          </View>
        </View>
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
