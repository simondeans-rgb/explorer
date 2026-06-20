// Remote push: register this device's Expo push token + per-type preferences so
// the Cloud Functions backend can notify you about friend activity and shared
// trip updates. Push tokens require a real build (not Expo Go), so everything is
// guarded and no-ops where unavailable.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const FRIEND_KEY = 'worldly.notif.friendActivity';
const TRIP_KEY = 'worldly.notif.tripActivity';
const PROJECT_ID = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

type Pref = 'friendActivity' | 'tripActivity';

async function flag(key: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(key)) === '1';
  } catch {
    return false;
  }
}
export const friendActivityEnabled = () => flag(FRIEND_KEY);
export const tripActivityEnabled = () => flag(TRIP_KEY);

async function tokenForDevice(): Promise<string | null> {
  try {
    const t = await Notifications.getExpoPushTokenAsync(PROJECT_ID ? { projectId: PROJECT_ID } : undefined);
    return t.data || null;
  } catch {
    return null;
  }
}

/** Request permission, get this device's token, and set the given preference. */
async function registerPref(field: Pref): Promise<boolean> {
  const uid = auth?.currentUser?.uid;
  if (!uid || !db) return false;
  if (!(await Notifications.requestPermissionsAsync()).granted) return false;
  const token = await tokenForDevice();
  if (!token) return false;
  await setDoc(doc(db, 'pushTokens', uid), { token, [field]: true, updatedAt: Date.now() }, { merge: true });
  return true;
}

async function clearPref(field: Pref, localKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(localKey, '0');
    const uid = auth?.currentUser?.uid;
    if (uid && db) await setDoc(doc(db, 'pushTokens', uid), { [field]: false }, { merge: true });
  } catch {
    /* ignore */
  }
}

export async function enableFriendActivity(): Promise<boolean> {
  try {
    if (!(await registerPref('friendActivity'))) return false;
    await AsyncStorage.setItem(FRIEND_KEY, '1');
    return true;
  } catch {
    return false;
  }
}
export async function disableFriendActivity(): Promise<void> {
  await clearPref('friendActivity', FRIEND_KEY);
}

export async function enableTripActivity(): Promise<boolean> {
  try {
    if (!(await registerPref('tripActivity'))) return false;
    await AsyncStorage.setItem(TRIP_KEY, '1');
    return true;
  } catch {
    return false;
  }
}
export async function disableTripActivity(): Promise<void> {
  await clearPref('tripActivity', TRIP_KEY);
}

/** Re-register the device token (it can rotate) when any push feature is on. */
export async function refreshPushToken(): Promise<void> {
  try {
    if (!(await flag(FRIEND_KEY)) && !(await flag(TRIP_KEY))) return;
    const uid = auth?.currentUser?.uid;
    if (!uid || !db || !(await Notifications.getPermissionsAsync()).granted) return;
    const token = await tokenForDevice();
    if (token) await setDoc(doc(db, 'pushTokens', uid), { token, updatedAt: Date.now() }, { merge: true });
  } catch {
    /* ignore */
  }
}
