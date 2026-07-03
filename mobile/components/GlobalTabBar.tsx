import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, type ComponentType } from 'react';
import { COLORS, SECTION } from '../src/lib/theme';
import { track } from '../src/lib/analytics';

const ICONS = {
  story: require('../assets/images/nav/story.png') as ImageSource,
  atlas: require('../assets/images/nav/atlas.png') as ImageSource,
  circle: require('../assets/images/nav/circle.png') as ImageSource,
  discovery: require('../assets/images/nav/discovery.png') as ImageSource,
  passport: require('../assets/images/nav/passport.png') as ImageSource,
};

type TabDef = { path: string; label: string; icon: ImageSource; accent: string };

// Use Apple's native Liquid Glass material on iOS 26+ real builds; otherwise
// (Expo Go, older iOS, Android) fall back to the frosted blur below. Loaded
// defensively so the absence of the native module never breaks the app.
type GlassProps = { style?: StyleProp<ViewStyle>; glassEffectStyle?: 'regular' | 'clear' };
let GlassView: ComponentType<GlassProps> | null = null;
let liquidGlass = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- guarded: native module may be absent in Expo Go
  const g = require('expo-glass-effect');
  liquidGlass = typeof g.isLiquidGlassAvailable === 'function' && g.isLiquidGlassAvailable();
  if (liquidGlass) GlassView = g.GlassView as ComponentType<GlassProps>;
} catch {
  liquidGlass = false;
}

// Adjusted brand palette (Coral, Aqua, Sunburst, Lavender, Sky) — the icons are
// tinted to these exact colours so the nav matches the design system, and each
// matches its section's hero wave line.
const TABS: TabDef[] = [
  { path: '/', label: 'Story', icon: ICONS.story, accent: SECTION.story },
  { path: '/atlas', label: 'Atlas', icon: ICONS.atlas, accent: SECTION.atlas },
  { path: '/circle', label: 'Circle', icon: ICONS.circle, accent: SECTION.circle },
  { path: '/explore', label: 'Discover', icon: ICONS.discovery, accent: SECTION.discover },
  { path: '/you', label: 'Passport', icon: ICONS.passport, accent: SECTION.passport },
];

// Screens where the bar should step aside (immersive / modal).
const HIDDEN = new Set(['/wrapped', '/search']);

/** A floating, frosted-glass navigation bar rendered globally so it stays fixed
 *  and visible on every screen, with the action button floated to the bottom
 *  right within easy thumb reach. */
export function GlobalTabBar({ onFab }: { onFab: () => void }) {
  const pathname = usePathname();

  // This bar renders on every screen, so it's the one cheap place to observe
  // navigation for analytics without touching each route.
  useEffect(() => {
    track('screen_viewed', { path: pathname });
  }, [pathname]);

  if (HIDDEN.has(pathname)) return null;

  function Tab({ def }: { def: TabDef }) {
    const active = pathname === def.path;
    return (
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={def.label}
        accessibilityState={{ selected: active }}
        onPress={() => {
          if (active) return;
          // Pop any pushed screen (country/import/etc.) before switching tab.
          if (router.canDismiss()) router.dismissAll();
          router.navigate(def.path as never);
        }}
        className="items-center justify-center"
        style={{ flex: 1 }}
      >
        {/* Icons always full-colour (tinted to their palette hue); the active
            tab is marked by a soft coloured pill behind it. */}
        <View
          className="items-center justify-center"
          style={{ gap: 3, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 18, backgroundColor: active ? def.accent + '26' : 'transparent' }}
        >
          <Image source={def.icon} style={{ width: 32, height: 32 }} contentFit="contain" tintColor={def.accent} />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: def.accent }}>{def.label}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
      {/* Frosted-glass pill */}
      <View
        style={{
          height: 66,
          borderRadius: 33,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.7)',
          shadowColor: '#0E1018',
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        }}
      >
        {liquidGlass && GlassView ? (
          <GlassView style={[StyleSheet.absoluteFill, { borderRadius: 33 }]} glassEffectStyle="regular" />
        ) : (
          <>
            {/* Liquid-glass fallback: a strong translucent frost so the content
                behind reads through, with a specular sheen top and bottom. */}
            <BlurView intensity={94} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.22)' }]} />
            <LinearGradient
              colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30 }}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 22 }}
            />
          </>
        )}
        <View className="flex-row items-center" style={{ height: 66, paddingHorizontal: 6 }}>
          {TABS.map((d) => (
            <Tab key={d.path} def={d} />
          ))}
        </View>
      </View>

      {/* Action button — floated to the bottom right, raised above the bar. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add to your world"
        onPress={onFab}
        className="items-center justify-center rounded-full"
        style={{
          position: 'absolute',
          right: 2,
          bottom: 80,
          height: 58,
          width: 58,
          backgroundColor: COLORS.coral,
          borderWidth: 4,
          borderColor: 'rgba(255,255,255,0.85)',
          shadowColor: COLORS.coral,
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
      >
        <Plus size={28} color="#fff" strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}
