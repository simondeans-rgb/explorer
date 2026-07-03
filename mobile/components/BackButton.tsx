import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { SHADOW } from '../src/lib/theme';

/** A consistently legible back button: a frosted dark disc with a hairline and
 *  soft shadow, so the white chevron reads clearly over any hero photo. */
export function BackButton({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={12}
      className="h-10 w-10 rounded-full items-center justify-center"
      style={[{ backgroundColor: 'rgba(20,33,61,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', ...SHADOW.card }, style]}
    >
      <ChevronLeft size={21} color="#fff" />
    </Pressable>
  );
}
