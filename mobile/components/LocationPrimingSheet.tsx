import { View, Text, Pressable } from 'react-native';
import { Navigation, Check } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';

/** Explains trip location tracking before the OS permission prompt (Apple
 *  expects in-context priming for background "Always" location) and discloses
 *  that trip collaborators will see the places it adds. */
export function LocationPrimingSheet({
  visible,
  onClose,
  onContinue,
  background,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  /** True in a real build (background tracking); false in Expo Go (foreground). */
  background: boolean;
}) {
  const points = [
    'Worldly adds the cities and countries you visit to your map automatically — no typing.',
    background
      ? 'It uses your location in the background, even when the app is closed. We’ll ask for “Always Allow” next.'
      : 'Open Worldly while you’re travelling and it logs where you are.',
    'Only the city and country are saved — never your precise GPS or a location trail.',
    'It stops on its own when the trip ends, and you can switch it off anytime.',
    'Anyone you’ve invited to this trip will see the places it adds.',
  ];

  return (
    <SheetShell visible={visible} title="Track this trip" onClose={onClose}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <View className="rounded-2xl items-center justify-center" style={{ height: 56, width: 56, backgroundColor: 'rgba(36,209,195,0.14)', marginBottom: 14 }}>
          <Navigation size={26} color={COLORS.aqua} />
        </View>

        <View style={{ gap: 12 }}>
          {points.map((p) => (
            <View key={p} className="flex-row" style={{ gap: 10 }}>
              <View className="rounded-full items-center justify-center" style={{ height: 20, width: 20, backgroundColor: 'rgba(36,209,195,0.16)', marginTop: 1 }}>
                <Check size={12} color={COLORS.aqua} />
              </View>
              <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2, lineHeight: 20 }}>{p}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onContinue}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginTop: 22, paddingVertical: 15, backgroundColor: COLORS.aqua, gap: 8 }}
        >
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>
            {background ? 'Continue' : 'Turn on check-ins'}
          </Text>
        </Pressable>
        <Pressable onPress={onClose} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>Not now</Text>
        </Pressable>
      </View>
    </SheetShell>
  );
}
