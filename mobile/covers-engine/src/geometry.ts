/**
 * THE PROTECTED WORLDLY MARK — single source of truth.
 *
 * This is the master "W" geometry: five map-pins joined by a route line,
 * exactly as approved in the shipping app icon. It is the brand. Treat it the
 * way Apple treats the Apple logo:
 *
 *   - never redrawn, never approximated, never regenerated
 *   - every Passport Cover uses THESE constants and paths
 *   - only materials, lighting, finish and environment may vary
 *
 * A fingerprint of the canonical geometry is exported and locked by a unit
 * test (scripts/run-tests.ts) — if any constant here changes, the test fails
 * and the change must be a deliberate, reviewed brand decision.
 */

/** Pin anchor points (the five vertices of the W), in the 1024×1024 canvas. */
export const PIN_XY: ReadonlyArray<readonly [number, number]> = [
  [178, 302],
  [340, 688],
  [512, 415],
  [685, 695],
  [852, 300],
];

/** Pin head radius. */
export const R_BALL = 88;
/** Distance from a pin's centre to its tip. */
export const TIP_DY = 118;
/** Pin-hole (the coloured dot) radius. */
export const R_HOLE = 36;
/** Route line stroke width. */
export const LINE_W = 54;

/** The teardrop map-pin outline centred on (cx, cy). */
export function pinPath(cx: number, cy: number): string {
  const r = R_BALL;
  return (
    `M${cx},${cy + TIP_DY} C${cx - r * 0.62},${cy + TIP_DY * 0.52} ${cx - r},${cy + r * 0.42} ${cx - r},${cy} ` +
    `A${r},${r} 0 1 1 ${cx + r},${cy} C${cx + r},${cy + r * 0.42} ${cx + r * 0.62},${cy + TIP_DY * 0.52} ${cx},${cy + TIP_DY} Z`
  );
}

/** The route polyline connecting the five pins (the "W" itself). */
export function wLine(): string {
  return 'M' + PIN_XY.map(([x, y]) => `${x},${y}`).join(' L');
}

/** Canvas size every cover is composed at. */
export const CANVAS = 1024;

/** Canonical fingerprint of the protected geometry (locked by a test). */
export function geometryFingerprint(): string {
  const canonical = JSON.stringify({ PIN_XY, R_BALL, TIP_DY, R_HOLE, LINE_W, pin: pinPath(512, 415), line: wLine() });
  // djb2 — tiny, dependency-free, stable.
  let h = 5381;
  for (let i = 0; i < canonical.length; i++) h = ((h * 33) ^ canonical.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
