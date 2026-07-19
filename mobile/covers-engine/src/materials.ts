/** Material library — reusable surface finishes for the protected mark.
 *
 *  A material changes ONLY how the W's surface looks (fills, rims, sheen).
 *  It never changes geometry. Each material contributes its own <defs> and
 *  is referenced by the mark renderer.
 */

export interface Material {
  id: string;
  /** SVG <defs> content this material needs (gradients etc.). */
  defs: string;
  /** Stroke paint for the route line. */
  lineStroke: string;
  /** Fill paint for the pin bodies. */
  pinFill: string;
  /** Bevel highlight colour along the line's top edge. */
  bevel?: string;
  bevelOpacity?: number;
  /** Pin rim stroke + opacity. */
  pinRim?: string;
  pinRimOpacity?: number;
  /** Opacity of the elliptical sheen on each pin head. */
  pinSheen?: number;
}

/** The signature finish: white porcelain with a cool underside. */
export const PORCELAIN: Material = {
  id: 'porcelain',
  defs:
    '<linearGradient id="m-porc-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D7DCE8"/></linearGradient>' +
    '<linearGradient id="m-porc-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.62" stop-color="#F2F4F9"/>' +
    '<stop offset="1" stop-color="#C6CCDB"/></linearGradient>',
  lineStroke: 'url(#m-porc-line)',
  pinFill: 'url(#m-porc-pin)',
};

/** Warm 18-karat gold — luxury editions. */
export const GOLD: Material = {
  id: 'gold',
  defs:
    '<linearGradient id="m-gold-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FFE9A8"/><stop offset="0.5" stop-color="#F0C25C"/><stop offset="1" stop-color="#B9832B"/></linearGradient>' +
    '<linearGradient id="m-gold-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFF3C9"/><stop offset="0.55" stop-color="#F3C766"/>' +
    '<stop offset="1" stop-color="#A57224"/></linearGradient>',
  lineStroke: 'url(#m-gold-line)',
  pinFill: 'url(#m-gold-pin)',
  bevel: '#FFF7DC',
  pinRim: '#FFF3C9',
  pinSheen: 0.75,
};

/** Frosted glacier ice — cold-weather editions. */
export const ICE: Material = {
  id: 'ice',
  defs:
    '<linearGradient id="m-ice-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#F4FBFF"/><stop offset="1" stop-color="#AFD8EE"/></linearGradient>' +
    '<linearGradient id="m-ice-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#DFF2FC"/>' +
    '<stop offset="1" stop-color="#8FC3E4"/></linearGradient>',
  lineStroke: 'url(#m-ice-line)',
  pinFill: 'url(#m-ice-pin)',
  bevel: '#FFFFFF',
  pinSheen: 0.95,
};

/** Aged cream paper — vintage editions (pairs with kraft + stamps scenes). */
export const PARCHMENT: Material = {
  id: 'parchment',
  defs:
    '<linearGradient id="m-parch-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FFF9EC"/><stop offset="1" stop-color="#E4D3B0"/></linearGradient>' +
    '<linearGradient id="m-parch-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFCF2"/><stop offset="0.62" stop-color="#F4E9CF"/>' +
    '<stop offset="1" stop-color="#CDB98D"/></linearGradient>',
  lineStroke: 'url(#m-parch-line)',
  pinFill: 'url(#m-parch-pin)',
  bevel: '#FFFDF4',
  pinSheen: 0.55,
};

/** Polished chrome — modern/metallic editions. */
export const CHROME: Material = {
  id: 'chrome',
  defs:
    '<linearGradient id="m-chrome-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#C8D2DE"/>' +
    '<stop offset="0.55" stop-color="#8E9AAB"/><stop offset="1" stop-color="#E6ECF4"/></linearGradient>' +
    '<linearGradient id="m-chrome-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#B9C4D2"/>' +
    '<stop offset="1" stop-color="#78849B"/></linearGradient>',
  lineStroke: 'url(#m-chrome-line)',
  pinFill: 'url(#m-chrome-pin)',
  bevel: '#FFFFFF',
  pinSheen: 0.9,
};

/** White Carrara marble — premium editions. */
export const MARBLE: Material = {
  id: 'marble',
  defs:
    '<linearGradient id="m-marble-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#F3F2EF"/><stop offset="1" stop-color="#D8D6CF"/></linearGradient>' +
    '<linearGradient id="m-marble-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#EFEDE7"/>' +
    '<stop offset="1" stop-color="#CBC8BF"/></linearGradient>',
  lineStroke: 'url(#m-marble-line)',
  pinFill: 'url(#m-marble-pin)',
  bevel: '#FFFFFF',
  pinSheen: 0.7,
};

/** Woven natural linen — understated, tactile core editions. */
export const LINEN: Material = {
  id: 'linen',
  defs:
    '<linearGradient id="m-linen-line" x1="0" y1="0" x2="0" y2="1024" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FBF7EE"/><stop offset="1" stop-color="#E4DAC6"/></linearGradient>' +
    '<linearGradient id="m-linen-pin" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FCF9F1"/><stop offset="0.62" stop-color="#F0E8D6"/>' +
    '<stop offset="1" stop-color="#D3C6AC"/></linearGradient>',
  lineStroke: 'url(#m-linen-line)',
  pinFill: 'url(#m-linen-pin)',
  bevel: '#FFFDF6',
  pinSheen: 0.5,
};

export const MATERIALS: Record<string, Material> = {
  porcelain: PORCELAIN,
  gold: GOLD,
  ice: ICE,
  parchment: PARCHMENT,
  chrome: CHROME,
  marble: MARBLE,
  linen: LINEN,
};
