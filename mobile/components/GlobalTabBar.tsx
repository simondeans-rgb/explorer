import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import { BookMarked, Globe2, Compass, UserRound, Users, Plus } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS } from '../src/lib/theme';

type TabDef = { path: string; label: string; icon: ComponentType<{ size?: number; color?: string }> };

const LEFT: TabDef[] = [
  { path: '/', label: 'Story', icon: BookMarked },
  { path: '/atlas', label: 'Atlas', icon: Globe2 },
  { path: '/circle', label: 'Circle', icon: Users },
];
const RIGHT: TabDef[] = [
  { path: '/explore', label: 'Explore', icon: Compass },
  { path: '/you', label: 'You', icon: UserRound },
];

// Screens where the bar should step aside (immersive / modal).
const HIDDEN = new Set(['/wrapped', '/search']);

/** A floating, frosted-glass navigation bar rendered globally so it stays fixed
 *  and visible on every screen, with a raised centre action button. */
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
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '700', color }}>{def.label}</Text>
      </Pressable>
    );
  }

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
      <View
        style={{
          height: 66,
          borderRadius: 33,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.6)',
          shadowColor: '#0E1018',
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        }}
      >
        <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.42)' }]} />
        <View className="flex-row items-center" style={{ height: 66, paddingHorizontal: 6 }}>
          <View className="flex-row" style={{ flex: 1 }}>
            {LEFT.map((d) => (
              <Tab key={d.path} def={d} />
            ))}
          </View>
          <View style={{ width: 72 }} />
          <View className="flex-row" style={{ flex: 1 }}>
            {RIGHT.map((d) => (
              <Tab key={d.path} def={d} />
            ))}
          </View>
        </View>
      </View>

      {/* Raised centre action button (sibling so it isn't clipped by the glass). */}
      <Pressable
        onPress={onFab}
        className="items-center justify-center rounded-full"
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: -20,
          height: 60,
          width: 60,
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
