import { useState } from 'react';
import { Tabs } from 'expo-router';
import { WorldlyTabBar } from '../../components/WorldlyTabBar';
import { ActionMenu, type ActionKind } from '../../components/ActionMenu';
import { AddPlaceSheet } from '../../components/AddPlaceSheet';
import { AddTripSheet } from '../../components/AddTripSheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { AddTripPlanSheet } from '../../components/AddTripPlanSheet';

export default function TabsLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<ActionKind | null>(null);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <WorldlyTabBar {...props} onFab={() => setMenuOpen(true)} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="atlas" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="you" />
      </Tabs>

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPick={(kind) => {
          setMenuOpen(false);
          setSheet(kind);
        }}
      />
      <AddPlaceSheet visible={sheet === 'place'} onClose={() => setSheet(null)} />
      <AddTripSheet visible={sheet === 'journey'} onClose={() => setSheet(null)} />
      <AddPhotoSheet visible={sheet === 'photo'} onClose={() => setSheet(null)} />
      <AddTripPlanSheet visible={sheet === 'trip'} onClose={() => setSheet(null)} />
    </>
  );
}
