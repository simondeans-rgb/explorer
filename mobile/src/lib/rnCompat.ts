// React Native still ships an *enumerable* `PushNotificationIOS` getter on its
// module exports. Accessing it builds a `NativeEventEmitter` from a native
// module that was extracted from core, so it throws:
//   "Invariant Violation: `new NativeEventEmitter()` requires a non-null argument."
// Any dependency that enumerates react-native's exports (e.g. a namespace import
// compiled to Metro's `importAll`, which copies every key) trips that getter and
// hard-crashes the app — we saw this on the social sign-in path. We don't use
// PushNotificationIOS, so replace the getter with a harmless one at startup.
//
// Import this module before anything that might enumerate react-native.
/* eslint-disable @typescript-eslint/no-require-imports */
try {
  const RN = require('react-native') as Record<string, unknown>;
  const desc = Object.getOwnPropertyDescriptor(RN, 'PushNotificationIOS');
  if (desc?.get && desc.configurable) {
    Object.defineProperty(RN, 'PushNotificationIOS', {
      configurable: true,
      enumerable: true,
      get: () => undefined,
    });
  }
} catch {
  /* never let a compatibility shim break startup */
}
