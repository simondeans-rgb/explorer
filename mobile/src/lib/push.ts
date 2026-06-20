// Friend-activity push: register this device's Expo push token + preference so
// the Cloud Functions backend can notify you when your circle logs new travel.
// Push tokens require a real build (they don't work in Expo Go), so everything
// is guarded and simply no-ops where unavailable.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const PREF_KEY = 'worldly.notif.friendActivity';
const PROJECT_ID = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

export async function friendActivityEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PREF_KEY)) === '1';
  } catch {
    return false;
  }
}

async function tokenForDevice(): Promise<string | null> {
  try {
    const t = await Notifications.getExpoPushTokenAsync(PROJECT_ID ? { projectId: PROJECT_ID } : undefined);
    return t.data || null;
  } catch {
    return null;
  }
}

export async function enableFriendActivity(): Promise<boolean> {
  try {
    const uid = auth?.currentUser?.uid;
    if (!uid || !db) return false;
    if (!(await Notifications.requestPermissionsAsync()).granted) return false;
    const token = await tokenForDevice();
    if (!token) return false;
    await setDoc(doc(db, 'pushTokens', uid), { token, friendActivity: true, updatedAt: Date.now() }, { merge: true });
    await AsyncStorage.setItem(PREF_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export async function disableFriendActivity(): Promise<void> {
  try {
    await AsyncStorage.setItem(PREF_KEY, '0');
    const uid = auth?.currentUser?.uid;
    if (uid && db) await setDoc(doc(db, 'pushTokens', uid), { friendActivity: false }, { merge: true });
  } catch {
    /* ignore */
  }
}

/** Re-register the device token (it can rotate) when the feature is on. */
export async function refreshPushToken(): Promise<void> {
  try {
    if (!(await friendActivityEnabled())) return;
    const uid = auth?.currentUser?.uid;
    if (!uid || !db || !(await Notifications.getPermissionsAsync()).granted) return;
    const token = await tokenForDevice();
    if (token) await setDoc(doc(db, 'pushTokens', uid), { token, friendActivity: true, updatedAt: Date.now() }, { merge: true });
  } catch {
    /* ignore */
  }
}
