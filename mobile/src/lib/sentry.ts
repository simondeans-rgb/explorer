// Crash + error reporting via Sentry. Deliberately inert unless BOTH a DSN is
// configured (EXPO_PUBLIC_SENTRY_DSN) AND we're in a real build — so Expo Go and
// un-configured builds never load the native module or send anything. Sentry is
// require()'d lazily for the same reason (Metro still bundles it, but its code
// only executes when we opt in).
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Fall back to the project DSN so crash reporting works in OTA updates too (the
// DSN isn't a secret — it only permits sending events and already ships in the
// binary). Overridable via EXPO_PUBLIC_SENTRY_DSN.
const DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  'https://dd70f34fbee9916f298df71a1e4e2479@o4511589182734336.ingest.de.sentry.io/4511589188894800';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let wrapImpl = <T,>(component: T): T => component;

/** Initialise Sentry when configured. No-op in Expo Go or without a DSN. */
export function initSentry(): void {
  if (!DSN || isExpoGo) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy on purpose: Expo Go must never execute the native module
    const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
    Sentry.init({
      dsn: DSN,
      // Light performance sampling; crash/error capture is the priority.
      tracesSampleRate: 0.1,
      // Don't attach IP / PII automatically.
      sendDefaultPii: false,
    });
    wrapImpl = Sentry.wrap as typeof wrapImpl;
  } catch {
    /* never let telemetry setup break the app */
  }
}

/** Wrap the root component with Sentry's error boundary when initialised. */
export function wrapWithSentry<T>(component: T): T {
  return wrapImpl(component);
}
