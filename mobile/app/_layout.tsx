import '../global.css';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../src/store/auth';
import { DataProvider } from '../src/store/data';
import { ToastProvider } from '../src/store/toast';
import { CelebrationProvider } from '../src/store/celebration';
import { OnboardingProvider, useOnboarding } from '../src/store/onboarding';
import { Onboarding } from '../components/Onboarding';
import { AchievementWatcher } from '../components/AchievementWatcher';
import { LocationSync } from '../components/LocationSync';
import { NotificationScheduler } from '../components/NotificationScheduler';
import { GlobalTabBar } from '../components/GlobalTabBar';
import { ActionMenu, type ActionKind } from '../components/ActionMenu';
import { AddPlaceSheet } from '../components/AddPlaceSheet';
import { AddDiscoverySheet } from '../components/AddDiscoverySheet';
import { AddTripSheet } from '../components/AddTripSheet';
import { AddPhotoSheet } from '../components/AddPhotoSheet';
import { AddTripPlanSheet } from '../components/AddTripPlanSheet';
import { AuthGate } from '../components/AuthGate';
import { initSentry, wrapWithSentry } from '../src/lib/sentry';

SplashScreen.preventAutoHideAsync();
initSentry();

function RootLayout() {
  const [loaded] = useFonts({
    Fraunces: Fraunces_600SemiBold,
    PlusJakarta: PlusJakartaSans_500Medium,
    'PlusJakarta-Bold': PlusJakartaSans_700Bold,
    Caveat: Caveat_600SemiBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingProvider>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <CelebrationProvider>
                <RootContent fontsLoaded={loaded} />
              </CelebrationProvider>
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}

export default wrapWithSentry(RootLayout);

function RootContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { ready, visible, finish } = useOnboarding();
  const { configured, user, loading: authLoading } = useAuth();
  // Wait for the persisted session to resolve so the sign-in gate never flashes
  // over an already-signed-in user.
  const appReady = fontsLoaded && ready && !authLoading;
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheet, setSheet] = useState<ActionKind | null>(null);
  // Lets people explore on-device (offline) without signing in. Session-scoped:
  // the welcome screen returns on the next cold start until they sign in.
  const [guest, setGuest] = useState(false);
  const needsAuth = configured && !user && !guest;

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
        <Stack.Screen name="discovery/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="friends" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="import" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="almanac" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="search" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="wrapped" options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
      </Stack>

      <AchievementWatcher />
      <LocationSync />
      <NotificationScheduler />

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

      {/* Sign-in gate sits above the app; onboarding (first run) sits above that. */}
      {needsAuth ? <AuthGate onContinueWithout={() => setGuest(true)} /> : null}
      {visible ? <Onboarding onDone={finish} /> : null}
    </View>
  );
}
