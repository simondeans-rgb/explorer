import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

/** The coral floating action button shared across screens that can add an item. */
export function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute items-center justify-center rounded-full"
      style={{
        right: 20,
        bottom: 28,
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
      <Plus size={28} color="#fff" strokeWidth={2.6} />
    </Pressable>
  );
}
