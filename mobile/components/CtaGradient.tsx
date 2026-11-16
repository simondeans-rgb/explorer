import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_GRADIENT } from '../src/lib/theme';

/** The signature gradient as a background layer for a primary button. Drop it
 *  in as the FIRST child of a Pressable that has `overflow: 'hidden'` — the
 *  button keeps its own layout, padding and radius, and its content sits on
 *  top. One primary-action look across the app. */
export function CtaGradient() {
  return <LinearGradient pointerEvents="none" colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />;
}
