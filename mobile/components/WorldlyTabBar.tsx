import { View, Text, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BookMarked, Globe2, Compass, UserRound, Plus } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS } from '../src/lib/theme';

const ICONS: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  index: BookMarked,
  atlas: Globe2,
  explore: Compass,
  you: UserRound,
};
const LABELS: Record<string, string> = {
  index: 'Story',
  atlas: 'Atlas',
  explore: 'Explore',
  you: 'You',
};

/** Floating bottom bar with a raised centre action button. Tabs sit two-and-two
 *  around the central "+", which opens the add menu rather than navigating. */
export function WorldlyTabBar({ state, navigation, onFab }: BottomTabBarProps & { onFab: () => void }) {
  // Real tab routes in declared order (index, atlas, explore, you).
  const routes = state.routes;
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  function Tab({ routeKey, name, index }: { routeKey: string; name: string; index: number }) {
    const focused = state.index === index;
    const Icon = ICONS[name] ?? BookMarked;
    const color = focused ? COLORS.coral : COLORS.ink3;
    return (
      <Pressable
        key={routeKey}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(name);
        }}
        className="items-center justify-center"
        style={{ flex: 1, paddingVertical: 6, gap: 3 }}
      >
        <Icon size={23} color={color} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color }}>{LABELS[name] ?? name}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
      <View
        className="flex-row items-center bg-white rounded-full"
        style={{ height: 66, paddingHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
      >
        {left.map((r) => (
          <Tab key={r.key} routeKey={r.key} name={r.name} index={routes.indexOf(r)} />
        ))}

        {/* Centre action button */}
        <View style={{ width: 72, alignItems: 'center' }}>
          <Pressable
            onPress={onFab}
            className="items-center justify-center rounded-full"
            style={{ height: 60, width: 60, marginTop: -26, backgroundColor: COLORS.coral, borderWidth: 4, borderColor: COLORS.warmwhite, shadowColor: COLORS.coral, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}
          >
            <Plus size={28} color="#fff" strokeWidth={2.6} />
          </Pressable>
        </View>

        {right.map((r) => (
          <Tab key={r.key} routeKey={r.key} name={r.name} index={routes.indexOf(r)} />
        ))}
      </View>
    </View>
  );
}
