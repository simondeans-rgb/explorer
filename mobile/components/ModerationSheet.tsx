import { Modal, View, Text, Pressable } from 'react-native';
import { Flag, ShieldOff } from 'lucide-react-native';
import { COLORS, RADIUS, tint, MUTED_TINT } from '../src/lib/theme';
import { hSelection, hWarning } from '../src/lib/haptics';

/** Branded report/block sheet — replaces the OS `Alert.alert` for moderation so
 *  the flow matches Worldly and inherits its accessibility + haptics (R23). */
export function ModerationSheet({
  visible,
  name,
  kind = 'member',
  onClose,
  onReport,
  onBlock,
}: {
  visible: boolean;
  name: string;
  kind?: 'member' | 'photo';
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss" style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <Pressable onPress={(e) => e.stopPropagation()} accessible={false} style={{ backgroundColor: COLORS.warmwhite, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingTop: 14, paddingBottom: 36 }}>
          <View style={{ alignSelf: 'center', height: 5, width: 44, borderRadius: 3, backgroundColor: 'rgba(20,33,61,0.15)', marginBottom: 10 }} />
          <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, paddingHorizontal: 20 }}>{name}</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 2, marginBottom: 10 }}>
            {kind === 'photo'
              ? 'Flag this photo for our moderation team, or block this member.'
              : 'Report or block this member. Our team reviews reports within 24 hours.'}
          </Text>

          <Pressable accessibilityRole="button" accessibilityLabel={kind === 'photo' ? 'Report photo' : `Report ${name}`} onPress={() => { hSelection(); onReport(); }} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: tint(COLORS.sunburst, 0.18) }}>
              <Flag size={20} color="#B5731A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: COLORS.navy }}>{kind === 'photo' ? 'Report photo' : `Report ${name}`}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 1 }}>Flag it for our moderation team</Text>
            </View>
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityLabel={`Block ${name}`} onPress={() => { hWarning(); onBlock(); }} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 46, width: 46, backgroundColor: tint(COLORS.danger, 0.14) }}>
              <ShieldOff size={20} color={COLORS.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '700', color: COLORS.danger }}>Block {name}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 1 }}>Hide them and remove the connection</Text>
            </View>
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityLabel="Cancel" onPress={onClose} className="items-center rounded-full" style={{ marginHorizontal: 20, marginTop: 8, paddingVertical: 13, backgroundColor: MUTED_TINT }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
