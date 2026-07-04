import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, Text } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';

/** A floating "Done" pill that appears just above the keyboard, so there's
 *  always an obvious way to put it away — especially from multiline fields,
 *  where the return key types a newline instead of dismissing.
 *
 *  Mount it inside whichever container should float it (a screen's root view
 *  or a sheet's modal tree — modals are a separate native layer, so a single
 *  global instance can't reach them). */
export function KeyboardDoneBar() {
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    // iOS animates the frame in (willShow has the final height); Android only
    // fires didShow — and with the window resizing under adjustResize, the
    // pill just needs to sit near the bottom of the (shrunken) window.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) =>
      setKbHeight(Platform.OS === 'ios' ? e.endCoordinates.height : 1),
    );
    const hide = Keyboard.addListener(hideEvent, () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!kbHeight) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Done — hide keyboard"
      onPress={() => Keyboard.dismiss()}
      className="flex-row items-center rounded-full"
      style={{
        position: 'absolute',
        right: 14,
        bottom: (Platform.OS === 'ios' ? kbHeight : 0) + 12,
        backgroundColor: COLORS.navySolid,
        paddingHorizontal: 14,
        paddingVertical: 9,
        gap: 5,
        shadowColor: '#14213d',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        zIndex: 40,
      }}
    >
      <ChevronDown size={15} color="#fff" />
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Done</Text>
    </Pressable>
  );
}
