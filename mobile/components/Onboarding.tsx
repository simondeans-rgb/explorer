import { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Globe2, Camera, Users } from 'lucide-react-native';
import { WorldlyIcon } from './WorldlyLogo';
import { COLORS, GRADIENTS, type Gradient } from '../src/lib/theme';

const { width } = Dimensions.get('window');

interface Slide {
  gradient: Gradient;
  icon: 'mark' | 'globe' | 'camera' | 'users';
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    gradient: GRADIENTS.sunrise,
    icon: 'mark',
    title: 'Welcome to Worldly',
    body: 'Your travels, beautifully kept — every country, story and memory in one place.',
  },
  {
    gradient: GRADIENTS.atlas,
    icon: 'globe',
    title: 'Collect the world',
    body: 'Mark every country you’ve touched and watch your personal map light up.',
  },
  {
    gradient: GRADIENTS.explore,
    icon: 'camera',
    title: 'Keep what matters',
    body: 'Save discoveries, photos and journeys — the moments worth remembering.',
  },
  {
    gradient: GRADIENTS.story,
    icon: 'users',
    title: 'Travel together',
    body: 'Connect with friends by code and follow where each other has been.',
  },
];

function SlideIcon({ kind }: { kind: Slide['icon'] }) {
  if (kind === 'mark')
    return (
      <View
        className="rounded-3xl items-center justify-center bg-white"
        style={{ paddingHorizontal: 26, paddingVertical: 30 }}
      >
        <WorldlyIcon height={88} />
      </View>
    );
  const Icon = kind === 'globe' ? Globe2 : kind === 'camera' ? Camera : Users;
  return (
    <View className="rounded-full items-center justify-center bg-white/20" style={{ height: 120, width: 120 }}>
      <Icon size={52} color="#fff" />
    </View>
  );
}

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
            <LinearGradient colors={s.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: '64%', paddingHorizontal: 28, justifyContent: 'flex-end', paddingBottom: 56 }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <SlideIcon kind={s.icon} />
              </View>
              <Svg width="100%" height={48} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
                <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
              </Svg>
            </LinearGradient>
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
