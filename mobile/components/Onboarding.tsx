import { useRef, useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import { DownloadCloud, Images, MapPin, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { track } from '../src/lib/analytics';

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

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [showStart, setShowStart] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const last = SLIDES.length - 1;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  }
  function next() {
    if (index >= last) return setShowStart(true);
    scroller.current?.scrollTo({ x: (index + 1) * width, animated: true });
  }

  // Final step: funnel new users straight into filling their map, so they never
  // land on an empty app. Routing to /import surfaces every source (flights,
  // Polarsteps, Google Maps, photos…) in one place.
  function go(route?: string) {
    track('onboarding_completed', { quickstart: route ?? 'skip' });
    onDone();
    if (route) router.push(route);
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
            <View style={{ height: '56%' }}>
              <Image source={s.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
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
            <View key={i} style={{ height: 7, borderRadius: 4, width: i === index ? 22 : 7, backgroundColor: i === index ? COLORS.coral : 'rgba(20,33,61,0.18)' }} />
          ))}
        </View>
        <Pressable onPress={next} className="rounded-2xl items-center justify-center" style={{ paddingVertical: 16, backgroundColor: COLORS.coral }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: '#fff' }}>
            {index >= last ? 'Get started' : 'Next'}
          </Text>
        </Pressable>
        <Pressable onPress={onDone} hitSlop={8} style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>
            {index >= last ? ' ' : 'Skip'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** The last onboarding step: three one-tap ways to fill the map immediately, so
 *  a new user's first screen is never empty. Each dismisses onboarding and
 *  routes to the matching flow. */
function QuickStart({ onPick }: { onPick: (route?: string) => void }) {
  const options: { icon: typeof DownloadCloud; title: string; body: string; route: string }[] = [
    { icon: DownloadCloud, title: 'Import your travels', body: 'From flights, Polarsteps, Google Maps, TripIt & more.', route: '/import' },
    { icon: Images, title: 'Scan your photos', body: 'Find the countries you’ve been to automatically.', route: '/import' },
    { icon: MapPin, title: 'Add a place', body: 'Tell us somewhere you’ve been to get going.', route: '/search' },
  ];
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.warmwhite }}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 96, justifyContent: 'flex-start' }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 32, color: COLORS.navy, lineHeight: 37 }}>Let’s fill your map</Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink2, marginTop: 12, lineHeight: 24 }}>
          Bring your history in and watch the world light up. Pick a quick start — you can always add more later.
        </Text>

        <View style={{ marginTop: 28, gap: 12 }}>
          {options.map((o) => (
            <Pressable
              key={o.title}
              onPress={() => onPick(o.route)}
              className="bg-white dark:bg-card rounded-3xl flex-row items-center"
              style={{ padding: 16, gap: 14, shadowColor: '#14213d', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }}
            >
              <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: COLORS.warmwhite }}>
                <o.icon size={22} color={COLORS.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: COLORS.navy }}>{o.title}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 3, lineHeight: 18 }}>{o.body}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.ink3} />
            </Pressable>
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
