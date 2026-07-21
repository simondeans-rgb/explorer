import { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { COLORS } from '../src/lib/theme';

/** A soft pulsing placeholder block. */
function Bar({ w, h = 16, r = 8, mt = 0 }: { w: number | string; h?: number; r?: number; mt?: number }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={{ width: w as number, height: h, borderRadius: r, marginTop: mt, backgroundColor: COLORS.card, opacity: pulse }} />;
}

/** Cold-start placeholder for a detail screen while the store hydrates — a hero
 *  band plus a few text bars — so a valid entity never flashes "not found". */
export function DetailSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }} accessibilityLabel="Loading">
      <View style={{ height: 240, backgroundColor: COLORS.card }} />
      <View style={{ padding: 20 }}>
        <Bar w={'62%'} h={26} />
        <Bar w={'40%'} h={14} mt={12} />
        <Bar w={'100%'} h={72} r={16} mt={22} />
        <Bar w={'100%'} h={72} r={16} mt={12} />
        <Bar w={'85%'} h={72} r={16} mt={12} />
      </View>
    </View>
  );
}
