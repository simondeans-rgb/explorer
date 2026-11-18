import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, Text, Pressable, useWindowDimensions, AccessibilityInfo } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Play, Pause, X, Share2, RotateCcw, Volume2, VolumeX, ChevronRight, Sparkles, Trophy } from 'lucide-react-native';
import { COLORS, GRADIENTS, tint } from '../src/lib/theme';
import { destinationImage, gradientFor } from '../src/lib/destinationImage';
import { flagEmoji } from '../src/lib/flags';
import { useReduceMotion } from '../src/lib/motion';
import { hImpact, hSelection, hSuccess } from '../src/lib/haptics';
import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { useAuth } from '../src/store/auth';
import { useCoverTheme } from '../src/hooks/useCoverTheme';
import { COVER_SECTIONS, lockReason } from '../src/lib/covers';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { buildLifetimeStory, beatAt, CONTINENT_COLOR, type LifetimeStory, type PlaceCard, type Metric, type Line } from '../src/lib/lifetimeWrapped';
import { JourneyGlobe } from '../components/JourneyGlobe';
import { CONTINENT_GEOMETRY, LAND_GEOMETRY } from '../src/lib/worldGeo';
import type { Continent } from '../src/types';
import { createLifetimePlayer, loadLifetimeAudioSource, TRACK_MS, type LifetimePlayer } from '../src/lib/lifetimeAudio';
import type { PhotoRef } from '../src/lib/lifetimePhotos';
import { shareViewAsPng } from '../src/lib/shareImage';
import { track } from '../src/lib/analytics';
import { maybeAskForRating } from '../src/lib/rating';

// ── small helpers ────────────────────────────────────────────────────────────
const easeOut = (p: number) => 1 - Math.pow(1 - Math.max(0, Math.min(p, 1)), 3);

/** Number that counts up as its scene plays (deterministic, music-synced). */
function upTo(value: number, progress: number, start = 0, span = 0.55): number {
  return Math.round(value * easeOut((progress - start) / span));
}

/** Enter/exit reveal driven by the scene's local progress (Reduce-Motion aware). */
function reveal(progress: number, reduce: boolean, delay = 0) {
  const inP = easeOut((progress - delay) / 0.16);
  const outP = Math.max((progress - 0.93) / 0.07, 0);
  return { opacity: Math.min(inP, 1 - outP), transform: reduce ? [] : [{ translateY: (1 - inP) * 20 }] };
}

// ── photo / backdrop layers ──────────────────────────────────────────────────
function PhotoLayer({ photo, kenBurns, reduce }: { photo: PhotoRef; kenBurns?: number; reduce?: boolean }) {
  const scale = reduce ? 1 : 1 + (kenBurns ?? 0) * 0.06;
  const common = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, transform: [{ scale }] };
  if (photo.kind === 'user') return <Image source={{ uri: photo.uri }} style={common} contentFit="cover" cachePolicy="memory-disk" transition={220} />;
  if (photo.kind === 'stock') {
    const d = destinationImage(photo.code);
    if (d.photo) return <Image source={{ uri: d.photo }} style={common} contentFit="cover" cachePolicy="disk" transition={220} />;
    return <LinearGradient colors={d.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={common} />;
  }
  return <LinearGradient colors={gradientFor(photo.code)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={common} />;
}

const Scrim = ({ strong }: { strong?: boolean }) => (
  <LinearGradient
    colors={['rgba(10,12,22,0.35)', 'rgba(10,12,22,0.25)', strong ? 'rgba(10,12,22,0.82)' : 'rgba(10,12,22,0.62)']}
    locations={[0, 0.45, 1]}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
  />
);

const T = {
  eyebrow: { fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '800' as const, letterSpacing: 2, color: 'rgba(255,255,255,0.9)', textAlign: 'center' as const },
  title: { fontFamily: 'Fraunces', fontSize: 34, lineHeight: 39, color: '#fff', textAlign: 'center' as const },
  giant: { fontFamily: 'Fraunces', fontSize: 120, lineHeight: 126, color: '#fff', textAlign: 'center' as const },
  label: { fontFamily: 'Fraunces', fontSize: 26, color: '#fff', textAlign: 'center' as const },
  sub: { fontFamily: 'PlusJakarta', fontSize: 15, lineHeight: 21, color: 'rgba(255,255,255,0.92)', textAlign: 'center' as const, maxWidth: 320 },
  caption: { fontFamily: 'Fraunces', fontSize: 22, fontStyle: 'italic' as const, color: '#fff', textAlign: 'center' as const },
};

const wrap = (style: object, children: ReactNode) => (
  <View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 8 }, style]}>{children}</View>
);

// ── the card deck ────────────────────────────────────────────────────────────
function Scene({ story, kind, progress, reduce, accent, dims }: { story: LifetimeStory; kind: string; progress: number; reduce: boolean; accent: string; dims: { width: number; height: number } }) {
  const a = reveal(progress, reduce);
  switch (kind) {
    case 'opening':
      return (
        <>
          <PhotoLayer photo={story.heroPhoto} kenBurns={progress} reduce={reduce} />
          <Scrim strong />
          {wrap(a, <>
            <Text style={T.eyebrow}>{story.firstName.toUpperCase()}</Text>
            <Text style={[T.title, { marginTop: 6 }]}>This is your life{'\n'}in the world</Text>
            <Text style={[T.sub, { marginTop: 10 }]}>Every journey became part of your story.</Text>
          </>)}
        </>
      );
    case 'beginning':
      return (
        <>
          <PhotoLayer photo={story.heroPhoto} kenBurns={progress} reduce={reduce} />
          <Scrim strong />
          {wrap(a, <>
            <Text style={T.eyebrow}>WHERE IT BEGAN</Text>
            <Text style={[T.title, { marginTop: 8 }]}>{story.origin.label}</Text>
            <Text style={[T.sub, { marginTop: 10 }]}>{story.origin.sub}</Text>
          </>)}
        </>
      );
    case 'continents':
      return <ContinentsScene story={story} progress={progress} reduce={reduce} dims={dims} />;
    case 'countries':
      return (
        <>
          <LinearGradient colors={GRADIENTS.story as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
          <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
          {wrap({}, <>
            <Text style={T.eyebrow}>COUNTRIES ON YOUR MAP</Text>
            <Text style={[T.giant, { marginTop: 6 }]}>{upTo(story.countriesCount, progress, 0.05, 0.5)}</Text>
            <Text style={T.label}>{story.countriesCount === 1 ? 'country' : 'countries'}</Text>
            {story.flagCodes.length > 0 ? (
              <Text numberOfLines={2} style={{ textAlign: 'center', fontSize: 22, marginTop: 16, maxWidth: 320, opacity: easeOut((progress - 0.25) / 0.5) }}>
                {story.flagCodes.slice(0, 16).map((c) => flagEmoji(c)).join(' ')}
              </Text>
            ) : null}
          </>)}
        </>
      );
    case 'cities':
      return (
        <>
          <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
          {!reduce && story.cityNames.length > 0 ? <CityFloat names={story.cityNames} progress={progress} dims={dims} /> : null}
          <LinearGradient colors={['rgba(10,12,22,0.15)', 'rgba(10,12,22,0.55)']} style={fill} />
          {wrap({}, <>
            <Text style={T.eyebrow}>CITIES YOU EXPLORED</Text>
            <Text style={[T.giant, { marginTop: 6 }]}>{upTo(story.citiesCount, progress, 0.05, 0.5)}</Text>
            <Text style={T.label}>{story.citiesCount === 1 ? 'city' : 'cities'}</Text>
            <Text style={[T.sub, { marginTop: 8, opacity: easeOut((progress - 0.3) / 0.4) }]}>Each one a chapter of its own</Text>
          </>)}
        </>
      );
    case 'distance':
      return <DistanceScene story={story} progress={progress} reduce={reduce} />;
    case 'transport':
      return <TransportScene story={story} progress={progress} reduce={reduce} accent={accent} />;
    case 'journeys':
      return <JourneysScene story={story} progress={progress} reduce={reduce} dims={dims} />;
    case 'places': {
      const p: PlaceCard | undefined = story.places[Math.min(Math.floor(progress * Math.max(1, story.places.length)), story.places.length - 1)];
      return (
        <>
          {p ? <PhotoLayer photo={p.photo} kenBurns={progress} reduce={reduce} /> : <LinearGradient colors={gradientFor('WW')} style={fill} />}
          <Scrim strong />
          {p ? <Polaroids photos={p.polaroids} progress={progress} reduce={reduce} dims={dims} count={2} seed={p.code.charCodeAt(0)} /> : null}
          {p ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: 26, right: 26, bottom: 120, ...reveal(progress % (1 / Math.max(1, story.places.length)) * story.places.length, reduce) }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: '#FFD9E5' }}>THE PLACES THAT SHAPED YOU</Text>
              <Text style={[T.caption, { textAlign: 'left', marginTop: 8 }]}>{p.caption}</Text>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 40, color: '#fff', marginTop: 4 }} numberOfLines={2}>{flagEmoji(p.code)} {p.name}</Text>
            </View>
          ) : null}
        </>
      );
    }
    case 'discoveries':
      return <DiscoveriesScene story={story} progress={progress} reduce={reduce} accent={accent} dims={dims} />;
    case 'peak':
      return (
        <>
          <LinearGradient colors={[accent, '#7A2E8A', '#141026']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
          {!reduce ? <Confetti progress={progress} dims={dims} /> : null}
          {wrap({ justifyContent: 'center' }, <>
            <View style={{ alignItems: 'center', opacity: easeOut(progress / 0.22) }}>
              <Trophy size={30} color="#FFD36E" />
              <Text style={[T.eyebrow, { marginTop: 8 }]}>EXPLORER LEVEL {story.level.level}</Text>
              <Text style={[T.title, { marginTop: 4 }]}>{story.level.title}</Text>
              <Text style={[T.sub, { marginTop: 4 }]}>{upTo(story.level.xp, progress, 0.08, 0.45).toLocaleString()} XP earned</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 20, maxWidth: 320 }}>
              {story.badges.map((b, i) => (
                <View key={i} style={{ opacity: easeOut((progress - 0.28 - i * 0.05) / 0.3) }}>
                  <LinearGradient colors={b.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
                    <Text style={{ fontSize: 15 }}>{b.emoji}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#fff' }}>{b.title}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
            {story.coversUnlocked > 0 ? (
              <Text style={[T.sub, { marginTop: 16, opacity: easeOut((progress - 0.55) / 0.3) }]}>
                {story.coversUnlocked} Passport {story.coversUnlocked === 1 ? 'Cover' : 'Covers'} earned along the way
              </Text>
            ) : null}
          </>)}
        </>
      );
    case 'portrait':
      return <PortraitCard story={story} accent={accent} progress={progress} reduce={reduce} />;
    case 'continues':
      return (
        <>
          <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
          <LinearGradient colors={['rgba(10,12,22,0.4)', 'rgba(10,12,22,0.85)']} style={fill} />
          {wrap(a, <>
            <Text style={[T.title, { fontSize: 30 }]}>Your story is still{'\n'}being written</Text>
            <Text style={[T.sub, { marginTop: 12 }]}>There is always more world to discover.</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: '#fff', marginTop: 24, opacity: easeOut((progress - 0.5) / 0.4) }}>worldly</Text>
          </>)}
        </>
      );
    default:
      return null;
  }
}

const fill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

/** A slow cross-fading rotation of stock destination backdrops for stat scenes. */
function BackdropRotate({ codes, progress, reduce, dim }: { codes: string[]; progress: number; reduce?: boolean; dim?: boolean }) {
  const i = Math.min(Math.floor(progress * codes.length), codes.length - 1);
  const code = codes[Math.max(0, i)] ?? 'WW';
  return (
    <>
      <PhotoLayer photo={{ kind: 'stock', code }} kenBurns={reduce ? 0 : progress} reduce={reduce} />
      <LinearGradient colors={dim ? ['rgba(14,14,30,0.72)', 'rgba(14,14,30,0.82)'] : ['rgba(10,12,22,0.3)', 'rgba(10,12,22,0.55)']} style={fill} />
    </>
  );
}

// Deterministic pseudo-random in [0,1) from an index + salt — stable across the
// re-renders of a progress-driven scene (no Math.random at render time).
const rnd = (i: number, salt: number) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** The continents map — a flat world where each visited continent (member
 *  countries fused into one shape, so no country borders show) colours in one
 *  after another, in the order they were first reached. */
function ContinentsScene({ story, progress, reduce, dims }: { story: LifetimeStory; progress: number; reduce: boolean; dims: { width: number; height: number } }) {
  const cr = story.continentsReveal;
  const mapW = Math.min(dims.width - 20, 560);
  const mapH = Math.round(mapW * 0.55);
  const { landPath, contPaths } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proj = geoNaturalEarth1().fitSize([mapW, mapH], LAND_GEOMETRY as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const path = geoPath(proj as any);
    const contPaths = cr.names
      .map((name) => {
        const geom = CONTINENT_GEOMETRY[name as Continent];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return geom ? { name, d: path(geom as any) ?? '', color: CONTINENT_COLOR[name as Continent] } : null;
      })
      .filter((c): c is { name: string; d: string; color: string } => !!c && !!c.d);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { landPath: path(LAND_GEOMETRY as any) ?? '', contPaths };
  }, [mapW, mapH, cr.names]);
  const revealF = (reduce ? cr.names.length : easeOut(progress / 0.82) * cr.names.length);
  const revealed = Math.max(1, Math.min(cr.names.length, Math.floor(revealF) + (progress > 0.02 ? 1 : 0)));
  return (
    <>
      <LinearGradient colors={['#0B1020', '#161E38', '#0B1020']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: dims.height * 0.17, alignItems: 'center' }}>
        <Svg width={mapW} height={mapH}>
          <Path d={landPath} fill="#222C48" />
          {contPaths.map((c, i) => (
            <Path key={c.name} d={c.d} fill={c.color} fillOpacity={Math.max(0, Math.min(1, revealF - i))} />
          ))}
        </Svg>
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 26, right: 26, bottom: 92, alignItems: 'center' }}>
        <Text style={T.eyebrow}>THE CONTINENTS YOU&apos;VE REACHED</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 72, color: '#fff' }}>{cr.count}</Text>
          <Text style={T.label}>of 7</Text>
        </View>
        <Text numberOfLines={2} style={[T.sub, { marginTop: 6 }]}>{cr.names.slice(0, revealed).join('  ·  ')}</Text>
      </View>
    </>
  );
}

/** The journeys globe — every recorded flight route drawn on in date order,
 *  reusing the same globe as the Journeys tab. */
function JourneysScene({ story, progress, reduce, dims }: { story: LifetimeStory; progress: number; reduce: boolean; dims: { width: number; height: number } }) {
  const globeSize = Math.min(dims.width * 0.94, dims.height * 0.56);
  return (
    <>
      <LinearGradient colors={['#0A0F1F', '#12203A', '#0A0F1F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: dims.height * 0.1, height: globeSize, alignItems: 'center', justifyContent: 'center' }}>
        <JourneyGlobe segments={story.routes.segments} maxSize={globeSize} resetKey="lw-journeys" />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 26, right: 26, bottom: 96, alignItems: 'center' }}>
        <Text style={T.eyebrow}>EVERY JOURNEY, DRAWN IN ORDER</Text>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 56, color: '#fff', marginTop: 4 }}>{story.routes.count}</Text>
        <Text style={[T.sub, { marginTop: 2 }]}>routes across your travels</Text>
      </View>
    </>
  );
}

/** Distance travelled, made tangible: laps of the Earth / % of the way to the Moon. */
function DistanceScene({ story, progress, reduce }: { story: LifetimeStory; progress: number; reduce: boolean }) {
  const d = story.distance;
  const mi = upTo(d.mi, progress, 0.05, 0.5);
  const comparison =
    d.laps >= 1
      ? `Around the world ${d.laps.toFixed(d.laps >= 10 ? 0 : 1)} times`
      : d.moonPct >= 1
        ? `${d.moonPct.toFixed(d.moonPct >= 10 ? 0 : 1)}% of the way to the Moon`
        : 'Across your recorded journeys';
  return (
    <>
      <LinearGradient colors={['#101A33', '#1E2A4D', '#0C1226']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
      {wrap({}, <>
        <Text style={T.eyebrow}>HOW FAR YOU&apos;VE TRAVELLED</Text>
        <Text style={[T.giant, { fontSize: 84, lineHeight: 90, marginTop: 6 }]}>{mi.toLocaleString()}</Text>
        <Text style={T.label}>miles</Text>
        <Text style={[T.sub, { marginTop: 12, opacity: easeOut((progress - 0.3) / 0.35) }]}>{comparison}</Text>
        {d.topMode ? (
          <Text style={[T.caption, { fontSize: 20, marginTop: 14, opacity: easeOut((progress - 0.5) / 0.35) }]}>
            Mostly {d.topMode.mode === 'flight' ? 'by air' : `by ${d.topMode.mode}`} · {d.topMode.count} {d.topMode.noun}
          </Text>
        ) : null}
      </>)}
    </>
  );
}

/** Airline / aircraft / delays — the texture of how you fly. */
function TransportScene({ story, progress, reduce, accent }: { story: LifetimeStory; progress: number; reduce: boolean; accent: string }) {
  const t = story.transport;
  const rows: { top: string; big: string; sub?: string }[] = [];
  if (t.airline) rows.push({ top: 'MOST-FLOWN AIRLINE', big: t.airline.label, sub: `${t.airline.count} ${t.airline.count === 1 ? 'flight' : 'flights'}${t.airlines > 1 ? ` · ${t.airlines} airlines in all` : ''}` });
  if (t.aircraft) rows.push({ top: 'YOUR AIRCRAFT', big: t.aircraft.label, sub: `${t.aircraft.count} ${t.aircraft.count === 1 ? 'flight' : 'flights'} aboard` });
  if (t.delayMin > 0) {
    const h = Math.floor(t.delayMin / 60);
    const m = t.delayMin % 60;
    rows.push({ top: 'LOST TO DELAYS', big: h > 0 ? `${h}h ${m}m` : `${m}m`, sub: 'Time the airlines owe you back' });
  }
  return (
    <>
      <LinearGradient colors={['#141026', accent, '#1B1030']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
        <Text style={[T.eyebrow, { marginBottom: 8 }]}>HOW YOU FLY</Text>
        {rows.map((r, i) => (
          <View key={i} style={{ alignItems: 'center', marginTop: i === 0 ? 4 : 22, opacity: easeOut((progress - i * 0.16) / 0.4), transform: reduce ? [] : [{ translateY: (1 - easeOut((progress - i * 0.16) / 0.4)) * 16 }] }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 2, color: 'rgba(255,255,255,0.7)' }}>{r.top}</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 34, color: '#fff', marginTop: 2, textAlign: 'center' }} numberOfLines={1}>{r.big}</Text>
            {r.sub ? <Text style={[T.sub, { marginTop: 2, fontSize: 13 }]}>{r.sub}</Text> : null}
          </View>
        ))}
      </View>
    </>
  );
}

/** The discoveries card — the names of saved places fall from the top of the
 *  screen to the bottom like rain, over a headline count. */
function DiscoveriesScene({ story, progress, reduce, accent, dims }: { story: LifetimeStory; progress: number; reduce: boolean; accent: string; dims: { width: number; height: number } }) {
  const names = story.discoveryNames;
  const a = reveal(progress, reduce);
  return (
    <>
      <LinearGradient colors={['#1B1030', '#3A1E5E', accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      {!reduce && names.length > 0 ? <NameRain names={names} progress={progress} dims={dims} /> : null}
      <LinearGradient colors={['rgba(14,10,30,0.15)', 'rgba(14,10,30,0.5)']} style={fill} />
      {wrap(a, <>
        <Text style={T.eyebrow}>WHAT YOU FOUND</Text>
        {story.discoveries.map((l: Line, i) => (
          <View key={i} style={{ alignItems: 'center', marginTop: i === 0 ? 10 : 16, opacity: easeOut((progress - (i ? 0.4 : 0.05)) / 0.4) }}>
            <Text style={[T.label, { fontSize: i === 0 ? 40 : 26 }]}>{l.headline}</Text>
            {l.sub ? <Text style={[T.sub, { marginTop: 4 }]}>{l.sub}</Text> : null}
          </View>
        ))}
      </>)}
    </>
  );
}

/** Place names raining down — deterministic (seekable) falling text, each at its
 *  own tilt and drifting sideways as it falls, so the rain feels uneven and fun. */
function NameRain({ names, progress, dims }: { names: string[]; progress: number; dims: { width: number; height: number } }) {
  const { width, height } = dims;
  const drops = names.slice(0, 16);
  return (
    <View pointerEvents="none" style={[fill, { overflow: 'hidden' }]}>
      {drops.map((name, i) => {
        const x = 8 + rnd(i, 1) * Math.max(1, width - 150);
        const speed = 0.65 + rnd(i, 2) * 0.75; // screens per scene — varied fall rates
        const offset = rnd(i, 3);
        const fontSize = 15 + Math.round(rnd(i, 4) * 13);
        const cycle = (progress * speed + offset) % 1;
        const y = cycle * (height + 140) - 90;
        // Each name tilts a different way and slides sideways as it falls, so no
        // two drop on the same line or angle.
        const tilt = (rnd(i, 6) - 0.5) * 46; // ±23°
        const drift = (rnd(i, 7) - 0.5) * 70 * cycle;
        const edge = Math.min(y + 90, height + 50 - y) / 90;
        const opacity = Math.max(0, Math.min(1, edge)) * (0.5 + rnd(i, 5) * 0.5);
        return (
          <Text
            key={i}
            numberOfLines={1}
            style={{ position: 'absolute', left: x + drift, top: y, fontFamily: 'Fraunces', fontStyle: 'italic', fontSize, color: '#fff', opacity, transform: [{ rotate: `${tilt}deg` }] }}
          >
            {name}
          </Text>
        );
      })}
    </View>
  );
}

/** City names drifting UP the screen with a gentle balloon-like sway. */
function CityFloat({ names, progress, dims }: { names: string[]; progress: number; dims: { width: number; height: number } }) {
  const { width, height } = dims;
  const items = names.slice(0, 16);
  return (
    <View pointerEvents="none" style={[fill, { overflow: 'hidden' }]}>
      {items.map((name, i) => {
        const x = 12 + rnd(i, 1) * Math.max(1, width - 160);
        const speed = 0.6 + rnd(i, 2) * 0.6; // rises per scene
        const offset = rnd(i, 3);
        const fontSize = 16 + Math.round(rnd(i, 4) * 13);
        const cycle = (progress * speed + offset) % 1;
        const y = height + 70 - cycle * (height + 160); // bottom → top
        const sway = Math.sin(cycle * Math.PI * 2 * (1.1 + rnd(i, 5)) + i) * (10 + rnd(i, 6) * 20);
        const tilt = Math.sin(cycle * Math.PI * 2 + i) * 6;
        const edge = Math.min(height + 70 - y, y + 80) / 80;
        const opacity = Math.max(0, Math.min(1, edge)) * (0.55 + rnd(i, 7) * 0.45);
        return (
          <Text
            key={i}
            numberOfLines={1}
            style={{ position: 'absolute', left: x + sway, top: y, fontFamily: 'Fraunces', fontSize, color: '#fff', opacity, transform: [{ rotate: `${tilt}deg` }] }}
          >
            {name}
          </Text>
        );
      })}
    </View>
  );
}

/** The user's own photos, framed as small tilted polaroids that drift in. */
function Polaroids({ photos, progress, reduce, dims, count, seed }: { photos: PhotoRef[]; progress: number; reduce: boolean; dims: { width: number; height: number }; count: number; seed: number }) {
  const shots = photos.filter((p) => p.kind === 'user').slice(0, count);
  if (shots.length === 0) return null;
  const { width, height } = dims;
  return (
    <View pointerEvents="none" style={fill}>
      {shots.map((photo, i) => {
        const w = 96 + Math.round(rnd(seed + i, 1) * 26);
        const left = i % 2 === 0 ? width * 0.06 + rnd(seed + i, 2) * 20 : width * 0.62 - rnd(seed + i, 2) * 20;
        const top = height * (0.16 + (i % 3) * 0.22) + rnd(seed + i, 3) * 24;
        const rot = (rnd(seed + i, 4) - 0.5) * 18;
        const app = easeOut((progress - 0.12 - i * 0.1) / 0.4);
        const scale = reduce ? 1 : 0.8 + app * 0.2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute', left, top, width: w, padding: 6, paddingBottom: 16, backgroundColor: '#fff', borderRadius: 4,
              opacity: Math.min(1, app), transform: [{ rotate: `${rot}deg` }, { scale }],
              shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
            }}
          >
            <View style={{ width: w - 12, height: w - 12, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="memory-disk" transition={200} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** A confetti cannon for the level card: a big radial burst that saturates the
 *  screen, then gravity drags every piece down into a falling shower. Fully
 *  progress-driven so it stays in sync when the story is paused or scrubbed. */
function Confetti({ progress, dims }: { progress: number; dims: { width: number; height: number } }) {
  const COLORS_C = ['#FF6B9A', '#9B7CFF', '#24D1C3', '#FFB84D', '#FF7A66', '#4DA6FF', '#FFD23F'];
  const { width, height } = dims;
  const count = Math.min(460, Math.max(320, Math.round((width * height) / 1300)));
  const originY = height * 0.42;
  return (
    <View pointerEvents="none" style={[fill, { overflow: 'hidden' }]}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = rnd(i, 1) * Math.PI * 2;
        const mag = 0.45 + rnd(i, 2) * 0.85;
        const reach = Math.cos(angle) * mag * width * 0.6;
        const rise = Math.sin(angle) * mag * height * 0.5;
        const fall = height * (1.4 + rnd(i, 3) * 0.7);
        const delay = rnd(i, 4) * 0.06;
        const t = Math.max(0, Math.min((progress - delay) / 0.9, 1));
        const b = Math.min(t / 0.3, 1);
        const burst = 1 - (1 - b) * (1 - b) * (1 - b);
        const g = t < 0.22 ? 0 : (t - 0.22) / 0.78;
        const gravity = g * g;
        const sway = Math.sin(t * Math.PI * 3 + i) * (6 + rnd(i, 6) * 16);
        const w = 6 + rnd(i, 7) * 6;
        const round = rnd(i, 8) < 0.25;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: width / 2 + reach * burst + sway,
              top: originY + rise * burst + fall * gravity,
              width: w,
              height: round ? w : w * 1.7,
              borderRadius: round ? w : 2,
              backgroundColor: COLORS_C[i % COLORS_C.length],
              opacity: t > 0.9 ? (1 - t) / 0.1 : t < 0.03 ? t / 0.03 : 1,
              transform: [{ rotate: `${(rnd(i, 9) - 0.5) * 1100 * t}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}

/** The signature lifetime portrait — used both as the animated portrait beat and
 *  as the captured share card. */
function PortraitCard({ story, accent, progress = 1, reduce, capture }: { story: LifetimeStory; accent: string; progress?: number; reduce?: boolean; capture?: boolean }) {
  const grad: [string, string, string] = ['#141026', accent, '#3A1E5E'];
  return (
    <>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 }}>
        <View style={{ alignItems: 'center', opacity: easeOut(progress / 0.35) }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 2, color: 'rgba(255,255,255,0.8)' }}>A LIFE IN THE WORLD</Text>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 40, color: '#fff', marginTop: 4 }}>{story.portrait.title}</Text>
        </View>
        {/* photo strip */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20, opacity: easeOut((progress - 0.2) / 0.4) }}>
          {story.portrait.photos.map((ph, i) => (
            <View key={i} style={{ width: 74, height: 96, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
              <PhotoLayer photo={ph} reduce />
            </View>
          ))}
        </View>
        {/* stat row */}
        <View style={{ flexDirection: 'row', marginTop: 24, opacity: easeOut((progress - 0.35) / 0.4) }}>
          {story.portrait.stats.map((m: Metric, i) => (
            <View key={i} style={{ paddingHorizontal: 14, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: 'rgba(255,255,255,0.18)' }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 34, color: '#fff' }}>{m.value}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{m.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, color: '#FFD36E', marginTop: 22, opacity: easeOut((progress - 0.5) / 0.4) }}>
          {story.level.title.toUpperCase()} · LEVEL {story.level.level}
        </Text>
        {capture ? (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 22 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>worldly</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}> · your life in the world</Text>
          </View>
        ) : null}
      </View>
    </>
  );
}

// ── screen ───────────────────────────────────────────────────────────────────
type Phase = 'ready' | 'preparing' | 'playing' | 'paused' | 'done';

export default function LifetimeWrappedScreen() {
  const { width, height } = useWindowDimensions();
  const reduce = useReduceMotion();
  const worldly = useWorldly();
  const { places, captures } = useData();
  const { user } = useAuth();
  const theme = useCoverTheme();
  const accent = theme.accent ?? COLORS.lavender;
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Explorer');

  const coversUnlocked = useMemo(
    () => COVER_SECTIONS.flatMap((s) => s.covers).filter((c) => c.unlock && c.name && !lockReason(c, worldly.stats.countriesDiscovered, worldly.level.level)).length,
    [worldly.stats.countriesDiscovered, worldly.level.level],
  );

  const story = useMemo(
    () => buildLifetimeStory({
      firstName, places, captures, discoveries: worldly.discoveries, expeditions: worldly.expeditions,
      aggregates: worldly.aggregates, stats: worldly.stats, discoveryStats: worldly.discoveryStats,
      journeyStats: worldly.journeyStats, level: worldly.level, badges: worldly.badges, coversUnlocked,
    }),
    [firstName, places, captures, worldly, coversUnlocked],
  );

  const [phase, setPhase] = useState<Phase>('ready');
  const [tMs, setTMs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [controlsShown, setControlsShown] = useState(true);
  const player = useRef<LifetimePlayer | null>(null);
  const raf = useRef(0);
  const anchor = useRef(0); // Date.now() at last (re)start
  const base = useRef(0); // accumulated ms at last pause
  const lastFrame = useRef(0);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portraitRef = useRef<View>(null);

  useEffect(() => {
    track('lifetime_wrapped_opened');
    return () => {
      cancelAnimationFrame(raf.current);
      player.current?.release();
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const active = beatAt(tMs, story.beats);
  useEffect(() => {
    // A soft haptic on each new beat while playing.
    if (phase === 'playing') hSelection();
  }, [active.index, phase]);

  function tick() {
    const now = Date.now();
    const t = base.current + (now - anchor.current);
    if (t >= TRACK_MS) {
      setTMs(TRACK_MS);
      finish();
      return;
    }
    if (now - lastFrame.current >= 40) {
      lastFrame.current = now;
      setTMs(t);
    }
    raf.current = requestAnimationFrame(tick);
  }

  async function start() {
    setPhase('preparing');
    hImpact('light');
    // Preload the opening backdrops + resolve the soundtrack to a local file so
    // playback begins on ready assets (and the native audio player never gets an
    // unresolved remote OTA asset — that crashed on device).
    let source: { uri: string } | null = null;
    try {
      const codes = [story.backdropCodes[0], story.backdropCodes[1]].filter(Boolean);
      const [src] = await Promise.race([
        Promise.all([
          loadLifetimeAudioSource(),
          ...codes.map((c) => destinationImage(c).photo).filter(Boolean).map((u) => Image.prefetch(u as string)),
        ]),
        new Promise<[null]>((r) => setTimeout(() => r([null]), 2500)),
      ]);
      source = src;
    } catch {}
    try {
      player.current = createLifetimePlayer(muted, source);
    } catch {
      player.current = null;
    }
    base.current = 0;
    anchor.current = Date.now();
    lastFrame.current = 0;
    player.current?.play();
    setPhase('playing');
    setTMs(0);
    raf.current = requestAnimationFrame(tick);
    scheduleHideControls();
    track('lifetime_wrapped_played', { audio: player.current?.available ?? false });
  }

  function pause() {
    cancelAnimationFrame(raf.current);
    base.current = tMs;
    player.current?.pause();
    setPhase('paused');
    setControlsShown(true);
  }
  function resume() {
    anchor.current = Date.now();
    player.current?.seekTo(base.current / 1000);
    player.current?.play();
    setPhase('playing');
    raf.current = requestAnimationFrame(tick);
    scheduleHideControls();
  }
  function finish() {
    cancelAnimationFrame(raf.current);
    player.current?.pause();
    setPhase('done');
    setControlsShown(true);
    hSuccess();
    track('lifetime_wrapped_completed');
    maybeAskForRating('lifetime_wrapped');
  }
  function replay() {
    hImpact('light');
    base.current = 0;
    anchor.current = Date.now();
    lastFrame.current = 0;
    setTMs(0);
    player.current?.seekTo(0);
    player.current?.play();
    setPhase('playing');
    raf.current = requestAnimationFrame(tick);
    scheduleHideControls();
  }
  function skip() {
    hSelection();
    setTMs(TRACK_MS);
    finish();
  }
  function toggleMute() {
    const m = !muted;
    setMuted(m);
    player.current?.setMuted(m);
    hSelection();
  }
  function close() {
    cancelAnimationFrame(raf.current);
    player.current?.pause();
    player.current?.release();
    router.back();
  }
  function scheduleHideControls() {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsShown(false), 2600);
  }

  const [shareBusy, setShareBusy] = useState(false);
  async function shareCard() {
    if (shareBusy || !portraitRef.current) return;
    setShareBusy(true);
    try {
      await shareViewAsPng(portraitRef.current, `${firstName}'s life in the world`);
      track('lifetime_wrapped_shared', { format: 'card' });
    } finally {
      setShareBusy(false);
    }
  }

  // VoiceOver: announce each scene's meaning as it changes.
  useEffect(() => {
    if (phase !== 'playing') return;
    AccessibilityInfo.announceForAccessibility(sceneAnnouncement(active.beat.kind, story));
  }, [active.index, phase]);

  const playing = phase === 'playing' || phase === 'paused';

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0C16' }}>
      {phase === 'ready' ? (
        <StartScreen story={story} onStart={start} onClose={close} />
      ) : phase === 'preparing' ? (
        <Preparing />
      ) : (
        <Pressable style={{ flex: 1 }} onPress={() => { setControlsShown((s) => !s); if (!controlsShown && phase === 'playing') scheduleHideControls(); }}>
          {/* the current scene */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Scene story={story} kind={active.beat.kind} progress={active.progress} reduce={reduce} accent={accent} dims={{ width, height }} />
          </View>

          {/* wave-masked bottom edge — Worldly signature */}
          <Svg width="100%" height={40} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill="rgba(10,12,22,0.55)" />
          </Svg>

          {/* progress bar (beat ticks) */}
          <View style={{ position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', gap: 4, opacity: controlsShown ? 1 : 0.25 }}>
            {story.beats.map((b, i) => {
              const p = tMs <= b.startMs ? 0 : tMs >= b.endMs ? 1 : (tMs - b.startMs) / (b.endMs - b.startMs);
              return (
                <View key={i} style={{ flex: b.endMs - b.startMs, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)', overflow: 'hidden' }}>
                  <View style={{ width: `${p * 100}%`, height: 3, backgroundColor: '#fff' }} />
                </View>
              );
            })}
          </View>

          {/* controls */}
          {controlsShown ? (
            <>
              <View style={{ position: 'absolute', top: 46, right: 16, flexDirection: 'row', gap: 8 }}>
                <Round label={muted ? 'Unmute' : 'Mute'} onPress={toggleMute}>{muted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}</Round>
                <Round label="Close" onPress={close}><X size={18} color="#fff" /></Round>
              </View>
              {phase !== 'done' ? (
                <View style={{ position: 'absolute', bottom: 46, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                  <Round label={phase === 'paused' ? 'Resume' : 'Pause'} onPress={phase === 'paused' ? resume : pause} big>{phase === 'paused' ? <Play size={22} color="#fff" /> : <Pause size={22} color="#fff" />}</Round>
                  <Pressable onPress={skip} accessibilityRole="button" accessibilityLabel="Skip to the end" hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>Skip</Text>
                    <ChevronRight size={16} color="rgba(255,255,255,0.8)" />
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}

          {/* end card actions */}
          {phase === 'done' ? (
            <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24, gap: 10 }}>
              <Pressable onPress={shareCard} disabled={shareBusy} accessibilityRole="button" accessibilityLabel="Share your lifetime card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 15, backgroundColor: '#fff', opacity: shareBusy ? 0.6 : 1 }}>
                <Share2 size={18} color={accent} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '800', color: accent }}>{shareBusy ? 'Preparing…' : 'Share your lifetime card'}</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={replay} accessibilityRole="button" accessibilityLabel="Replay" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 13, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
                  <RotateCcw size={16} color="#fff" /><Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Replay</Text>
                </Pressable>
                <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Done" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999, paddingVertical: 13, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Done</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </Pressable>
      )}

      {/* Offscreen capture card for sharing (fixed 9:16). */}
      <View ref={portraitRef} collapsable={false} style={{ position: 'absolute', left: -9999, top: 0, width: 360, height: 640, overflow: 'hidden' }}>
        <PortraitCard story={story} accent={accent} progress={1} reduce capture />
      </View>
    </View>
  );
}

function sceneAnnouncement(kind: string, s: LifetimeStory): string {
  switch (kind) {
    case 'opening': return `${s.firstName}, this is your life in the world.`;
    case 'beginning': return s.origin.label;
    case 'continents': return `${s.continentsReveal.count} of 7 continents: ${s.continentsReveal.names.join(', ')}.`;
    case 'countries': return `${s.countriesCount} ${s.countriesCount === 1 ? 'country' : 'countries'} on your map.`;
    case 'cities': return `${s.citiesCount} ${s.citiesCount === 1 ? 'city' : 'cities'} explored.`;
    case 'distance': return `${s.distance.mi.toLocaleString()} miles travelled${s.distance.laps >= 1 ? `, around the world ${s.distance.laps.toFixed(1)} times` : ''}.`;
    case 'transport': return [s.transport.airline && `Most-flown airline ${s.transport.airline.label}`, s.transport.aircraft && `aircraft ${s.transport.aircraft.label}`, s.transport.delayMin > 0 && `${Math.round(s.transport.delayMin / 60)} hours lost to delays`].filter(Boolean).join('. ');
    case 'journeys': return `Every journey drawn in order: ${s.routes.count} routes.`;
    case 'places': return `The places that shaped you: ${s.places.map((p) => p.name).join(', ')}.`;
    case 'discoveries': return s.discoveries.map((l) => l.headline).join('. ');
    case 'peak': return `Explorer level ${s.level.level}, ${s.level.title}. ${s.badges.length} achievements earned.`;
    case 'portrait': return `${s.portrait.title}. ${s.portrait.stats.map((m) => `${m.value} ${m.label}`).join(', ')}.`;
    case 'continues': return 'Your story is still being written.';
    default: return '';
  }
}

function Round({ children, onPress, label, big }: { children: ReactNode; onPress: () => void; label: string; big?: boolean }) {
  const d = big ? 58 : 40;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={{ height: d, width: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: big ? 2 : 0, borderColor: 'rgba(255,255,255,0.6)' }}>
      {children}
    </Pressable>
  );
}

function StartScreen({ story, onStart, onClose }: { story: LifetimeStory; onStart: () => void; onClose: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <PhotoLayer photo={story.heroPhoto} />
      <Scrim strong />
      <View style={{ position: 'absolute', top: 46, right: 16 }}>
        <Round label="Close" onPress={onClose}><X size={18} color="#fff" /></Round>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Sparkles size={26} color="#FFD36E" />
        <Text style={[T.eyebrow, { marginTop: 14 }]}>LIFETIME WRAPPED</Text>
        <Text style={[T.title, { marginTop: 8 }]}>Your lifetime in the{'\n'}world is ready</Text>
        <Text style={[T.sub, { marginTop: 12 }]}>A 53-second celebration of everywhere you’ve travelled, lived and discovered.</Text>
        <Pressable onPress={onStart} accessibilityRole="button" accessibilityLabel="Play Lifetime Wrapped" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 30, borderRadius: 999, paddingHorizontal: 26, paddingVertical: 16, backgroundColor: '#fff' }}>
          <Play size={20} color={COLORS.coral} fill={COLORS.coral} />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: COLORS.coral }}>Play Lifetime Wrapped</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Preparing() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0C16' }}>
      <LinearGradient colors={GRADIENTS.story as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 64, width: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={28} color="#fff" />
      </LinearGradient>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: '#fff', marginTop: 20 }}>Preparing your life in the world…</Text>
    </View>
  );
}
