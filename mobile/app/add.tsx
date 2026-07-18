import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../src/lib/theme';
import { openAddMenu } from '../src/lib/addMenu';
import { track } from '../src/lib/analytics';

/** The widget's "+" button deep-links to mobile://add, which lands here. This
 *  screen is never seen: it immediately steps aside and opens the add menu. */
export default function AddShortcut() {
  useEffect(() => {
    track('widget_add_tap');
    const t = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace('/');
      // Give the navigation a beat to settle before the menu slides up.
      setTimeout(openAddMenu, 250);
    }, 50);
    return () => clearTimeout(t);
  }, []);
  return <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }} />;
}
