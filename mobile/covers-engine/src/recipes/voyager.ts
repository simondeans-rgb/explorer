/** The Voyager Pack — four new engine-built covers filling the collection's
 *  gaps: a city, a memory, a mountain and a desert. Each is a Scene built
 *  entirely from the shared libraries; nothing here touches the mark's
 *  geometry. */
import type { Scene } from '../compose';
import { linearBg, radialBg, sparkle4 } from '../filters';
import { PARCHMENT } from '../materials';
import {
  stars,
  cloud,
  skyline,
  ridge,
  pine,
  dunes,
  passportStamp,
  postmarkWaves,
  flightArc,
} from '../environments';

/** Metropolis — dusk skyline, warm windows coming on. */
export function metropolis(): Scene {
  const [bgDef, bgBody] = linearBg(
    [
      [0, '#141F49'],
      [0.45, '#2E3B77'],
      [0.72, '#7A5AA0'],
      [1, '#E88A6A'],
    ],
    0.1,
    1,
  );
  return {
    defs: [bgDef],
    background: [bgBody],
    environment: [
      stars(31, 40, '#FFFFFF', 2.6),
      `<circle cx="796" cy="150" r="52" fill="#FFF3D9" opacity="0.9"/><circle cx="778" cy="140" r="44" fill="#141F49" opacity="0.16"/>`,
      // Warm haze where the city meets the sky.
      '<ellipse cx="512" cy="760" rx="620" ry="150" fill="#FF9E6B" opacity="0.35" filter="url(#blur24)"/>',
      `<g filter="url(#blur6)" opacity="0.85">${skyline(41, 966, '#2A366B', '#FFC97E', 140, 260, 0.32)}</g>`,
      skyline(42, 1024, '#101735', '#FFB84D', 150, 330, 0.5),
    ],
    mark: { holeColors: ['#FFB84D', '#FF6B9A', '#24D1C3', '#9B7CFF', '#4DA6FF'] },
    finish: { vignette: 0.34 },
  };
}

/** Vintage Voyage — a well-travelled passport page. */
export function vintageVoyage(): Scene {
  const [bgDef, bgBody] = linearBg(
    [
      [0, '#E3CD9F'],
      [0.5, '#D5BB84'],
      [1, '#B29360'],
    ],
    0.2,
    1,
  );
  // Aged-paper blotches.
  const blotches =
    '<circle cx="180" cy="880" r="150" fill="#B98F53" opacity="0.12" filter="url(#blur24)"/>' +
    '<circle cx="900" cy="140" r="130" fill="#B98F53" opacity="0.10" filter="url(#blur24)"/>' +
    '<circle cx="520" cy="980" r="180" fill="#A87F45" opacity="0.10" filter="url(#blur24)"/>';
  return {
    defs: [bgDef],
    background: [bgBody, blotches],
    environment: [
      passportStamp(190, 150, 1.06, '#B4543E', 'ring', -14, 0.5),
      passportStamp(866, 208, 0.92, '#3E6B8F', 'rect', 9, 0.44),
      passportStamp(160, 806, 0.8, '#4C7A57', 'rect', -7, 0.4),
      passportStamp(872, 862, 0.95, '#8F5FA8', 'ring', 12, 0.4),
      postmarkWaves(586, 116, 1.1, '#8A6A3F', 0.45),
      flightArc(120, 560, 480, 130, 180, '#8A6A3F', 6, 0.5),
    ],
    mark: {
      material: PARCHMENT,
      holeColors: ['#B4543E', '#3E6B8F', '#C99231', '#4C7A57', '#8F5FA8'],
    },
    finish: { vignette: 0.3 },
  };
}

/** Summit — alpine dawn above the treeline. */
export function summit(): Scene {
  const [bgDef, bgBody] = linearBg(
    [
      [0, '#16294F'],
      [0.42, '#3A5787'],
      [0.7, '#8FB4D9'],
      [1, '#FFD9C2'],
    ],
    0.15,
    1,
  );
  return {
    defs: [bgDef],
    background: [bgBody],
    environment: [
      stars(51, 34, '#FFFFFF', 2.4),
      cloud(230, 250, 0.7, '#FFFFFF', 0.5, '#C7D8EC'),
      cloud(830, 180, 0.55, '#FFFFFF', 0.4, '#C7D8EC'),
      `<g filter="url(#blur6)" opacity="0.9">${ridge(
        [
          [60, 700],
          [220, 520],
          [400, 690],
          [600, 480],
          [800, 680],
          [960, 560],
        ],
        880,
        '#5F7BA6',
        1,
      )}</g>`,
      // Dawn rim light between the two ridge lines.
      '<ellipse cx="512" cy="740" rx="600" ry="120" fill="#FFB88F" opacity="0.4" filter="url(#blur24)"/>',
      ridge(
        [
          [100, 780],
          [300, 570],
          [470, 760],
          [700, 540],
          [900, 750],
        ],
        1024,
        '#22375F',
        1,
        '#EAF3FC',
      ),
      pine(120, 972, 1.0, '#16294A', '#DFEDF9'),
      pine(220, 998, 0.8, '#16294A', '#DFEDF9'),
      pine(886, 986, 0.9, '#16294A', '#DFEDF9'),
    ],
    mark: { holeColors: ['#4DA6FF', '#24D1C3', '#FFB84D', '#FF6B9A', '#9B7CFF'] },
    finish: { vignette: 0.34 },
  };
}

/** Oasis — desert dusk, heat still in the sand. */
export function oasis(): Scene {
  const [bgDef, bgBody] = radialBg(
    [
      [0, '#FFD9A0'],
      [0.4, '#F5A66B'],
      [0.75, '#C96A56'],
      [1, '#7A3A55'],
    ],
    0.32,
  );
  // Sun sits high in the gap left of the centre pin so it stays visible.
  const sun =
    '<circle cx="368" cy="132" r="130" fill="#FFEDC4" opacity="0.5" filter="url(#blur24)"/>' +
    '<circle cx="368" cy="132" r="66" fill="#FFF6DC" opacity="0.95" filter="url(#blur6)"/>' +
    '<circle cx="368" cy="132" r="54" fill="#FFFBEE"/>';
  const shimmer = [0, 1, 2]
    .map((i) => `<path d="${sparkle4(600 + i * 130, 120 + (i % 2) * 70, 9 + i * 2)}" fill="#FFF3D2" opacity="0.65"/>`)
    .join('');
  return {
    defs: [bgDef],
    background: [bgBody, sun],
    environment: [
      shimmer,
      dunes(
        [
          [760, 90, '#B25B4F', 0.9],
          [850, 70, '#93414C', 0.95],
          [950, 110, '#6E2F45', 1],
        ],
        '#FFD9A0',
      ),
    ],
    mark: { holeColors: ['#C4552F', '#FFB84D', '#FF6B9A', '#24D1C3', '#3D2B63'] },
    finish: { vignette: 0.36 },
  };
}

export const VOYAGER_RECIPES: Record<string, () => Scene> = {
  metropolis: metropolis,
  'vintage-voyage': vintageVoyage,
  summit: summit,
  oasis: oasis,
};
