// Curated reference facts for the Explore browser, baked in so the feature
// works offline/in demo mode with no API. Figures are approximate, rounded for
// display. `temps` are average daily temperatures (°C) by month (Jan→Dec) for a
// representative city. Countries without an entry still appear in Explore — the
// card simply shows whatever is known and notes that detail is coming.

export interface CountryFacts {
  capital: string;
  /** Approximate population (people). */
  population: number;
  /** Total area in km². */
  areaKm2: number;
  /** Currency name + ISO code, e.g. "Euro (EUR)". */
  currency: string;
  /** Average daily temperature (°C) per month, Jan→Dec. */
  temps?: number[];
  /** Well-known landmarks / sightseeing highlights. */
  landmarks?: string[];
}

export const COUNTRY_FACTS: Record<string, CountryFacts> = {
  // ── Europe ────────────────────────────────────────────────────────────────
  GB: { capital: 'London', population: 67_000_000, areaKm2: 242_500, currency: 'Pound sterling (GBP)', temps: [5, 5, 7, 9, 13, 16, 18, 18, 15, 11, 8, 6], landmarks: ['Big Ben & Westminster', 'Tower of London', 'Stonehenge', 'Edinburgh Castle'] },
  FR: { capital: 'Paris', population: 68_000_000, areaKm2: 551_700, currency: 'Euro (EUR)', temps: [5, 6, 9, 12, 16, 19, 21, 21, 18, 13, 8, 6], landmarks: ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Mont Saint-Michel'] },
  ES: { capital: 'Madrid', population: 48_000_000, areaKm2: 505_990, currency: 'Euro (EUR)', temps: [6, 8, 11, 13, 17, 23, 26, 26, 21, 15, 9, 6], landmarks: ['Sagrada Família', 'Alhambra', 'Park Güell', 'Plaza Mayor'] },
  IT: { capital: 'Rome', population: 59_000_000, areaKm2: 301_340, currency: 'Euro (EUR)', temps: [8, 9, 11, 14, 18, 22, 25, 25, 22, 17, 12, 9], landmarks: ['Colosseum', 'Venice Canals', 'Leaning Tower of Pisa', 'Vatican City'] },
  DE: { capital: 'Berlin', population: 84_000_000, areaKm2: 357_590, currency: 'Euro (EUR)', temps: [1, 2, 5, 10, 15, 18, 20, 19, 15, 10, 5, 2], landmarks: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral', 'Berlin Wall'] },
  PT: { capital: 'Lisbon', population: 10_300_000, areaKm2: 92_210, currency: 'Euro (EUR)', temps: [11, 12, 14, 16, 18, 21, 23, 24, 22, 18, 14, 12], landmarks: ['Belém Tower', 'Pena Palace', 'Douro Valley', 'Jerónimos Monastery'] },
  NL: { capital: 'Amsterdam', population: 17_800_000, areaKm2: 41_540, currency: 'Euro (EUR)', temps: [3, 3, 6, 9, 13, 16, 18, 18, 15, 11, 7, 4], landmarks: ['Anne Frank House', 'Rijksmuseum', 'Keukenhof Gardens', 'Canal Ring'] },
  GR: { capital: 'Athens', population: 10_400_000, areaKm2: 131_960, currency: 'Euro (EUR)', temps: [10, 10, 12, 16, 21, 26, 29, 29, 25, 20, 15, 11], landmarks: ['Acropolis', 'Santorini', 'Meteora', 'Delphi'] },
  CH: { capital: 'Bern', population: 8_800_000, areaKm2: 41_290, currency: 'Swiss franc (CHF)', temps: [0, 2, 6, 10, 14, 18, 20, 19, 15, 10, 5, 1], landmarks: ['Matterhorn', 'Lake Geneva', 'Jungfraujoch', 'Chapel Bridge'] },
  AT: { capital: 'Vienna', population: 9_100_000, areaKm2: 83_880, currency: 'Euro (EUR)', temps: [1, 3, 7, 12, 17, 20, 22, 22, 17, 11, 6, 2], landmarks: ['Schönbrunn Palace', 'St. Stephen’s Cathedral', 'Hallstatt', 'Salzburg Old Town'] },
  IE: { capital: 'Dublin', population: 5_100_000, areaKm2: 70_270, currency: 'Euro (EUR)', temps: [5, 5, 7, 9, 11, 14, 16, 16, 14, 11, 7, 6], landmarks: ['Cliffs of Moher', 'Guinness Storehouse', 'Ring of Kerry', 'Trinity College'] },
  IS: { capital: 'Reykjavík', population: 380_000, areaKm2: 103_000, currency: 'Icelandic króna (ISK)', temps: [0, 1, 2, 4, 7, 10, 12, 11, 8, 5, 2, 0], landmarks: ['Blue Lagoon', 'Golden Circle', 'Northern Lights', 'Jökulsárlón'] },
  NO: { capital: 'Oslo', population: 5_500_000, areaKm2: 385_210, currency: 'Norwegian krone (NOK)', temps: [-4, -3, 0, 5, 11, 15, 17, 16, 11, 6, 1, -3], landmarks: ['Geirangerfjord', 'Bryggen, Bergen', 'Lofoten Islands', 'Nordkapp'] },
  SE: { capital: 'Stockholm', population: 10_600_000, areaKm2: 450_300, currency: 'Swedish krona (SEK)', temps: [-2, -2, 1, 6, 12, 16, 18, 17, 12, 7, 3, -1], landmarks: ['Gamla Stan', 'Vasa Museum', 'Icehotel', 'Drottningholm Palace'] },
  HR: { capital: 'Zagreb', population: 3_850_000, areaKm2: 56_590, currency: 'Euro (EUR)', temps: [1, 3, 8, 12, 17, 21, 23, 22, 18, 12, 7, 2], landmarks: ['Dubrovnik Old Town', 'Plitvice Lakes', 'Diocletian’s Palace', 'Hvar'] },
  CZ: { capital: 'Prague', population: 10_500_000, areaKm2: 78_870, currency: 'Czech koruna (CZK)', temps: [0, 1, 5, 10, 15, 18, 20, 20, 15, 10, 4, 1], landmarks: ['Charles Bridge', 'Prague Castle', 'Old Town Square', 'Český Krumlov'] },
  TR: { capital: 'Ankara', population: 85_000_000, areaKm2: 783_560, currency: 'Turkish lira (TRY)', temps: [0, 2, 6, 11, 16, 20, 23, 23, 18, 13, 7, 2], landmarks: ['Hagia Sophia', 'Cappadocia', 'Pamukkale', 'Ephesus'] },
  RU: { capital: 'Moscow', population: 144_000_000, areaKm2: 17_098_240, currency: 'Russian ruble (RUB)', temps: [-9, -7, -1, 7, 14, 18, 20, 18, 12, 5, -2, -6], landmarks: ['Red Square', 'Saint Basil’s Cathedral', 'The Hermitage', 'Kremlin'] },
  BE: { capital: 'Brussels', population: 11_700_000, areaKm2: 30_530, currency: 'Euro (EUR)', temps: [4, 4, 7, 10, 14, 17, 19, 19, 16, 12, 7, 4], landmarks: ['Grand-Place', 'Atomium', 'Bruges Canals', 'Manneken Pis'] },
  PL: { capital: 'Warsaw', population: 37_700_000, areaKm2: 312_700, currency: 'Polish złoty (PLN)', temps: [-2, -1, 3, 9, 14, 17, 19, 19, 14, 9, 4, 0], landmarks: ['Wawel Castle', 'Auschwitz-Birkenau', 'Old Town Warsaw', 'Wieliczka Salt Mine'] },
  HU: { capital: 'Budapest', population: 9_600_000, areaKm2: 93_030, currency: 'Hungarian forint (HUF)', temps: [0, 2, 7, 12, 17, 20, 22, 22, 17, 11, 5, 1], landmarks: ['Parliament Building', 'Buda Castle', 'Széchenyi Baths', 'Fisherman’s Bastion'] },

  // ── Asia ──────────────────────────────────────────────────────────────────
  JP: { capital: 'Tokyo', population: 125_000_000, areaKm2: 377_975, currency: 'Japanese yen (JPY)', temps: [6, 7, 10, 15, 19, 22, 26, 27, 24, 19, 13, 8], landmarks: ['Mount Fuji', 'Fushimi Inari Shrine', 'Senso-ji Temple', 'Itsukushima Shrine'] },
  CN: { capital: 'Beijing', population: 1_412_000_000, areaKm2: 9_596_960, currency: 'Renminbi (CNY)', temps: [-3, 0, 6, 14, 20, 24, 26, 25, 20, 13, 4, -2], landmarks: ['Great Wall of China', 'Forbidden City', 'Terracotta Army', 'Li River'] },
  TH: { capital: 'Bangkok', population: 72_000_000, areaKm2: 513_120, currency: 'Thai baht (THB)', temps: [27, 28, 30, 31, 30, 29, 29, 29, 28, 28, 27, 26], landmarks: ['Grand Palace', 'Wat Arun', 'Phi Phi Islands', 'Ayutthaya'] },
  VN: { capital: 'Hanoi', population: 99_000_000, areaKm2: 331_210, currency: 'Vietnamese đồng (VND)', temps: [17, 18, 21, 24, 28, 30, 30, 29, 28, 26, 22, 18], landmarks: ['Ha Long Bay', 'Hoi An Old Town', 'Cu Chi Tunnels', 'Golden Bridge'] },
  IN: { capital: 'New Delhi', population: 1_417_000_000, areaKm2: 3_287_260, currency: 'Indian rupee (INR)', temps: [14, 17, 23, 29, 33, 34, 31, 30, 29, 26, 20, 15], landmarks: ['Taj Mahal', 'Amber Fort', 'Golden Temple', 'Gateway of India'] },
  ID: { capital: 'Jakarta', population: 277_000_000, areaKm2: 1_904_570, currency: 'Indonesian rupiah (IDR)', temps: [26, 27, 27, 28, 28, 28, 28, 28, 28, 28, 27, 27], landmarks: ['Borobudur', 'Bali Rice Terraces', 'Mount Bromo', 'Komodo National Park'] },
  SG: { capital: 'Singapore', population: 5_900_000, areaKm2: 728, currency: 'Singapore dollar (SGD)', temps: [27, 27, 28, 28, 29, 29, 28, 28, 28, 28, 27, 27], landmarks: ['Gardens by the Bay', 'Marina Bay Sands', 'Merlion', 'Sentosa'] },
  AE: { capital: 'Abu Dhabi', population: 9_900_000, areaKm2: 83_600, currency: 'UAE dirham (AED)', temps: [19, 21, 24, 28, 33, 35, 37, 37, 34, 30, 25, 21], landmarks: ['Burj Khalifa', 'Sheikh Zayed Mosque', 'Palm Jumeirah', 'Dubai Mall'] },
  MY: { capital: 'Kuala Lumpur', population: 33_900_000, areaKm2: 330_800, currency: 'Malaysian ringgit (MYR)', temps: [27, 28, 28, 28, 28, 28, 28, 28, 27, 27, 27, 27], landmarks: ['Petronas Towers', 'Batu Caves', 'George Town', 'Mount Kinabalu'] },
  KR: { capital: 'Seoul', population: 51_700_000, areaKm2: 100_210, currency: 'South Korean won (KRW)', temps: [-2, 1, 6, 13, 18, 23, 26, 26, 21, 14, 7, 0], landmarks: ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'Jeju Island', 'N Seoul Tower'] },
  LK: { capital: 'Colombo', population: 22_000_000, areaKm2: 65_610, currency: 'Sri Lankan rupee (LKR)', temps: [27, 27, 28, 28, 28, 28, 28, 28, 27, 27, 27, 27], landmarks: ['Sigiriya', 'Temple of the Tooth', 'Galle Fort', 'Yala National Park'] },
  IL: { capital: 'Jerusalem', population: 9_700_000, areaKm2: 22_070, currency: 'Israeli new shekel (ILS)', temps: [9, 10, 13, 17, 21, 23, 25, 25, 24, 21, 15, 11], landmarks: ['Western Wall', 'Old City of Jerusalem', 'Dead Sea', 'Masada'] },

  // ── Africa ────────────────────────────────────────────────────────────────
  EG: { capital: 'Cairo', population: 111_000_000, areaKm2: 1_001_450, currency: 'Egyptian pound (EGP)', temps: [14, 15, 18, 22, 26, 28, 29, 29, 27, 24, 19, 15], landmarks: ['Pyramids of Giza', 'Great Sphinx', 'Karnak Temple', 'Valley of the Kings'] },
  MA: { capital: 'Rabat', population: 37_800_000, areaKm2: 446_550, currency: 'Moroccan dirham (MAD)', temps: [13, 14, 16, 17, 20, 22, 25, 26, 24, 21, 17, 14], landmarks: ['Jemaa el-Fnaa', 'Hassan II Mosque', 'Chefchaouen', 'Sahara Desert'] },
  ZA: { capital: 'Pretoria', population: 60_000_000, areaKm2: 1_221_040, currency: 'South African rand (ZAR)', temps: [23, 23, 21, 18, 15, 12, 12, 15, 18, 19, 21, 22], landmarks: ['Table Mountain', 'Kruger National Park', 'Cape of Good Hope', 'Robben Island'] },
  KE: { capital: 'Nairobi', population: 54_000_000, areaKm2: 580_370, currency: 'Kenyan shilling (KES)', temps: [19, 20, 20, 20, 19, 17, 16, 17, 18, 19, 18, 18], landmarks: ['Maasai Mara', 'Mount Kenya', 'Amboseli', 'Lake Nakuru'] },
  TZ: { capital: 'Dodoma', population: 65_000_000, areaKm2: 945_090, currency: 'Tanzanian shilling (TZS)', temps: [24, 24, 24, 23, 22, 20, 20, 21, 22, 24, 24, 24], landmarks: ['Mount Kilimanjaro', 'Serengeti', 'Ngorongoro Crater', 'Zanzibar'] },

  // ── North America ─────────────────────────────────────────────────────────
  US: { capital: 'Washington, D.C.', population: 333_000_000, areaKm2: 9_833_520, currency: 'US dollar (USD)', temps: [2, 4, 9, 14, 20, 25, 27, 26, 22, 16, 10, 4], landmarks: ['Statue of Liberty', 'Grand Canyon', 'Golden Gate Bridge', 'Yellowstone'] },
  CA: { capital: 'Ottawa', population: 39_000_000, areaKm2: 9_984_670, currency: 'Canadian dollar (CAD)', temps: [-10, -8, -2, 6, 13, 19, 21, 20, 15, 8, 1, -7], landmarks: ['Niagara Falls', 'Banff National Park', 'CN Tower', 'Old Quebec'] },
  MX: { capital: 'Mexico City', population: 128_000_000, areaKm2: 1_964_380, currency: 'Mexican peso (MXN)', temps: [14, 16, 18, 19, 19, 18, 17, 17, 17, 16, 15, 14], landmarks: ['Chichén Itzá', 'Teotihuacán', 'Tulum', 'Frida Kahlo Museum'] },
  CR: { capital: 'San José', population: 5_200_000, areaKm2: 51_100, currency: 'Costa Rican colón (CRC)', temps: [19, 19, 20, 21, 21, 20, 20, 20, 20, 20, 20, 19], landmarks: ['Arenal Volcano', 'Monteverde Cloud Forest', 'Manuel Antonio', 'Tortuguero'] },
  CU: { capital: 'Havana', population: 11_000_000, areaKm2: 109_880, currency: 'Cuban peso (CUP)', temps: [22, 23, 24, 25, 26, 27, 28, 28, 27, 26, 24, 23], landmarks: ['Old Havana', 'Varadero Beach', 'Viñales Valley', 'Trinidad'] },

  // ── South America ─────────────────────────────────────────────────────────
  BR: { capital: 'Brasília', population: 215_000_000, areaKm2: 8_515_770, currency: 'Brazilian real (BRL)', temps: [26, 26, 26, 25, 23, 22, 22, 23, 24, 25, 25, 26], landmarks: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Iguaçu Falls', 'Amazon Rainforest'] },
  AR: { capital: 'Buenos Aires', population: 46_000_000, areaKm2: 2_780_400, currency: 'Argentine peso (ARS)', temps: [25, 24, 22, 18, 15, 12, 11, 13, 15, 18, 21, 24], landmarks: ['Iguazú Falls', 'Perito Moreno Glacier', 'La Boca', 'Ushuaia'] },
  PE: { capital: 'Lima', population: 34_000_000, areaKm2: 1_285_220, currency: 'Peruvian sol (PEN)', temps: [23, 24, 23, 22, 20, 18, 17, 17, 17, 18, 20, 22], landmarks: ['Machu Picchu', 'Cusco', 'Lake Titicaca', 'Nazca Lines'] },
  CL: { capital: 'Santiago', population: 19_600_000, areaKm2: 756_700, currency: 'Chilean peso (CLP)', temps: [21, 20, 18, 15, 12, 9, 9, 10, 12, 15, 18, 20], landmarks: ['Torres del Paine', 'Atacama Desert', 'Easter Island', 'Valparaíso'] },
  CO: { capital: 'Bogotá', population: 52_000_000, areaKm2: 1_141_750, currency: 'Colombian peso (COP)', temps: [14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 14, 14], landmarks: ['Cartagena Old Town', 'Caño Cristales', 'Coffee Region', 'Tayrona Park'] },

  // ── Oceania ───────────────────────────────────────────────────────────────
  AU: { capital: 'Canberra', population: 26_000_000, areaKm2: 7_692_020, currency: 'Australian dollar (AUD)', temps: [28, 28, 26, 22, 19, 16, 16, 17, 20, 22, 24, 26], landmarks: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru', 'Twelve Apostles'] },
  NZ: { capital: 'Wellington', population: 5_200_000, areaKm2: 268_840, currency: 'New Zealand dollar (NZD)', temps: [17, 17, 16, 14, 12, 10, 9, 10, 11, 13, 14, 16], landmarks: ['Milford Sound', 'Hobbiton', 'Rotorua', 'Franz Josef Glacier'] },
  FJ: { capital: 'Suva', population: 925_000, areaKm2: 18_270, currency: 'Fijian dollar (FJD)', temps: [27, 27, 27, 26, 25, 24, 23, 24, 24, 25, 26, 27], landmarks: ['Mamanuca Islands', 'Coral Coast', 'Garden of the Sleeping Giant', 'Sabeto Hot Springs'] },
};

export function countryFacts(code: string): CountryFacts | undefined {
  return COUNTRY_FACTS[code];
}
