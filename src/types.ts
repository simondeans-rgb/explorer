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
  name: string;
  continent: Continent;
}

export type PlaceKind = 'country' | 'city';

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
  note?: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Forward-looking domain (architecture in place; full UI lands in later passes)
// ---------------------------------------------------------------------------

export type JourneyMode = 'flight' | 'rail' | 'cruise' | 'road' | 'ferry';

/** A trip. The container for journeys, discoveries, photos and notes. */
export interface Expedition {
  id: string;
  userId: string;
  title: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  countryCodes?: string[];
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

export type RecommendationVerdict =
  | 'recommend'
  | 'hidden-gem'
  | 'worth-visiting'
  | 'overrated'
  | 'avoid';

/** Any place or experience worth remembering. */
export interface Discovery {
  id: string;
  userId: string;
  name: string;
  category: DiscoveryCategory;
  countryCode?: string;
  city?: string;
  expeditionId?: string;
  verdict?: RecommendationVerdict;
  note?: string;
  createdAt: number;
  updatedAt: number;
}
