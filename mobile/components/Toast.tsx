import { Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Check, TriangleAlert, Info } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

export interface ToastItem {
  id: number;
  kind: 'success' | 'error' | 'info';
  message: string;
}

const META: Record<ToastItem['kind'], { Icon: typeof Check; color: string }> = {
  success: { Icon: Check, color: COLORS.aqua },
  error: { Icon: TriangleAlert, color: '#FF8DA0' },
  info: { Icon: Info, color: '#fff' },
};

/** A transient pill that floats above the tab bar. Tap to dismiss. */
export function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { Icon, color } = META[item.kind];
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 108, alignItems: 'center', paddingHorizontal: 20 }}
    >
      <Pressable
        onPress={onDismiss}
        className="flex-row items-center"
        style={{ maxWidth: '100%', backgroundColor: 'rgba(20,33,61,0.97)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, gap: 10, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }}
      >
        <Icon size={18} color={color} />
        <Text style={{ flexShrink: 1, color: '#fff', fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600' }}>{item.message}</Text>
      </Pressable>
    </Animated.View>
  );
}
