import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { hImpact } from '../src/lib/haptics';

/** The coral floating action button shared across screens that can add an item. */
export function Fab({ onPress, bottom = 28, icon, label = 'Add' }: { onPress: () => void; bottom?: number; icon?: ReactNode; label?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      onPressIn={() => spring(0.9)}
      onPressOut={() => spring(1)}
      onPress={() => { hImpact('light'); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="absolute items-center justify-center rounded-full"
      style={{
        right: 20,
        bottom,
        height: 60,
        width: 60,
        backgroundColor: COLORS.coral,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {icon ?? <Plus size={28} color="#fff" strokeWidth={2.6} />}
      </Animated.View>
    </Pressable>
  );
}
