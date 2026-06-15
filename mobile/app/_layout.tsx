import '../global.css';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../src/store/auth';
import { DataProvider } from '../src/store/data';
import { CelebrationProvider } from '../src/store/celebration';
import { OnboardingProvider, useOnboarding } from '../src/store/onboarding';
import { Onboarding } from '../components/Onboarding';
import { AchievementWatcher } from '../components/AchievementWatcher';
import { GlobalTabBar } from '../components/GlobalTabBar';
import { ActionMenu, type ActionKind } from '../components/ActionMenu';
import { AddPlaceSheet } from '../components/AddPlaceSheet';
import { AddDiscoverySheet } from '../components/AddDiscoverySheet';
import { AddTripSheet } from '../components/AddTripSheet';
import { AddPhotoSheet } from '../components/AddPhotoSheet';
import { AddTripPlanSheet } from '../components/AddTripPlanSheet';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces: Fraunces_600SemiBold,
    PlusJakarta: PlusJakartaSans_500Medium,
    'PlusJakarta-Bold': PlusJakartaSans_700Bold,
  });

  return (
    <OnboardingProvider>
      <AuthProvider>
        <DataProvider>
          <CelebrationProvider>
            <RootContent fontsLoaded={loaded} />
          </CelebrationProvider>
        </DataProvider>
      </AuthProvider>
    </OnboardingProvider>
  );
}

function RootContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { ready, visible, finish } = useOnboarding();
  const appReady = fontsLoaded && ready;
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<ActionKind | null>(null);

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="country/[code]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="trip/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="friends" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="import" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="almanac" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="wrapped" options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
      </Stack>

      <AchievementWatcher />

      {/* Global, always-visible navigation bar + its action menu / sheets. */}
      <GlobalTabBar onFab={() => setMenuOpen(true)} />
      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPick={(kind) => {
          setMenuOpen(false);
          setSheet(kind);
        }}
      />
      <AddPlaceSheet visible={sheet === 'place'} onClose={() => setSheet(null)} />
      <AddDiscoverySheet visible={sheet === 'discovery'} onClose={() => setSheet(null)} />
      <AddTripSheet visible={sheet === 'journey'} onClose={() => setSheet(null)} />
      <AddPhotoSheet visible={sheet === 'photo'} onClose={() => setSheet(null)} />
      <AddTripPlanSheet visible={sheet === 'trip'} onClose={() => setSheet(null)} />

      {visible ? <Onboarding onDone={finish} /> : null}
    </View>
  );
}
