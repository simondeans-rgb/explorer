// Explorer's Passport — domain model
//
// The Passport records a Member's relationship with places (countries and
// cities). Trips (Expeditions), how you travelled (Journeys) and the things
// you found (Discoveries) build on the same user-scoped Firestore pattern and
// are stubbed below so the architecture is in place to grow into them.

export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'Antarctica';

export const CONTINENTS: Continent[] = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
];

/** A place in the world the Society knows about. */
export interface Country {
  code: string; // ISO 3166-1 alpha-2
  alpha3: string; // ISO 3166-1 alpha-3 (used on passport stamps)
  name: string;
  continent: Continent;
}

export type PlaceKind = 'country' | 'city' | 'region';

/**
 * The seven relationships a Member can have with a place. Six of them count as
 * a genuine discovery; `aspiring` is a wish-list relationship for somewhere not
 * yet discovered.
 */
export type Relationship =
  | 'visited'
  | 'lived'
  | 'worked'
  | 'studied'
  | 'based'
  | 'born'
  | 'aspiring';

export const RELATIONSHIPS: Relationship[] = [
  'visited',
  'lived',
  'worked',
  'studied',
  'based',
  'born',
  'aspiring',
];

/** Relationships that represent an actual discovery (everything but aspiring). */
export const DISCOVERY_RELATIONSHIPS: Relationship[] = [
  'visited',
  'lived',
  'worked',
  'studied',
  'based',
  'born',
];

export interface RelationshipMeta {
  id: Relationship;
  label: string;
  description: string;
  icon: string; // lucide-react icon name, resolved where rendered
}

export const RELATIONSHIP_META: Record<Relationship, RelationshipMeta> = {
  visited: {
    id: 'visited',
    label: 'Visited',
    description: 'Travelled there.',
    icon: 'Plane',
  },
  lived: {
    id: 'lived',
    label: 'Lived',
    description: 'Made a home there.',
    icon: 'Home',
  },
  worked: {
    id: 'worked',
    label: 'Worked',
    description: 'Worked there.',
    icon: 'Briefcase',
  },
  studied: {
    id: 'studied',
    label: 'Studied',
    description: 'Studied there.',
    icon: 'GraduationCap',
  },
  based: {
    id: 'based',
    label: 'Based',
    description: 'Regularly spend time there.',
    icon: 'Anchor',
  },
  born: {
    id: 'born',
    label: 'Born',
    description: 'Place of origin.',
    icon: 'Sparkles',
  },
  aspiring: {
    id: 'aspiring',
    label: 'Aspiring',
    description: 'Want to discover there.',
    icon: 'Compass',
  },
};

/** Stamps are pressed into the Passport, derived from relationships. */
export type StampKind = 'discovery' | 'residency' | 'work' | 'study';

export const STAMP_FOR_RELATIONSHIP: Partial<Record<Relationship, StampKind>> = {
  visited: 'discovery',
  lived: 'residency',
  worked: 'work',
  studied: 'study',
};

export const STAMP_LABEL: Record<StampKind, string> = {
  discovery: 'Discovery',
  residency: 'Residency',
  work: 'Work',
  study: 'Study',
};

/**
 * A Member's relationship record with one place. A country place uses the
 * country's own name + code; a city place stores the city name and the code of
 * the country it belongs to.
 */
export interface Place {
  id: string;
  userId: string;
  kind: PlaceKind;
  countryCode: string;
  name: string;
  relationships: Relationship[];
  firstYear?: number;
  /** When you were first here, at the precision the Member gave it
   *  (ISO `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`). `firstYear` is its year. */
  firstDate?: string;
  /** Primary residence period (when `lived`). ISO dates. Kept as the earliest
   *  start / latest end for backward compatibility; see `residencePeriods` for
   *  the full set when a Member lived somewhere across several spells. */
  livedFrom?: string;
  livedTo?: string;
  /** All distinct periods the Member lived here (e.g. moved away and back).
   *  When present this is the source of truth; absent ⇒ use livedFrom/livedTo. */
  residencePeriods?: ResidencePeriod[];
  note?: string;
  createdAt: number;
  updatedAt: number;
}

/** One spell of living somewhere. ISO dates (YYYY-MM[-DD]); `to` open ⇒ present. */
export interface ResidencePeriod {
  from: string;
  to?: string;
}

// ---------------------------------------------------------------------------
// Forward-looking domain (architecture in place; full UI lands in later passes)
// ---------------------------------------------------------------------------

export type JourneyMode = 'flight' | 'rail' | 'cruise' | 'road' | 'ferry';

export const JOURNEY_MODES: JourneyMode[] = [
  'flight',
  'rail',
  'cruise',
  'road',
  'ferry',
];

/** Mode-aware labels for the generic operator / from / to / reference / seat
 *  fields, so one editor serves every mode (Brand Book Journeys spec). */
export const JOURNEY_MODE_META: Record<
  JourneyMode,
  {
    label: string;
    icon: string;
    operator: string;
    from: string;
    to: string;
    reference: string;
    seat: string;
  }
> = {
  flight: { label: 'Flight', icon: 'Plane', operator: 'Airline', from: 'From airport', to: 'To airport', reference: 'Flight number', seat: 'Cabin & seat' },
  rail: { label: 'Rail', icon: 'TrainFront', operator: 'Operator', from: 'From station', to: 'To station', reference: 'Service / route', seat: 'Class' },
  cruise: { label: 'Cruise', icon: 'Ship', operator: 'Cruise line', from: 'From port', to: 'To port', reference: 'Ship', seat: 'Cabin' },
  road: { label: 'Road trip', icon: 'Car', operator: 'Vehicle', from: 'Start', to: 'End', reference: 'Route', seat: 'Distance' },
  ferry: { label: 'Ferry', icon: 'Anchor', operator: 'Operator', from: 'From', to: 'To', reference: 'Route', seat: 'Class' },
};

/** How a Member travelled within an Expedition. */
export interface Journey {
  id: string;
  mode: JourneyMode;
  operator?: string;
  from?: string;
  to?: string;
  reference?: string; // flight number / ship / service
  seat?: string; // cabin & seat / class
  vehicle?: string; // aircraft / vehicle type
  date?: string;
  note?: string;
}

/** A trip. The container for journeys, discoveries, photos and notes. */
export interface Expedition {
  id: string;
  userId: string;
  title: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  countryCodes: string[];
  journeys: Journey[];
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export type DiscoveryCategory =
  | 'food'
  | 'accommodation'
  | 'culture'
  | 'experience'
  | 'nature';

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  'food',
  'accommodation',
  'culture',
  'experience',
  'nature',
];

export const DISCOVERY_CATEGORY_META: Record<
  DiscoveryCategory,
  { label: string; hint: string; icon: string }
> = {
  food: {
    label: 'Food & Drink',
    hint: 'Restaurants, cafés, bars, bakeries, wineries.',
    icon: 'UtensilsCrossed',
  },
  accommodation: {
    label: 'Accommodation',
    hint: 'Hotels, resorts, apartments, cruise ships.',
    icon: 'BedDouble',
  },
  culture: {
    label: 'Culture',
    hint: 'Museums, galleries, historic sites, monuments.',
    icon: 'Landmark',
  },
  experience: {
    label: 'Experiences',
    hint: 'Tours, activities, shows, concerts, festivals.',
    icon: 'Ticket',
  },
  nature: {
    label: 'Nature',
    hint: 'Beaches, parks, viewpoints, national parks.',
    icon: 'Mountain',
  },
};

/** Optional finer type within a category (e.g. food → restaurant/café/bar).
 *  Backward compatible: discoveries without a subcategory are still valid. */
export const DISCOVERY_SUBCATEGORIES: Record<
  DiscoveryCategory,
  { id: string; label: string }[]
> = {
  food: [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'cafe', label: 'Café' },
    { id: 'bar', label: 'Bar' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'street-food', label: 'Street food' },
    { id: 'winery', label: 'Winery' },
  ],
  accommodation: [
    { id: 'hotel', label: 'Hotel' },
    { id: 'resort', label: 'Resort' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'guesthouse', label: 'Guesthouse' },
    { id: 'campsite', label: 'Campsite' },
  ],
  culture: [
    { id: 'museum', label: 'Museum' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'landmark', label: 'Landmark' },
    { id: 'historic-site', label: 'Historic site' },
    { id: 'religious-site', label: 'Religious site' },
    { id: 'theatre', label: 'Theatre' },
  ],
  experience: [
    { id: 'attraction', label: 'Attraction' },
    { id: 'tour', label: 'Tour' },
    { id: 'show', label: 'Show' },
    { id: 'festival', label: 'Festival' },
    { id: 'activity', label: 'Activity' },
    { id: 'nightlife', label: 'Nightlife' },
  ],
  nature: [
    { id: 'beach', label: 'Beach' },
    { id: 'park', label: 'Park' },
    { id: 'viewpoint', label: 'Viewpoint' },
    { id: 'trail', label: 'Trail' },
    { id: 'national-park', label: 'National park' },
    { id: 'wildlife', label: 'Wildlife' },
  ],
};

/** Look up a subcategory's label by id within a category. */
export function subcategoryLabel(
  category: DiscoveryCategory,
  id: string | undefined,
): string | undefined {
  if (!id) return undefined;
  return DISCOVERY_SUBCATEGORIES[category]?.find((s) => s.id === id)?.label;
}

export type RecommendationVerdict =
  | 'recommend'
  | 'hidden-gem'
  | 'worth-visiting'
  | 'overrated'
  | 'avoid';

export const RECOMMENDATION_VERDICTS: RecommendationVerdict[] = [
  'recommend',
  'hidden-gem',
  'worth-visiting',
  'overrated',
  'avoid',
];

export const VERDICT_META: Record<
  RecommendationVerdict,
  { label: string; hint: string }
> = {
  recommend: { label: 'Recommend', hint: 'Must visit.' },
  'hidden-gem': { label: 'Hidden Gem', hint: 'Underappreciated.' },
  'worth-visiting': { label: 'Worth Visiting', hint: 'A good option.' },
  overrated: { label: 'Overrated', hint: 'Not as good as expected.' },
  avoid: { label: 'Avoid', hint: "Wouldn't recommend." },
};

/** Any place or experience worth remembering. */
export interface Discovery {
  id: string;
  userId: string;
  name: string;
  category: DiscoveryCategory;
  /** Optional finer type within the category (id from DISCOVERY_SUBCATEGORIES). */
  subcategory?: string;
  countryCode?: string;
  city?: string;
  /** Canonical name of a well-known landmark this record is about, linking it
   *  to the country card's landmark list (see data/countryFacts.ts). */
  landmark?: string;
  expeditionId?: string;
  verdict?: RecommendationVerdict;
  note?: string;
  /** Optional photo of this discovery — a compact JPEG data URL. */
  photo?: string;
  createdAt: number;
  updatedAt: number;
}

/** A photo memory — a compact JPEG thumbnail (data URL) optionally tied to a
 *  place, journey, or discovery. Kept small (well under Firestore's 1 MB doc
 *  limit) by the same canvas compression used for profile photos. */
export interface Capture {
  id: string;
  userId: string;
  /** Compact JPEG data URL. */
  dataUrl: string;
  countryCode?: string;
  city?: string;
  expeditionId?: string;
  discoveryId?: string;
  caption?: string;
  createdAt: number;
}

/** A single planned stop on an upcoming trip's itinerary — often pulled from a
 *  friend's recommendation, but can be added by hand too. */
export interface ItineraryItem {
  id: string;
  name: string;
  city?: string;
  category?: DiscoveryCategory;
  /** Optional finer type within the category (id from DISCOVERY_SUBCATEGORIES). */
  subcategory?: string;
  /** The friend who recommended it, if it came from a friend. */
  fromFriend?: string;
  verdict?: RecommendationVerdict;
  /** 1-based day of the trip this is scheduled on (undefined = an unscheduled idea). */
  day?: number;
  /** Time-of-day slot within the day. */
  slot?: ItinerarySlot;
}

export type ItinerarySlot = 'allday' | 'breakfast' | 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';

export const ITINERARY_SLOTS: { id: ItinerarySlot; label: string }[] = [
  { id: 'allday', label: 'All day' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'morning', label: 'Morning' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'evening', label: 'Evening' },
];

/** An upcoming trip the Member is planning: a destination, planned dates, and a
 *  growing itinerary of places to visit. Powers the Story countdown. */
export interface Trip {
  id: string;
  userId: string; // the owner
  title: string;
  countryCode: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd
  itinerary: ItineraryItem[];
  note?: string;
  /** Everyone who can see/edit this trip (owner + invited friends). */
  memberIds: string[];
  /** uid → display name, for showing collaborators. */
  memberNames?: Record<string, string>;
  /** Free-text note per day, keyed by day number as a string. */
  dayNotes?: Record<string, string>;
  /** When on, opening Worldly during the trip auto-adds the city/country
   *  you're currently in to your map (foreground check-in). */
  autoTrack?: boolean;
  createdAt: number;
  updatedAt: number;
}
