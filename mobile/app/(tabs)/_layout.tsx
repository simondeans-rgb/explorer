import { Tabs } from 'expo-router';

/** The four tab screens. The visible navigation bar is rendered globally (see
 *  GlobalTabBar in the root layout) so it persists across every screen, so the
 *  Tabs' own bar is hidden here. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="atlas" />
      <Tabs.Screen name="circle" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
