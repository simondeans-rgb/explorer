// Firebase for React Native. Configured from EXPO_PUBLIC_* env vars, falling
// back to the project's public web config so production builds are always
// connected (these values are public — they ship in the web app too; access is
// governed by Firestore/Storage rules + Auth, not by hiding them). Auth persists
// across launches with AsyncStorage when the React Native helper is available.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import * as fbAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC3amR2S1QbuffI-l2b48XQSYVCKdBAslg',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'stickynotes-c13ac.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'stickynotes-c13ac',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'stickynotes-c13ac.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '495314900593',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:495314900593:web:3c9b1d1fc1ccb0c43dedd0',
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
