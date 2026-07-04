import { View, Text, Pressable } from 'react-native';
import { History, CalendarDays, ChevronRight } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';

/** The single "Add a trip" entry: past and future trips were two separate
 *  menu items ("Log a journey" / "Plan a trip") — the review's top navigation
 *  confusion. One question first, then the right form. */
export function TripEntryChooser({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (kind: 'journey' | 'trip') => void;
}) {
  const rows = [
    { kind: 'journey' as const, icon: History, tint: COLORS.coral, title: 'Already been', hint: 'Log a trip you’ve taken and how you travelled' },
    { kind: 'trip' as const, icon: CalendarDays, tint: '#1E6BFF', title: 'Coming up', hint: 'Plan a trip — countdown, dates and itinerary' },
  ];
  return (
    <SheetShell visible={visible} title="Add a trip" onClose={onClose}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10, gap: 10 }}>
        {rows.map((r) => (
          <Pressable
            key={r.kind}
            accessibilityRole="button"
            accessibilityLabel={`${r.title} — ${r.hint}`}
            onPress={() => onPick(r.kind)}
            className="bg-white rounded-2xl flex-row items-center"
            style={{ padding: 16, gap: 14 }}
          >
            <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: r.tint + '14' }}>
              <r.icon size={22} color={r.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: COLORS.navy }}>{r.title}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 1 }}>{r.hint}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.ink3} />
          </Pressable>
        ))}
      </View>
    </SheetShell>
  );
}
