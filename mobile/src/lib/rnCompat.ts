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

// Cap Dynamic Type scaling at 135% (R17). Raised from 125% to give low-vision
// users more usable headroom; the ceiling still holds because past roughly this
// point fixed-height cards, the onboarding footer and pill CTAs clip or overlap
// (tester report). Fully supporting the largest accessibility sizes needs those
// surfaces to reflow instead of grow — a per-screen follow-up. Components can opt
// into more (or less) with an explicit maxFontSizeMultiplier.
try {
  const { Text, TextInput } = require('react-native') as {
    Text: { defaultProps?: { maxFontSizeMultiplier?: number } };
    TextInput: { defaultProps?: { maxFontSizeMultiplier?: number } };
  };
  for (const C of [Text, TextInput]) {
    C.defaultProps = C.defaultProps ?? {};
    if (C.defaultProps.maxFontSizeMultiplier == null) C.defaultProps.maxFontSizeMultiplier = 1.35;
  }
} catch {
  /* never let a compatibility shim break startup */
}
