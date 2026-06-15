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
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';

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
  const scroller = useRef<ScrollView>(null);
  const last = SLIDES.length - 1;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  }
  function next() {
    if (index >= last) return onDone();
    scroller.current?.scrollTo({ x: (index + 1) * width, animated: true });
  }

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
            <View style={{ height: '64%' }}>
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
            <View style={{ paddingHorizontal: 32, paddingTop: 28 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 32, color: COLORS.navy, lineHeight: 36 }}>{s.title}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink2, marginTop: 12, lineHeight: 24 }}>{s.body}</Text>
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
