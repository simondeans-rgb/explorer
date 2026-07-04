import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { KeyboardDoneBar } from './KeyboardDoneBar';

/** The shared bottom-sheet chrome for the Add-* flows: dim scrim, rounded
 *  top sheet, title + close button. Children supply the form body.
 *  The sheet rides above the keyboard (KeyboardAvoidingView on iOS; Android's
 *  window resizes itself) and shows a floating Done pill to dismiss it. */
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
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
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(20,33,61,0.10)' }}
            >
              <X size={18} color={COLORS.navy} />
            </Pressable>
          </View>
          {children}
        </View>
        <KeyboardDoneBar />
      </KeyboardAvoidingView>
    </Modal>
  );
}
