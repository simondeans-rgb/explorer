// The single source of truth for Worldly's two-tier model.
//
//   Wanderer (free)  — generous enough to build a real travel history.
//   Explorer (paid)  — everything, unlimited. £4.99/mo or £39.99/yr.
//
// Numbers here drive both the enforcement (billing.checkLimit) and the paywall
// copy, so a price or limit change is a one-file edit. Pure data — no imports.

export type Tier = 'wanderer' | 'explorer';

/** What a metered thing is called in limits and paywall copy. */
export type LimitMetric =
  | 'countries'
  | 'cities'
  | 'discoveries'
  | 'circle'
  | 'flightLookupsPerMonth'
  | 'itineraries';

/** Free-tier caps. Explorer is unlimited on every metric. */
export const WANDERER_LIMITS: Record<LimitMetric, number> = {
  countries: 25,
  cities: 50,
  discoveries: 10,
  circle: 3,
  flightLookupsPerMonth: 10,
  itineraries: 1,
};

export const TIER_NAMES: Record<Tier, string> = {
  wanderer: 'Wanderer',
  explorer: 'Explorer',
};

// Pricing — annual-first framing everywhere ("£39.99/year — less than
// £3.40/month"), monthly as the secondary option.
export const PRICE_MONTHLY = '£4.99';
export const PRICE_ANNUAL = '£39.99';
export const PRICE_ANNUAL_AS_MONTHLY = '£3.34';
export const ANNUAL_HEADLINE = `${PRICE_ANNUAL}/year — less than £3.40 a month`;
export const MONTHLY_HEADLINE = `${PRICE_MONTHLY}/month`;

// Passport Covers one-time purchases (free-tier path; Explorer includes all
// covers). Achievement-unlocked covers are never sold — earned is earned.
export const COVER_PRICE_CORE = '£1.49';
export const COVER_PRICE_SEASONAL_SINGLE = '£0.99';
export const COVER_PRICE_PACK = '£2.99';

/** The Explorer benefits list, in paywall display order. */
export const EXPLORER_BENEFITS: string[] = [
  'Unlimited countries, cities & discoveries',
  'Unlimited Circle connections',
  'Full flight statistics dashboard',
  'Unlimited flight number lookups',
  'Unlimited trip itineraries',
  'Shareable Year in Travel card & poster',
  'Every Passport Cover, including seasonal packs',
  'Almanac PDF export',
];
