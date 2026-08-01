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
import { buildLifetimeStory, beatAt, BEATS, type LifetimeStory, type PlaceCard, type Metric, type Line } from '../src/lib/lifetimeWrapped';
import { createLifetimePlayer, TRACK_MS, type LifetimePlayer } from '../src/lib/lifetimeAudio';
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

// ── the nine scenes ──────────────────────────────────────────────────────────
function Scene({ story, kind, progress, reduce, accent }: { story: LifetimeStory; kind: string; progress: number; reduce: boolean; accent: string }) {
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
    case 'scale': {
      const stage = Math.min(Math.floor(progress * story.scale.length * 1.05), story.scale.length - 1);
      const m = story.scale[Math.max(0, stage)] ?? story.scale[0];
      const localStart = stage / story.scale.length;
      return (
        <>
          <LinearGradient colors={GRADIENTS.story as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
          {wrap({}, <>
            <Text style={T.eyebrow}>THE SCALE OF YOUR STORY</Text>
            {m ? (
              <View style={{ alignItems: 'center', marginTop: 6 }}>
                <Text style={T.giant}>{upTo(m.value, progress, localStart, 1 / story.scale.length)}</Text>
                <Text style={T.label}>{m.label}</Text>
                {m.sub ? <Text style={[T.sub, { marginTop: 8 }]} numberOfLines={2}>{m.sub}</Text> : null}
              </View>
            ) : null}
            {story.flagCodes.length > 0 ? (
              <Text numberOfLines={2} style={{ textAlign: 'center', fontSize: 22, marginTop: 18, maxWidth: 320, opacity: easeOut(progress) }}>
                {story.flagCodes.slice(0, 16).map((c) => flagEmoji(c)).join(' ')}
              </Text>
            ) : null}
          </>)}
        </>
      );
    }
    case 'explored':
      return (
        <>
          <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} />
          <Scrim />
          {wrap(a, <>
            <Text style={T.eyebrow}>HOW YOU EXPLORED</Text>
            {story.explored.map((l, i) => (
              <View key={i} style={{ alignItems: 'center', marginTop: i === 0 ? 10 : 18, opacity: easeOut((progress - (i ? 0.4 : 0.05)) / 0.4) }}>
                <Text style={[T.label, { fontSize: i === 0 ? 40 : 26 }]}>{l.headline}</Text>
                {l.sub ? <Text style={[T.sub, { marginTop: 4 }]}>{l.sub}</Text> : null}
              </View>
            ))}
          </>)}
        </>
      );
    case 'places': {
      const p: PlaceCard | undefined = story.places[Math.min(Math.floor(progress * Math.max(1, story.places.length)), story.places.length - 1)];
      return (
        <>
          {p ? <PhotoLayer photo={p.photo} kenBurns={progress} reduce={reduce} /> : <LinearGradient colors={gradientFor('WW')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
          <Scrim strong />
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
      return (
        <>
          <LinearGradient colors={['#1B1030', '#3A1E5E', accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <BackdropRotate codes={story.backdropCodes} progress={progress} reduce={reduce} dim />
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
    case 'peak':
      return (
        <>
          <LinearGradient colors={[accent, '#7A2E8A', '#141026']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          {!reduce ? <Confetti progress={progress} /> : null}
          {wrap({ justifyContent: 'center' }, <>
            <View style={{ alignItems: 'center', opacity: easeOut(progress / 0.3) }}>
              <Trophy size={30} color="#FFD36E" />
              <Text style={[T.eyebrow, { marginTop: 8 }]}>EXPLORER LEVEL {story.level.level}</Text>
              <Text style={[T.title, { marginTop: 4 }]}>{story.level.title}</Text>
              <Text style={[T.sub, { marginTop: 4 }]}>{upTo(story.level.xp, progress, 0.1, 0.5).toLocaleString()} XP earned</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 20, maxWidth: 320 }}>
              {story.badges.map((b, i) => (
                <View key={i} style={{ opacity: easeOut((progress - 0.3 - i * 0.06) / 0.3) }}>
                  <LinearGradient colors={b.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
                    <Text style={{ fontSize: 15 }}>{b.emoji}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#fff' }}>{b.title}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
            {story.coversUnlocked > 0 ? (
              <Text style={[T.sub, { marginTop: 16, opacity: easeOut((progress - 0.6) / 0.3) }]}>
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
          <LinearGradient colors={['rgba(10,12,22,0.4)', 'rgba(10,12,22,0.85)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
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

/** A slow cross-fading rotation of stock destination backdrops for stat scenes. */
function BackdropRotate({ codes, progress, reduce, dim }: { codes: string[]; progress: number; reduce?: boolean; dim?: boolean }) {
  const i = Math.min(Math.floor(progress * codes.length), codes.length - 1);
  const code = codes[Math.max(0, i)] ?? 'WW';
  return (
    <>
      <PhotoLayer photo={{ kind: 'stock', code }} kenBurns={reduce ? 0 : progress} reduce={reduce} />
      <LinearGradient colors={dim ? ['rgba(14,14,30,0.72)', 'rgba(14,14,30,0.82)'] : ['rgba(10,12,22,0.3)', 'rgba(10,12,22,0.55)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </>
  );
}

/** Lightweight non-physics confetti for the peak (Reduce-Motion callers skip it). */
function Confetti({ progress }: { progress: number }) {
  const COLORS_C = ['#FF6B9A', '#9B7CFF', '#24D1C3', '#FFB84D', '#4DA6FF', '#FFD23F'];
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    x: (i * 97) % width, delay: (i % 10) / 10, sway: ((i * 53) % 40) - 20, color: COLORS_C[i % COLORS_C.length], size: 6 + (i % 4) * 2,
  })), [width]);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {pieces.map((p, i) => {
        const t = Math.max(0, Math.min((progress - p.delay * 0.3) / 0.7, 1));
        return <View key={i} style={{ position: 'absolute', left: p.x + p.sway * t, top: -20 + t * (height + 40), width: p.size, height: p.size * 1.6, borderRadius: 2, backgroundColor: p.color, opacity: 1 - t * 0.3, transform: [{ rotate: `${t * 360}deg` }] }} />;
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

  const active = beatAt(tMs);
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
    // Preload the opening backdrops so playback begins on ready assets.
    try {
      const codes = [story.backdropCodes[0], story.backdropCodes[1]].filter(Boolean);
      await Promise.race([
        Promise.all(codes.map((c) => destinationImage(c).photo).filter(Boolean).map((u) => Image.prefetch(u as string))),
        new Promise((r) => setTimeout(r, 1400)),
      ]);
    } catch {}
    player.current = createLifetimePlayer(muted);
    base.current = 0;
    anchor.current = Date.now();
    lastFrame.current = 0;
    player.current.play();
    setPhase('playing');
    setTMs(0);
    raf.current = requestAnimationFrame(tick);
    scheduleHideControls();
    track('lifetime_wrapped_played', { audio: player.current.available });
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
            <Scene story={story} kind={active.beat.kind} progress={active.progress} reduce={reduce} accent={accent} />
          </View>

          {/* wave-masked bottom edge — Worldly signature */}
          <Svg width="100%" height={40} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill="rgba(10,12,22,0.55)" />
          </Svg>

          {/* progress bar (beat ticks) */}
          <View style={{ position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', gap: 4, opacity: controlsShown ? 1 : 0.25 }}>
            {BEATS.map((b, i) => {
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
    case 'scale': return s.scale.map((m) => `${m.value} ${m.label}`).join(', ');
    case 'explored': return s.explored.map((l) => l.headline).join('. ');
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
