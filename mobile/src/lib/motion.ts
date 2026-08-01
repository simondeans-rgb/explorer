// Worldly's shared motion + haptic language (review R37). One place for the
// durations, easings, stagger cadence, entrance presets and number count-ups the
// delight screens use — so animation is a *system*, not a per-screen one-off, and
// every motion here is Reduce-Motion-aware by construction.

import { useEffect, useRef, useState } from 'react';
import { Easing, FadeIn, FadeInDown, type EntryExitAnimationFunction } from 'react-native-reanimated';
import { useReduceMotion } from './useReduceMotion';

/** Standard durations (ms). Keep motion snappy and consistent across screens. */
export const DURATION = { fast: 160, base: 240, slow: 440 } as const;

/** Standard easings + a shared spring config. */
export const EASE = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.quad),
} as const;
export const SPRING = { damping: 15, stiffness: 170, mass: 0.9 } as const;
/** A tighter spring for tap feedback (cover/badge selection). */
export const SPRING_TAP = { damping: 12, stiffness: 320, mass: 0.6 } as const;

/** Per-item delay for list/grid entrance reveals — capped so long lists don't
 *  crawl in. `step` ms per item, up to `cap` items of stagger. */
export function staggerDelay(index: number, step = 45, cap = 9): number {
  return Math.min(index, cap) * step;
}

/** Re-export of the Reduce-Motion hook so screens import motion from one place. */
export { useReduceMotion } from './useReduceMotion';

/** A reanimated entrance that collapses to nothing under Reduce Motion. Pass the
 *  builder (e.g. FadeInDown) already configured with .duration()/.delay(). */
export function entrance(
  anim: EntryExitAnimationFunction | undefined,
  reduce: boolean,
): EntryExitAnimationFunction | undefined {
  return reduce ? undefined : anim;
}

/** Ready-made, Reduce-Motion-aware entrance for a staggered grid/list item.
 *  Returns an `entering` prop value (or undefined when motion is reduced). */
export function useStaggerEntrance(index: number, opts?: { fade?: boolean; step?: number }) {
  const reduce = useReduceMotion();
  if (reduce) return undefined;
  const delay = staggerDelay(index, opts?.step);
  const base = opts?.fade ? FadeIn : FadeInDown;
  return base.duration(DURATION.base).delay(delay);
}

/** Count a number up from 0 → target once (JS/rAF driven, so it works on any
 *  <Text>). Instant under Reduce Motion or when disabled. */
export function useCountUp(target: number, opts?: { enabled?: boolean; duration?: number }): number {
  const reduce = useReduceMotion();
  const enabled = (opts?.enabled ?? true) && !reduce;
  const duration = opts?.duration ?? 900;
  const [val, setVal] = useState(enabled ? 0 : target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVal(target);
      return;
    }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start == null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [target, enabled, duration]);

  return val;
}
