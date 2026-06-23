import { Modal, View, Text, Pressable } from 'react-native';
import { COLORS, SHADOW } from '../src/lib/theme';

/** A branded confirm/destructive dialog — replaces the OS `Alert.alert` so
 *  confirmations match Worldly (Fraunces title, coral / danger CTA, soft card). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: 'rgba(14,16,24,0.5)', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360 }}>
          <View className="bg-white" style={{ borderRadius: 28, padding: 22, ...SHADOW.float }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy }}>{title}</Text>
            {message ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2, marginTop: 8, lineHeight: 20 }}>{message}</Text>
            ) : null}
            <View className="flex-row" style={{ gap: 10, marginTop: 22 }}>
              <Pressable onPress={onCancel} className="flex-1 items-center justify-center rounded-full" style={{ paddingVertical: 13, backgroundColor: 'rgba(20,33,61,0.06)' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>{cancelLabel}</Text>
              </Pressable>
              <Pressable onPress={onConfirm} className="flex-1 items-center justify-center rounded-full" style={{ paddingVertical: 13, backgroundColor: destructive ? COLORS.danger : COLORS.coral }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
