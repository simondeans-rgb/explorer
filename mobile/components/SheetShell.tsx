import type { ReactNode } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

/** The shared bottom-sheet chrome for the Add-* flows: dim scrim, rounded
 *  top sheet, title + close button. Children supply the form body. */
export function SheetShell({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View
          style={{
            backgroundColor: COLORS.warmwhite,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '90%',
            paddingBottom: 28,
          }}
        >
          <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <X size={18} color={COLORS.ink2} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
