// Firebase for React Native. Configured from EXPO_PUBLIC_* env vars; when absent
// the app runs on seed data (demo). Auth persists across launches with
// AsyncStorage when the React Native persistence helper is available.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import * as fbAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId,
);

let app: FirebaseApp | null = null;
let authInstance: fbAuth.Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0]! : initializeApp(config);

  // The RN build of firebase/auth ships getReactNativePersistence; the node
  // build (used in typecheck/test) does not. Resolve it dynamically so both
  // environments work, and persist the session with AsyncStorage when we can.
  const getRNPersistence = (
    fbAuth as unknown as {
      getReactNativePersistence?: (s: unknown) => fbAuth.Persistence;
    }
  ).getReactNativePersistence;
  try {
    authInstance = getRNPersistence
      ? fbAuth.initializeAuth(app, {
          persistence: getRNPersistence(AsyncStorage),
        })
      : fbAuth.getAuth(app);
  } catch {
    // initializeAuth throws if auth was already initialised — reuse it.
    authInstance = fbAuth.getAuth(app);
  }

  dbInstance = getFirestore(app);
  if (config.storageBucket) storageInstance = getStorage(app);
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
