import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { setPendingRoute } from '../src/lib/nav';
import Svg, { Path } from 'react-native-svg';
import Animated, { Easing, FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DownloadCloud, Images, MapPin, ChevronRight } from 'lucide-react-native';
import { BRAND_GRADIENT, COLORS, SHADOW, tint } from '../src/lib/theme';
import { track } from '../src/lib/analytics';
import { useReduceMotion, staggerDelay, DURATION } from '../src/lib/motion';
import { hSelection, hImpact } from '../src/lib/haptics';

const { width } = Dimensions.get('window');

interface Slide {
  image: number;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    image: require('../assets/images/onboarding/welcome.jpg'),
    title: 'Welcome to Worldly',
    body: 'Your travels, beautifully kept — every country, story and memory in one place.',
  },
  {
    image: require('../assets/images/onboarding/collect.jpg'),
    title: 'Collect the world',
    body: 'Mark every country you’ve touched and watch your personal map light up.',
  },
  {
    image: require('../assets/images/onboarding/keep.jpg'),
    title: 'Keep what matters',
    body: 'Save discoveries, photos and journeys — the moments worth remembering.',
  },
  {
    image: require('../assets/images/onboarding/together.jpg'),
    title: 'Travel together',
    body: 'Connect with friends by code and follow where each other has been.',
  },
];

/** A slow "Ken Burns" push-in on the visible slide's photo — the magazine-style
 *  motion the rest of the app's heroes have. Resets when the slide leaves so it
 *  replays on return; static under Reduce Motion. */
function SlidePhoto({ source, active, reduce }: { source: number; active: boolean; reduce: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (reduce) return;
    scale.value = active
      ? withTiming(1.1, { duration: 9000, easing: Easing.out(Easing.quad) })
      : withTiming(1, { duration: 400 });
  }, [active, reduce, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
    </Animated.View>
  );
}

export function Onboarding({ onDone, blockRoute = false }: { onDone: () => void; blockRoute?: boolean }) {
  const [index, setIndex] = useState(0);
  const [showStart, setShowStart] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const reduce = useReduceMotion();
  const last = SLIDES.length - 1;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) {
      hSelection(); // a light tick as each slide settles
      setIndex(i);
    }
  }
  function next() {
    hImpact('light');
    if (index >= last) return setShowStart(true);
    scroller.current?.scrollTo({ x: (index + 1) * width, animated: true });
  }

  // Final step: funnel new users straight into filling their map, so they never
  // land on an empty app. Routing to /import surfaces every source (flights,
  // Polarsteps, Google Maps, photos…) in one place.
  function go(route?: string) {
    track('onboarding_completed', { quickstart: route ?? 'skip' });
    onDone();
    // When the user still needs to sign in (or choose guest), don't deep-link
    // into an import flow now: it would render behind the sign-in wall and could
    // fire a permission prompt (e.g. Photos for "Scan") with no visible context
    // — an App Review 5.1.1 red flag. Stash the choice and let _layout replay it
    // the moment they authenticate, so the QuickStart button still honours what
    // it says instead of silently doing nothing.
    if (route) {
      if (blockRoute) setPendingRoute(route);
      else router.push(route);
    }
  }
  if (showStart) return <QuickStart onPick={go} />;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.warmwhite }}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={{ width }}>
            <View style={{ height: '56%', overflow: 'hidden' }}>
              <SlidePhoto source={s.image} active={i === index} reduce={reduce} />
              {/* gentle scrim for status-bar legibility + depth, keeps the photo vibrant */}
              <LinearGradient
                colors={['rgba(8,9,15,0.28)', 'transparent', 'rgba(8,9,15,0.12)']}
                locations={[0, 0.42, 1]}
                style={StyleSheet.absoluteFill}
              />
              <Svg width="100%" height={48} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
                <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
              </Svg>
            </View>
            {/* paddingBottom clears the absolutely-positioned footer so large
                accessibility text never runs under the dots or button. */}
            <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 24, paddingBottom: 176 }}>
              <Text maxFontSizeMultiplier={1.15} style={{ fontFamily: 'Fraunces', fontSize: 32, color: COLORS.navy, lineHeight: 36 }}>{s.title}</Text>
              <Text maxFontSizeMultiplier={1.15} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink2, marginTop: 12, lineHeight: 24 }}>{s.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer: dots + actions */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 28, paddingBottom: 44 }}>
        <View className="flex-row items-center justify-center" style={{ gap: 7, marginBottom: 22 }}>
          {SLIDES.map((_, i) => (
            <Animated.View key={i} layout={reduce ? undefined : LinearTransition.duration(220)} style={{ height: 7, borderRadius: 4, width: i === index ? 22 : 7, backgroundColor: i === index ? COLORS.coral : 'rgba(20,33,61,0.18)' }} />
          ))}
        </View>
        {/* The brand's signature gradient on the most important first-run button —
            the same treatment as the sign-in CTA that follows it. */}
        <Pressable
          onPress={next}
          accessibilityRole="button"
          accessibilityLabel={index >= last ? 'Get started' : 'Next'}
          style={({ pressed }) => [{ borderRadius: 18, transform: [{ scale: pressed && !reduce ? 0.98 : 1 }] }, SHADOW.glow(COLORS.coral)]}
        >
          <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: '#fff' }}>
              {index >= last ? 'Get started' : 'Next'}
            </Text>
          </LinearGradient>
        </Pressable>
        {/* Skip leaves entirely on the last slide (no invisible tap target); the
            fixed-height row keeps the button from jumping. */}
        <View style={{ height: 34, marginTop: 6, alignItems: 'center', justifyContent: 'center' }}>
          {index < last ? (
            <Pressable onPress={onDone} hitSlop={8} accessibilityRole="button" accessibilityLabel="Skip introduction">
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** The last onboarding step: three one-tap ways to fill the map immediately, so
 *  a new user's first screen is never empty. Each dismisses onboarding and
 *  routes to the matching flow. */
function QuickStart({ onPick }: { onPick: (route?: string) => void }) {
  const reduce = useReduceMotion();
  const options: { icon: typeof DownloadCloud; title: string; body: string; route: string }[] = [
    { icon: DownloadCloud, title: 'Import your travels', body: 'From flights, Polarsteps, Google Maps, TripIt & more.', route: '/import' },
    { icon: Images, title: 'Scan your photos', body: 'Find the countries you’ve been to automatically.', route: '/import?start=scan' },
    { icon: MapPin, title: 'Add a place', body: 'Tell us somewhere you’ve been to get going.', route: '/add' },
  ];
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.warmwhite }}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 96, justifyContent: 'flex-start' }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 32, color: COLORS.navy, lineHeight: 37 }}>Let’s fill your map</Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink2, marginTop: 12, lineHeight: 24 }}>
          Bring your history in and watch the world light up. Pick a quick start — you can always add more later.
        </Text>

        <View style={{ marginTop: 28, gap: 12 }}>
          {options.map((o, i) => (
            <Animated.View key={o.title} entering={reduce ? undefined : FadeInDown.duration(DURATION.base).delay(staggerDelay(i, 70))}>
            <Pressable
              onPress={() => {
                hImpact('light');
                onPick(o.route);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${o.title}. ${o.body}`}
              className="bg-white dark:bg-card rounded-3xl flex-row items-center"
              // Immediate press feedback — the route is deferred behind the sign-in
              // wall, so the scale confirms the tap registered right away (R25).
              // Import is the highest-value path, so it alone carries the coral
              // outline + gradient well; the other two stay quiet peers.
              style={({ pressed }) => ({ padding: 16, gap: 14, borderWidth: 1.5, borderColor: i === 0 ? tint(COLORS.coral, 0.55) : 'transparent', shadowColor: i === 0 ? COLORS.coral : '#14213D', shadowOpacity: i === 0 ? 0.16 : 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, transform: [{ scale: pressed && !reduce ? 0.97 : 1 }] })}
            >
              {i === 0 ? (
                <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 46, width: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                  <o.icon size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: tint(COLORS.coral, 0.1) }}>
                  <o.icon size={22} color={COLORS.coral} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: COLORS.navy }}>{o.title}</Text>
                  {i === 0 ? (
                    <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: tint(COLORS.coral, 0.12) }}>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.4, color: COLORS.coral }}>FASTEST</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 3, lineHeight: 18 }}>{o.body}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.ink3} />
            </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 28, paddingBottom: 44 }}>
        <Pressable onPress={() => onPick()} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.ink2 }}>I’ll explore first</Text>
        </Pressable>
      </View>
    </View>
  );
}
