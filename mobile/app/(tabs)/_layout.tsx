import { Tabs } from 'expo-router';
import { BookMarked, Compass, Globe2, UserRound } from 'lucide-react-native';
import { COLORS } from '../../src/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.coral,
        tabBarInactiveTintColor: COLORS.ink3,
        tabBarStyle: { borderTopWidth: 0, height: 84, paddingTop: 8, paddingBottom: 24 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Story', tabBarIcon: ({ color, size }) => <BookMarked color={color} size={size} /> }} />
      <Tabs.Screen name="atlas" options={{ title: 'Atlas', tabBarIcon: ({ color, size }) => <Globe2 color={color} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
