import { Modal, View, Text, Pressable } from 'react-native';
import { MapPin, Plane, Camera, CalendarDays } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS } from '../src/lib/theme';

export type ActionKind = 'place' | 'journey' | 'photo' | 'trip';

const OPTIONS: { kind: ActionKind; label: string; hint: string; icon: ComponentType<{ size?: number; color?: string }> }[] = [
  { kind: 'place', label: 'Add a place', hint: 'A country or city you’ve been to', icon: MapPin },
  { kind: 'journey', label: 'Log a journey', hint: 'A trip and how you travelled', icon: Plane },
  { kind: 'photo', label: 'Add a photo', hint: 'A memory from your travels', icon: Camera },
  { kind: 'trip', label: 'Plan a trip', hint: 'Somewhere you’re dreaming of', icon: CalendarDays },
];

/** The action sheet the centre nav button opens. */
export function ActionMenu({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (kind: ActionKind) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: COLORS.warmwhite, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 14, paddingBottom: 36 }}>
          <View style={{ alignSelf: 'center', height: 5, width: 44, borderRadius: 3, backgroundColor: 'rgba(20,33,61,0.15)', marginBottom: 10 }} />
          <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, paddingHorizontal: 20, marginBottom: 10 }}>Add to your world</Text>
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <Pressable key={o.kind} onPress={() => onPick(o.kind)} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
                <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: '#fff' }}>
                  <Icon size={20} color={COLORS.coral} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: COLORS.navy }}>{o.label}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 1 }}>{o.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
