import { Modal, View, Text, Pressable } from 'react-native';
import { MapPin, Plane, Camera, Gem } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS } from '../src/lib/theme';

export type ActionKind = 'quicklog' | 'place' | 'discovery' | 'journey' | 'photo' | 'trip' | 'tripentry';

// Kept tight on purpose: the full discovery editor isn't a separate menu item —
// it's reached from Quick Log ("Add full details") and from country pages —
// and past + future trips share one "Add a trip" entry with a chooser.
const OPTIONS: { kind: ActionKind; label: string; hint: string; icon: ComponentType<{ size?: number; color?: string }> }[] = [
  { kind: 'place', label: 'Add a place', hint: 'A country or city you’ve been to', icon: MapPin },
  { kind: 'tripentry', label: 'Add a trip', hint: 'One you’ve taken, or one coming up', icon: Plane },
  { kind: 'photo', label: 'Add a photo', hint: 'A memory from your travels', icon: Camera },
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

          {/* Quick Log — the hero: rate a place in seconds. */}
          <Pressable accessibilityRole="button" accessibilityLabel="Leave a verdict — rate a place in seconds" onPress={() => onPick('quicklog')} className="flex-row items-center" style={{ marginHorizontal: 20, marginBottom: 6, borderRadius: 22, gap: 14, paddingHorizontal: 16, paddingVertical: 15, backgroundColor: COLORS.coral }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: 'rgba(255,255,255,0.22)' }}>
              <Gem size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: '#fff' }}>Leave a verdict</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 1 }}>Rate a place in seconds</Text>
            </View>
          </Pressable>

          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <Pressable key={o.kind} accessibilityRole="button" accessibilityLabel={`${o.label} — ${o.hint}`} onPress={() => onPick(o.kind)} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
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
