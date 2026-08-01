import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { tint, RADIUS } from '../src/lib/theme';

/** The recurring "glyph in a soft tinted tile" chip (settings rows, atlas cards,
 *  verdict badges, achievement chips…). Centralises the icon-tile pattern so its
 *  tint and radius stop being re-derived by hand per screen (R2) — the root cause
 *  of the opacity drift across the codebase. Pass a SOLID hex `accent`. */
export function TintChip({
  accent,
  size = 40,
  alpha = 0.14,
  round = false,
  style,
  children,
}: {
  accent: string;
  size?: number;
  alpha?: number;
  round?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View
      style={[
        {
          height: size,
          width: size,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tint(accent, alpha),
          borderRadius: round ? size / 2 : RADIUS.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
