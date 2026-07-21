// A tiny, crash-proof haptics layer. `expo-haptics`' native module only exists
// in a binary built with it, so on an older build running OTA'd JS every call
// must no-op rather than throw. We load the module lazily behind try/catch and
// swallow any call-time errors, mirroring the optional-native pattern used by
// WidgetSync / rating.ts. On the build that bundles expo-haptics, it lights up.

type HapticsModule = typeof import('expo-haptics');

let mod: HapticsModule | null | undefined;
function get(): HapticsModule | null {
  if (mod !== undefined) return mod;
  try {
    mod = require('expo-haptics') as HapticsModule;
  } catch {
    mod = null; // native module absent (older binary) — stay silent
  }
  return mod;
}

/** A light/medium/heavy tap — for button presses and adds. */
export function hImpact(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  const m = get();
  if (!m) return;
  try {
    const s =
      style === 'heavy' ? m.ImpactFeedbackStyle.Heavy : style === 'medium' ? m.ImpactFeedbackStyle.Medium : m.ImpactFeedbackStyle.Light;
    void m.impactAsync(s);
  } catch {
    /* non-critical */
  }
}

/** A success buzz — for celebrations, unlocks and completed adds. */
export function hSuccess(): void {
  const m = get();
  if (!m) return;
  try {
    void m.notificationAsync(m.NotificationFeedbackType.Success);
  } catch {
    /* non-critical */
  }
}

/** A crisp selection tick — for tab switches, toggles and chips. */
export function hSelection(): void {
  const m = get();
  if (!m) return;
  try {
    void m.selectionAsync();
  } catch {
    /* non-critical */
  }
}
