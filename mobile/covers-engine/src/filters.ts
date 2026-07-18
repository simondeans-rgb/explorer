/** Shared SVG filter + finish primitives used by every cover composition.
 *  Ported 1:1 from the approved legacy generator (legacy/covers3.py) so new
 *  covers inherit the exact same shadow/glow/grain language. */

export const FILTERS =
  '<filter id="soft" x="-40%" y="-40%" width="180%" height="180%">' +
  '<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.42"/></filter>' +
  '<filter id="linesh" x="-40%" y="-40%" width="180%" height="180%">' +
  '<feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.36"/></filter>' +
  '<filter id="glow" x="-80%" y="-80%" width="260%" height="260%">' +
  '<feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '<filter id="bigglow" x="-120%" y="-120%" width="340%" height="340%">' +
  '<feGaussianBlur stdDeviation="34" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>' +
  '<filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>' +
  '<filter id="blur24"><feGaussianBlur stdDeviation="24"/></filter>' +
  '<filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>' +
  '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.6 0.6 0.6 0 0"/>' +
  '<feComposite operator="in" in2="SourceGraphic"/></filter>' +
  '<filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="n"/>' +
  '<feDisplacementMap in="SourceGraphic" in2="n" scale="26"/></filter>';

/** Fine photographic grain across the whole tile (depth + print feel). */
export function grain(op = 0.05): string {
  return `<rect width="1024" height="1024" fill="#fff" filter="url(#grainf)" opacity="${op}"/>`;
}

/** Darkened corners that focus the eye on the mark. */
export function vignette(op = 0.38): [string, string] {
  return [
    '<radialGradient id="vig" cx="0.5" cy="0.46" r="0.75">' +
      '<stop offset="0.55" stop-color="#000" stop-opacity="0"/>' +
      `<stop offset="1" stop-color="#000" stop-opacity="${op}"/></radialGradient>`,
    '<rect width="1024" height="1024" fill="url(#vig)"/>',
  ];
}

/** Top-sheet gloss, as if the cover were laminated. */
export function gloss(): [string, string] {
  return [
    '<linearGradient id="glossg" x1="0" y1="0" x2="0.3" y2="1">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.16"/>' +
      '<stop offset="0.5" stop-color="#fff" stop-opacity="0.02"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>',
    '<path d="M0,0 H1024 V280 Q512,450 0,310 Z" fill="url(#glossg)"/>',
  ];
}

/** Four-point star sparkle path. */
export function sparkle4(x: number, y: number, s: number): string {
  const k = 0.16 * s;
  return (
    `M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} ` +
    `Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`
  );
}

/** Lighten (+f) or darken (−f) a hex colour. */
export function shade(hex: string, f: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adj = (c: number) => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f));
  const to = (c: number) => adj(c).toString(16).padStart(2, '0').toUpperCase();
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Deterministic PRNG (mulberry32) — covers must render identically forever. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function radialBg(stops: Array<[number, string]>, cy = 0.3): [string, string] {
  const inner = stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  return [
    `<radialGradient id="bg" cx="0.5" cy="${cy}" r="1.05">${inner}</radialGradient>`,
    '<rect width="1024" height="1024" fill="url(#bg)"/>',
  ];
}

export function linearBg(stops: Array<[number, string]>, x2 = 0.35, y2 = 1.0): [string, string] {
  const inner = stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  return [
    `<linearGradient id="bg" x1="0" y1="0" x2="${x2}" y2="${y2}">${inner}</linearGradient>`,
    '<rect width="1024" height="1024" fill="url(#bg)"/>',
  ];
}
