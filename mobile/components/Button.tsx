import { Pressable, Text, ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType } from 'react';
import { COLORS, RADIUS, SHADOW, BRAND_GRADIENT } from '../src/lib/theme';

type Variant = 'primary' | 'gradient' | 'secondary' | 'ghost';
type IconCmp = ComponentType<{ size?: number; color?: string }>;

/** The one Worldly button. Pill shape, consistent padding, on-brand variants —
 *  so CTAs stop drifting in radius/padding/colour across screens. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  loading = false,
  disabled = false,
  full = true,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconCmp;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = variant === 'secondary' ? COLORS.navySolid : variant === 'ghost' ? COLORS.ink2 : '#fff';
  const base: ViewStyle = {
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: full ? 'stretch' : 'flex-start',
    opacity: disabled || loading ? 0.65 : 1,
  };

  const inner = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <>
      {Icon ? <Icon size={17} color={fg} /> : null}
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, fontWeight: '700', color: fg }}>{label}</Text>
    </>
  );

  if (variant === 'gradient') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[{ alignSelf: full ? 'stretch' : 'flex-start' }, SHADOW.glow(COLORS.coral), style]}>
        <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={base}>
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  const bg = variant === 'primary' ? COLORS.coral : variant === 'secondary' ? '#fff' : 'rgba(20,33,61,0.06)';
  const shadow = variant === 'primary' ? SHADOW.glow(COLORS.coral) : variant === 'secondary' ? SHADOW.card : undefined;
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[base, { backgroundColor: bg }, shadow as ViewStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{inner}</View>
    </Pressable>
  );
}
