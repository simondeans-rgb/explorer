// Sample data so the app renders real, computed stats (level, badges, counts)
// from the shared engines until the live Firestore layer is wired in.
import type { Place, Discovery, Expedition, Capture, Trip } from '../types';

const now = Date.now();
const day = 86_400_000;

const country = (
  code: string,
  rel: Place['relationships'],
  firstYear?: number,
): Place => ({
  id: `c-${code}`,
  userId: 'demo',
  kind: 'country',
  countryCode: code,
  name: code,
  relationships: rel,
  firstYear,
  createdAt: now - day * 30,
  updatedAt: now,
});

const city = (code: string, name: string, firstYear?: number): Place => ({
  id: `city-${name}`,
  userId: 'demo',
  kind: 'city',
  countryCode: code,
  name,
  relationships: ["visited"],
  firstYear,
  createdAt: now - day * 20,
  updatedAt: now,
});

export const SEED_PLACES: Place[] = [
  country('JP', ['visited'], 2024),
  country('IT', ['visited', 'lived'], 2019),
  country('FR', ['visited', 'worked'], 2018),
  country('US', ['visited'], 2017),
  country('GB', ['visited', 'lived'], 2010),
  country('TH', ['visited'], 2023),
  country('PT', ['visited'], 2022),
  country('IS', ['visited'], 2021),
  country('MX', ['visited'], 2016),
  country('ZA', ['visited'], 2015),
  country('NZ', ['aspiring']),
  city('JP', 'Tokyo', 2024),
  city('JP', 'Kyoto', 2024),
  city('IT', 'Rome', 2019),
  city('GB', 'London', 2010),
  city('GB', 'Edinburgh', 2012),
  city('US', 'New York', 2017),
];

const disc = (
  id: string,
  name: string,
  category: Discovery['category'],
  countryCode: string,
  city: string,
  verdict?: Discovery['verdict'],
): Discovery => ({
  id,
  userId: 'demo',
  name,
  category,
  countryCode,
  city,
  verdict,
  createdAt: now - day * (Number(id.replace(/\D/g, '')) || 5),
  updatedAt: now,
});

export const SEED_DISCOVERIES: Discovery[] = [
  disc('d1', 'Sukiyabashi Jiro', 'food', 'JP', 'Tokyo', 'recommend'),
  disc('d2', 'teamLab Planets', 'culture', 'JP', 'Tokyo', 'worth-visiting'),
  disc('d3', 'Fushimi Inari', 'culture', 'JP', 'Kyoto', 'recommend'),
  disc('d4', 'Roscioli', 'food', 'IT', 'Rome', 'hidden-gem'),
  disc('d5', 'Colosseum', 'culture', 'IT', 'Rome', 'recommend'),
  disc('d6', 'Borough Market', 'food', 'GB', 'London', 'recommend'),
  disc('d7', 'Tate Modern', 'culture', 'GB', 'London', 'worth-visiting'),
  disc('d8', 'Arthur’s Seat', 'nature', 'GB', 'Edinburgh', 'recommend'),
  disc('d9', 'The Standard', 'accommodation', 'US', 'New York', 'worth-visiting'),
  disc('d10', 'Blue Lagoon', 'nature', 'IS', 'Reykjavik', 'recommend'),
  disc('d11', 'Time Out Market', 'food', 'PT', 'Lisbon', 'recommend'),
  disc('d12', 'Grand Palace', 'culture', 'TH', 'Bangkok', 'worth-visiting'),
];

const capture = (
  id: string,
  dataUrl: string,
  countryCode: string,
  city: string,
  caption: string,
  daysAgo: number,
): Capture => ({
  id,
  userId: 'demo',
  dataUrl,
  countryCode,
  city,
  caption,
  createdAt: now - day * daysAgo,
});

export const SEED_CAPTURES: Capture[] = [
  capture(
    'cap1',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=60',
    'JP',
    'Tokyo',
    'Neon nights in Shinjuku',
    8,
  ),
  capture(
    'cap2',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=60',
    'IT',
    'Rome',
    'Golden hour at the Colosseum',
    40,
  ),
  capture(
    'cap3',
    'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&w=600&q=60',
    'IS',
    'Vík',
    'Black sand and big skies',
    120,
  ),
];

export const SEED_EXPEDITIONS: Expedition[] = [
  {
    id: 'e1',
    userId: 'demo',
    title: 'Japan in spring',
    startDate: '2024-04-02',
    endDate: '2024-04-20',
    countryCodes: ['JP'],
    journeys: [{ id: 'j1', mode: 'flight', from: 'LHR', to: 'HND' }],
    createdAt: now - day * 200,
    updatedAt: now,
  },
  {
    id: 'e2',
    userId: 'demo',
    title: 'Italian summer',
    startDate: '2019-07-10',
    endDate: '2019-07-24',
    countryCodes: ['IT'],
    journeys: [{ id: 'j2', mode: 'rail', from: 'Rome', to: 'Florence' }],
    createdAt: now - day * 600,
    updatedAt: now,
  },
  {
    id: 'e3',
    userId: 'demo',
    title: 'Iceland ring road',
    startDate: '2021-08-01',
    endDate: '2021-08-12',
    countryCodes: ['IS'],
    journeys: [{ id: 'j3', mode: 'road', from: 'Reykjavik', to: 'Vík' }],
    createdAt: now - day * 400,
    updatedAt: now,
  },
];

const nextYear = new Date().getFullYear() + 1;

export const SEED_TRIPS: Trip[] = [
  {
    id: 't1',
    userId: 'demo',
    memberIds: ['demo'],
    title: 'New Zealand adventure',
    countryCode: 'NZ',
    startDate: `${nextYear}-02-10`,
    endDate: `${nextYear}-02-26`,
    itinerary: [],
    note: 'Milford Sound + the South Island road trip.',
    createdAt: now,
    updatedAt: now,
  },
];
