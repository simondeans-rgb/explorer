// User appearance override: system-following by default, with a manual
// Light/Dark choice persisted locally. Appearance.setColorScheme also sets
// each window's overrideUserInterfaceStyle on iOS, so the native
// DynamicColorIOS tokens in theme.ts flip together with the NativeWind
// `dark:` variants — one call themes everything.
//
// iOS-only: on Android the app ships with userInterfaceStyle "light" and the
// theme tokens resolve to their light values, so an override would only
// half-apply. The Passport toggle is hidden there.
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppearanceMode = 'system' | 'light' | 'dark';

const KEY = 'worldly:appearance';

export async function getAppearanceMode(): Promise<AppearanceMode> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(mode: AppearanceMode): void {
  if (Platform.OS !== 'ios') return;
  Appearance.setColorScheme(mode === 'system' ? null : mode);
}

export async function setAppearanceMode(mode: AppearanceMode): Promise<void> {
  apply(mode);
  try {
    await AsyncStorage.setItem(KEY, mode);
  } catch {
    /* keep the in-session override even if persistence fails */
  }
}

/** Re-apply the persisted choice at app start (root layout). */
export async function applyStoredAppearance(): Promise<void> {
  apply(await getAppearanceMode());
}
