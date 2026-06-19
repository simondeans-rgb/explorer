import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { BookMarked, Globe2, Compass, UserRound, Users, Plus } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS } from '../src/lib/theme';

type TabDef = { path: string; label: string; icon: ComponentType<{ size?: number; color?: string }> };

const TABS: TabDef[] = [
  { path: '/', label: 'Story', icon: BookMarked },
  { path: '/atlas', label: 'Atlas', icon: Globe2 },
  { path: '/circle', label: 'Circle', icon: Users },
  { path: '/explore', label: 'Explore', icon: Compass },
  { path: '/you', label: 'You', icon: UserRound },
];

// Screens where the bar should step aside (immersive / modal).
const HIDDEN = new Set(['/wrapped', '/search']);

/** A floating, frosted-glass navigation bar rendered globally so it stays fixed
 *  and visible on every screen, with the action button floated to the bottom
 *  right within easy thumb reach. */
export function GlobalTabBar({ onFab }: { onFab: () => void }) {
  const pathname = usePathname();
  if (HIDDEN.has(pathname)) return null;

  function Tab({ def }: { def: TabDef }) {
    const active = pathname === def.path;
    const Icon = def.icon;
    const color = active ? COLORS.coral : COLORS.ink2;
    return (
      <Pressable
        onPress={() => {
          if (active) return;
          // Pop any pushed screen (country/import/etc.) before switching tab.
          if (router.canDismiss()) router.dismissAll();
          router.navigate(def.path as never);
        }}
        className="items-center justify-center"
        style={{ flex: 1, paddingVertical: 6, gap: 3 }}
      >
        <Icon size={22} color={color} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color }}>{def.label}</Text>
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
        <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.34)' }]} />
        {/* glassy top sheen */}
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 26 }}
        />
        <View className="flex-row items-center" style={{ height: 66, paddingHorizontal: 6 }}>
          {TABS.map((d) => (
            <Tab key={d.path} def={d} />
          ))}
        </View>
      </View>

      {/* Action button — floated to the bottom right, raised above the bar. */}
      <Pressable
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
