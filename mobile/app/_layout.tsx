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
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import { AuthProvider } from '../src/store/auth';
import { DataProvider } from '../src/store/data';
import { Onboarding } from '../components/Onboarding';

SplashScreen.preventAutoHideAsync();

const ONBOARD_KEY = 'worldly:onboarded:v1';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces: Fraunces_600SemiBold,
    PlusJakarta: PlusJakartaSans_500Medium,
    'PlusJakarta-Bold': PlusJakartaSans_700Bold,
  });
  // null = still reading the flag; true/false once known.
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARD_KEY)
      .then((v) => setOnboarded(v === '1'))
      .catch(() => setOnboarded(true));
  }, []);

  const ready = loaded && onboarded !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  function finishOnboarding() {
    setOnboarded(true);
    AsyncStorage.setItem(ONBOARD_KEY, '1').catch(() => {});
  }

  return (
    <AuthProvider>
      <DataProvider>
        <View style={{ flex: 1 }}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="country/[code]" options={{ animation: 'slide_from_right' }} />
          </Stack>
          {!onboarded ? <Onboarding onDone={finishOnboarding} /> : null}
        </View>
      </DataProvider>
    </AuthProvider>
  );
}
