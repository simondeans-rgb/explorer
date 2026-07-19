/** The cover catalog — every Passport Cover the app knows, engine-side.
 *
 *  This is the single source for per-cover THEME data (accent colours,
 *  gradients, in-app particle profiles, android icon backgrounds). Running
 *  `npm run covers:gen` emits mobile/src/lib/coverThemes.gen.ts for the app
 *  runtime. Icon names match the expo-alternate-app-icons plugin entries in
 *  app.json; `null` is the default (Classic) icon.
 */

export type ParticleProfile =
  | 'none'
  | 'snow'
  | 'stars'
  | 'petals'
  | 'bubbles'
  | 'embers'
  | 'aurora'
  | 'confetti'
  | 'rain'
  | 'steam'
  | 'fireflies'
  | 'sparkle';

export interface CoverTheme {
  /** Icon name (PascalCase, as in app.json) or 'Classic' for the default. */
  icon: string;
  /** Accent used for highlights when this cover is active. */
  accent: string;
  /** Two-stop gradient echoing the cover's sky. */
  gradient: [string, string];
  /** Ambient particle layer shown on the cover's preview / unlock moment. */
  particles: ParticleProfile;
  /** Particle tint(s). */
  particleColors: string[];
  /** Android adaptive-icon background (app.json). */
  androidBg: string;
}

export const COVER_THEMES: CoverTheme[] = [
  { icon: 'Classic', accent: '#FF6B9A', gradient: ['#FF6B9A', '#9B7CFF'], particles: 'sparkle', particleColors: ['#FFFFFF'], androidBg: '#14213D' },
  { icon: 'Midnight', accent: '#9B7CFF', gradient: ['#1B2C5C', '#0E1837'], particles: 'stars', particleColors: ['#FFFFFF', '#9B7CFF'], androidBg: '#0E1837' },
  { icon: 'Pearl', accent: '#24D1C3', gradient: ['#F4F6FB', '#D9E2EF'], particles: 'sparkle', particleColors: ['#FFFFFF'], androidBg: '#E9EDF5' },
  { icon: 'Earth', accent: '#5BA860', gradient: ['#8CC9E8', '#2E7D4F'], particles: 'none', particleColors: [], androidBg: '#2E7D4F' },
  { icon: 'Sunset', accent: '#FFB84D', gradient: ['#FF9E6B', '#7A3A55'], particles: 'sparkle', particleColors: ['#FFE9B8'], androidBg: '#7A3A55' },
  { icon: 'Ocean', accent: '#4DA6FF', gradient: ['#63B7E6', '#0E4E7E'], particles: 'bubbles', particleColors: ['#FFFFFF'], androidBg: '#0E4E7E' },
  { icon: 'Sakura', accent: '#FF8FB3', gradient: ['#FFD7E4', '#B4638C'], particles: 'petals', particleColors: ['#FFC2D6', '#FF8FB3'], androidBg: '#B4638C' },
  { icon: 'Tropical', accent: '#24D1C3', gradient: ['#39C9B8', '#0E6E63'], particles: 'none', particleColors: [], androidBg: '#0E6E63' },
  { icon: 'Winter', accent: '#8FC3E4', gradient: ['#C9DEF0', '#5E86AD'], particles: 'snow', particleColors: ['#FFFFFF'], androidBg: '#5E86AD' },
  { icon: 'Coffee', accent: '#B4794A', gradient: ['#D9A468', '#5C3A22'], particles: 'steam', particleColors: ['#FFF4E6'], androidBg: '#5C3A22' },
  { icon: 'Aurora', accent: '#4BE3B2', gradient: ['#0E2547', '#164B3E'], particles: 'aurora', particleColors: ['#4BE3B2', '#9B7CFF'], androidBg: '#0E2547' },
  { icon: 'FrequentFlyer', accent: '#4DA6FF', gradient: ['#8CC9E8', '#2C5C8F'], particles: 'none', particleColors: [], androidBg: '#2C5C8F' },
  { icon: 'Luxury', accent: '#F0C25C', gradient: ['#2A2138', '#0F0B18'], particles: 'sparkle', particleColors: ['#F0C25C'], androidBg: '#0F0B18' },
  { icon: 'Neon', accent: '#FF4F8B', gradient: ['#2B0F45', '#0E0620'], particles: 'embers', particleColors: ['#FF4F8B', '#35B5F5'], androidBg: '#0E0620' },
  { icon: 'Christmas', accent: '#E4574C', gradient: ['#12304A', '#071624'], particles: 'snow', particleColors: ['#FFFFFF'], androidBg: '#071624' },
  { icon: 'CandyCane', accent: '#DE2B40', gradient: ['#FFF4F4', '#E8B8BE'], particles: 'snow', particleColors: ['#FFFFFF', '#FFD2D8'], androidBg: '#B22735' },
  { icon: 'CozyWinter', accent: '#FFB84D', gradient: ['#27436B', '#0F2036'], particles: 'snow', particleColors: ['#FFFFFF'], androidBg: '#0F2036' },
  { icon: 'Halloween', accent: '#FF8C42', gradient: ['#2A1C4F', '#120A26'], particles: 'embers', particleColors: ['#FF8C42'], androidBg: '#120A26' },
  { icon: 'Ghost', accent: '#C445E0', gradient: ['#3A2260', '#170D30'], particles: 'fireflies', particleColors: ['#C4B5F0'], androidBg: '#170D30' },
  { icon: 'WitchingHour', accent: '#9B7CFF', gradient: ['#241547', '#0D0722'], particles: 'stars', particleColors: ['#C4B5F0', '#FFB84D'], androidBg: '#0D0722' },
  { icon: 'Pride', accent: '#FF6B9A', gradient: ['#E4574C', '#7C4DBF'], particles: 'confetti', particleColors: ['#E4574C', '#FFB84D', '#F5D547', '#4C9F70', '#4DA6FF', '#9B7CFF'], androidBg: '#7C4DBF' },
  { icon: 'PrideNeon', accent: '#FF4F8B', gradient: ['#1B0F35', '#0A0518'], particles: 'confetti', particleColors: ['#FF4F8B', '#FFB84D', '#4BE3B2', '#35B5F5', '#C445E0'], androidBg: '#0A0518' },
  { icon: 'PrideNight', accent: '#9B7CFF', gradient: ['#1B2C5C', '#0E1837'], particles: 'stars', particleColors: ['#FFB84D', '#4BE3B2', '#FF6B9A'], androidBg: '#0E1837' },
  // Voyager Pack (engine-built).
  { icon: 'Metropolis', accent: '#FFB84D', gradient: ['#2E3B77', '#E88A6A'], particles: 'stars', particleColors: ['#FFC97E', '#FFFFFF'], androidBg: '#141F49' },
  { icon: 'VintageVoyage', accent: '#B4543E', gradient: ['#E3CD9F', '#B29360'], particles: 'none', particleColors: [], androidBg: '#B29360' },
  { icon: 'Summit', accent: '#4DA6FF', gradient: ['#3A5787', '#FFD9C2'], particles: 'snow', particleColors: ['#FFFFFF'], androidBg: '#16294F' },
  { icon: 'Oasis', accent: '#F5A66B', gradient: ['#F5A66B', '#7A3A55'], particles: 'sparkle', particleColors: ['#FFE9B8'], androidBg: '#7A3A55' },
  // First-generation catalogue expansion.
  { icon: 'Linen', accent: '#C4552F', gradient: ['#F4EEE0', '#DCCFB2'], particles: 'none', particleColors: [], androidBg: '#DCCFB2' },
  { icon: 'Explorer', accent: '#24D1C3', gradient: ['#155E5A', '#0C2A2E'], particles: 'none', particleColors: [], androidBg: '#0C2A2E' },
  { icon: 'Spring', accent: '#FF8FB3', gradient: ['#BFE8F2', '#A6D48A'], particles: 'petals', particleColors: ['#FFD7E4', '#FFFFFF'], androidBg: '#A6D48A' },
  { icon: 'Summer', accent: '#FFB84D', gradient: ['#37C0E8', '#F4C56B'], particles: 'none', particleColors: [], androidBg: '#37C0E8' },
  { icon: 'Autumn', accent: '#DC7A3C', gradient: ['#F0B25A', '#8C3A24'], particles: 'petals', particleColors: ['#E8912F', '#D2542B', '#F2B84B'], androidBg: '#8C3A24' },
  { icon: 'LunarNewYear', accent: '#F3CE6A', gradient: ['#C4222A', '#5E0E14'], particles: 'sparkle', particleColors: ['#F3D27A'], androidBg: '#5E0E14' },
  { icon: 'Gold', accent: '#F0C25C', gradient: ['#2A2418', '#0B0F1C'], particles: 'sparkle', particleColors: ['#F0C25C'], androidBg: '#0B0F1C' },
  { icon: 'Marble', accent: '#B08D2E', gradient: ['#FBFAF6', '#DEDBD1'], particles: 'none', particleColors: [], androidBg: '#DEDBD1' },
  { icon: 'Galaxy', accent: '#9B7CFF', gradient: ['#2A1A54', '#080512'], particles: 'stars', particleColors: ['#FFFFFF', '#9B7CFF'], androidBg: '#080512' },
  { icon: 'ArtDeco', accent: '#D9B45A', gradient: ['#123049', '#08131F'], particles: 'sparkle', particleColors: ['#D9B45A'], androidBg: '#08131F' },
  { icon: 'Nordic', accent: '#4DA6FF', gradient: ['#3E6E92', '#E7C9B0'], particles: 'snow', particleColors: ['#FFFFFF'], androidBg: '#1B3A5C' },
  { icon: 'Safari', accent: '#E88A3C', gradient: ['#F4C05A', '#7A3524'], particles: 'none', particleColors: [], androidBg: '#7A3524' },
  { icon: 'Mediterranean', accent: '#2E9BD6', gradient: ['#2E9BD6', '#BFE6F2'], particles: 'none', particleColors: [], androidBg: '#2E9BD6' },
  { icon: 'EveryContinent', accent: '#FFD36B', gradient: ['#123A6B', '#060D1F'], particles: 'stars', particleColors: ['#FFFFFF', '#FFD36B'], androidBg: '#060D1F' },
  { icon: 'WorldlyLegend', accent: '#E8C25A', gradient: ['#231B08', '#050301'], particles: 'sparkle', particleColors: ['#E8C25A'], androidBg: '#050301' },
];
