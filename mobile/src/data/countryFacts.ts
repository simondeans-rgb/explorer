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
  GB: { capital: 'London', population: 67_000_000, areaKm2: 242_500, currency: 'Pound sterling (GBP)', temps: [5, 5, 7, 9, 13, 16, 18, 18, 15, 11, 8, 6], landmarks: ['Big Ben & Westminster', 'Tower of London', 'Stonehenge', 'Edinburgh Castle', 'Buckingham Palace', 'London Eye', 'Roman Baths', 'Lake District'] },
  FR: { capital: 'Paris', population: 68_000_000, areaKm2: 551_700, currency: 'Euro (EUR)', temps: [5, 6, 9, 12, 16, 19, 21, 21, 18, 13, 8, 6], landmarks: ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Mont Saint-Michel', 'Notre-Dame de Paris', 'Arc de Triomphe', 'French Riviera', 'Loire Valley'] },
  ES: { capital: 'Madrid', population: 48_000_000, areaKm2: 505_990, currency: 'Euro (EUR)', temps: [6, 8, 11, 13, 17, 23, 26, 26, 21, 15, 9, 6], landmarks: ['Sagrada Família', 'Alhambra', 'Park Güell', 'Plaza Mayor', 'Royal Palace of Madrid', 'Seville Cathedral', 'Guggenheim Museum Bilbao', 'Montserrat'] },
  IT: { capital: 'Rome', population: 59_000_000, areaKm2: 301_340, currency: 'Euro (EUR)', temps: [8, 9, 11, 14, 18, 22, 25, 25, 22, 17, 12, 9], landmarks: ['Colosseum', 'Venice Canals', 'Leaning Tower of Pisa', 'Vatican City', 'Florence Cathedral', 'Amalfi Coast', 'Pompeii', 'Trevi Fountain'] },
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
  JP: { capital: 'Tokyo', population: 125_000_000, areaKm2: 377_975, currency: 'Japanese yen (JPY)', temps: [6, 7, 10, 15, 19, 22, 26, 27, 24, 19, 13, 8], landmarks: ['Mount Fuji', 'Fushimi Inari Shrine', 'Senso-ji Temple', 'Itsukushima Shrine', 'Tokyo Skytree', 'Kinkaku-ji', 'Osaka Castle', 'Arashiyama Bamboo Grove'] },
  CN: { capital: 'Beijing', population: 1_412_000_000, areaKm2: 9_596_960, currency: 'Renminbi (CNY)', temps: [-3, 0, 6, 14, 20, 24, 26, 25, 20, 13, 4, -2], landmarks: ['Great Wall of China', 'Forbidden City', 'Terracotta Army', 'Li River', 'The Bund', 'West Lake', 'Potala Palace', 'Zhangjiajie National Forest Park'] },
  TH: { capital: 'Bangkok', population: 72_000_000, areaKm2: 513_120, currency: 'Thai baht (THB)', temps: [27, 28, 30, 31, 30, 29, 29, 29, 28, 28, 27, 26], landmarks: ['Grand Palace', 'Wat Arun', 'Phi Phi Islands', 'Ayutthaya', 'Wat Pho', 'Railay Beach', 'Wat Phra Kaew', 'Khao Sok National Park'] },
  VN: { capital: 'Hanoi', population: 99_000_000, areaKm2: 331_210, currency: 'Vietnamese đồng (VND)', temps: [17, 18, 21, 24, 28, 30, 30, 29, 28, 26, 22, 18], landmarks: ['Ha Long Bay', 'Hoi An Old Town', 'Cu Chi Tunnels', 'Golden Bridge'] },
  IN: { capital: 'New Delhi', population: 1_417_000_000, areaKm2: 3_287_260, currency: 'Indian rupee (INR)', temps: [14, 17, 23, 29, 33, 34, 31, 30, 29, 26, 20, 15], landmarks: ['Taj Mahal', 'Amber Fort', 'Golden Temple', 'Gateway of India', 'Hawa Mahal', 'Red Fort', 'Qutub Minar', 'Varanasi'] },
  ID: { capital: 'Jakarta', population: 277_000_000, areaKm2: 1_904_570, currency: 'Indonesian rupiah (IDR)', temps: [26, 27, 27, 28, 28, 28, 28, 28, 28, 28, 27, 27], landmarks: ['Borobudur', 'Bali Rice Terraces', 'Mount Bromo', 'Komodo National Park'] },
  SG: { capital: 'Singapore', population: 5_900_000, areaKm2: 728, currency: 'Singapore dollar (SGD)', temps: [27, 27, 28, 28, 29, 29, 28, 28, 28, 28, 27, 27], landmarks: ['Gardens by the Bay', 'Marina Bay Sands', 'Merlion', 'Sentosa'] },
  AE: { capital: 'Abu Dhabi', population: 9_900_000, areaKm2: 83_600, currency: 'UAE dirham (AED)', temps: [19, 21, 24, 28, 33, 35, 37, 37, 34, 30, 25, 21], landmarks: ['Burj Khalifa', 'Sheikh Zayed Mosque', 'Palm Jumeirah', 'Dubai Mall', 'Burj Al Arab', 'Louvre Abu Dhabi', 'Dubai Fountain', 'Ferrari World'] },
  MY: { capital: 'Kuala Lumpur', population: 33_900_000, areaKm2: 330_800, currency: 'Malaysian ringgit (MYR)', temps: [27, 28, 28, 28, 28, 28, 28, 28, 27, 27, 27, 27], landmarks: ['Petronas Towers', 'Batu Caves', 'George Town', 'Mount Kinabalu'] },
  KR: { capital: 'Seoul', population: 51_700_000, areaKm2: 100_210, currency: 'South Korean won (KRW)', temps: [-2, 1, 6, 13, 18, 23, 26, 26, 21, 14, 7, 0], landmarks: ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'Jeju Island', 'N Seoul Tower'] },
  LK: { capital: 'Colombo', population: 22_000_000, areaKm2: 65_610, currency: 'Sri Lankan rupee (LKR)', temps: [27, 27, 28, 28, 28, 28, 28, 28, 27, 27, 27, 27], landmarks: ['Sigiriya', 'Temple of the Tooth', 'Galle Fort', 'Yala National Park'] },
  IL: { capital: 'Jerusalem', population: 9_700_000, areaKm2: 22_070, currency: 'Israeli new shekel (ILS)', temps: [9, 10, 13, 17, 21, 23, 25, 25, 24, 21, 15, 11], landmarks: ['Western Wall', 'Old City of Jerusalem', 'Dead Sea', 'Masada'] },

  // ── Africa ────────────────────────────────────────────────────────────────
  EG: { capital: 'Cairo', population: 111_000_000, areaKm2: 1_001_450, currency: 'Egyptian pound (EGP)', temps: [14, 15, 18, 22, 26, 28, 29, 29, 27, 24, 19, 15], landmarks: ['Pyramids of Giza', 'Great Sphinx', 'Karnak Temple', 'Valley of the Kings', 'Abu Simbel', 'Luxor Temple', 'Egyptian Museum', 'Khan el-Khalili'] },
  MA: { capital: 'Rabat', population: 37_800_000, areaKm2: 446_550, currency: 'Moroccan dirham (MAD)', temps: [13, 14, 16, 17, 20, 22, 25, 26, 24, 21, 17, 14], landmarks: ['Jemaa el-Fnaa', 'Hassan II Mosque', 'Chefchaouen', 'Sahara Desert'] },
  ZA: { capital: 'Pretoria', population: 60_000_000, areaKm2: 1_221_040, currency: 'South African rand (ZAR)', temps: [23, 23, 21, 18, 15, 12, 12, 15, 18, 19, 21, 22], landmarks: ['Table Mountain', 'Kruger National Park', 'Cape of Good Hope', 'Robben Island'] },
  KE: { capital: 'Nairobi', population: 54_000_000, areaKm2: 580_370, currency: 'Kenyan shilling (KES)', temps: [19, 20, 20, 20, 19, 17, 16, 17, 18, 19, 18, 18], landmarks: ['Maasai Mara', 'Mount Kenya', 'Amboseli', 'Lake Nakuru'] },
  TZ: { capital: 'Dodoma', population: 65_000_000, areaKm2: 945_090, currency: 'Tanzanian shilling (TZS)', temps: [24, 24, 24, 23, 22, 20, 20, 21, 22, 24, 24, 24], landmarks: ['Mount Kilimanjaro', 'Serengeti', 'Ngorongoro Crater', 'Zanzibar'] },

  // ── North America ─────────────────────────────────────────────────────────
  US: { capital: 'Washington, D.C.', population: 333_000_000, areaKm2: 9_833_520, currency: 'US dollar (USD)', temps: [2, 4, 9, 14, 20, 25, 27, 26, 22, 16, 10, 4], landmarks: ['Statue of Liberty', 'Grand Canyon', 'Golden Gate Bridge', 'Yellowstone National Park', 'Times Square', 'Walt Disney World', 'Niagara Falls', 'Mount Rushmore', 'Yosemite National Park', 'Las Vegas Strip'] },
  CA: { capital: 'Ottawa', population: 39_000_000, areaKm2: 9_984_670, currency: 'Canadian dollar (CAD)', temps: [-10, -8, -2, 6, 13, 19, 21, 20, 15, 8, 1, -7], landmarks: ['Niagara Falls', 'Banff National Park', 'CN Tower', 'Old Quebec'] },
  MX: { capital: 'Mexico City', population: 128_000_000, areaKm2: 1_964_380, currency: 'Mexican peso (MXN)', temps: [14, 16, 18, 19, 19, 18, 17, 17, 17, 16, 15, 14], landmarks: ['Chichén Itzá', 'Teotihuacán', 'Tulum', 'Frida Kahlo Museum', 'Cancún', 'Palenque', 'Copper Canyon', 'Cabo San Lucas'] },
  CR: { capital: 'San José', population: 5_200_000, areaKm2: 51_100, currency: 'Costa Rican colón (CRC)', temps: [19, 19, 20, 21, 21, 20, 20, 20, 20, 20, 20, 19], landmarks: ['Arenal Volcano', 'Monteverde Cloud Forest', 'Manuel Antonio', 'Tortuguero'] },
  CU: { capital: 'Havana', population: 11_000_000, areaKm2: 109_880, currency: 'Cuban peso (CUP)', temps: [22, 23, 24, 25, 26, 27, 28, 28, 27, 26, 24, 23], landmarks: ['Old Havana', 'Varadero Beach', 'Viñales Valley', 'Trinidad'] },

  // ── South America ─────────────────────────────────────────────────────────
  BR: { capital: 'Brasília', population: 215_000_000, areaKm2: 8_515_770, currency: 'Brazilian real (BRL)', temps: [26, 26, 26, 25, 23, 22, 22, 23, 24, 25, 25, 26], landmarks: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Iguaçu Falls', 'Amazon Rainforest'] },
  AR: { capital: 'Buenos Aires', population: 46_000_000, areaKm2: 2_780_400, currency: 'Argentine peso (ARS)', temps: [25, 24, 22, 18, 15, 12, 11, 13, 15, 18, 21, 24], landmarks: ['Iguazú Falls', 'Perito Moreno Glacier', 'La Boca', 'Ushuaia'] },
  PE: { capital: 'Lima', population: 34_000_000, areaKm2: 1_285_220, currency: 'Peruvian sol (PEN)', temps: [23, 24, 23, 22, 20, 18, 17, 17, 17, 18, 20, 22], landmarks: ['Machu Picchu', 'Cusco', 'Lake Titicaca', 'Nazca Lines'] },
  CL: { capital: 'Santiago', population: 19_600_000, areaKm2: 756_700, currency: 'Chilean peso (CLP)', temps: [21, 20, 18, 15, 12, 9, 9, 10, 12, 15, 18, 20], landmarks: ['Torres del Paine', 'Atacama Desert', 'Easter Island', 'Valparaíso'] },
  CO: { capital: 'Bogotá', population: 52_000_000, areaKm2: 1_141_750, currency: 'Colombian peso (COP)', temps: [14, 14, 14, 14, 14, 14, 13, 13, 13, 14, 14, 14], landmarks: ['Cartagena Old Town', 'Caño Cristales', 'Coffee Region', 'Tayrona Park'] },

  // ── Oceania ───────────────────────────────────────────────────────────────
  AU: { capital: 'Canberra', population: 26_000_000, areaKm2: 7_692_020, currency: 'Australian dollar (AUD)', temps: [28, 28, 26, 22, 19, 16, 16, 17, 20, 22, 24, 26], landmarks: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru', 'Twelve Apostles', 'Sydney Harbour Bridge', 'Bondi Beach', 'Blue Mountains', 'Kakadu National Park'] },
  NZ: { capital: 'Wellington', population: 5_200_000, areaKm2: 268_840, currency: 'New Zealand dollar (NZD)', temps: [17, 17, 16, 14, 12, 10, 9, 10, 11, 13, 14, 16], landmarks: ['Milford Sound', 'Hobbiton', 'Rotorua', 'Franz Josef Glacier'] },
  FJ: { capital: 'Suva', population: 925_000, areaKm2: 18_270, currency: 'Fijian dollar (FJD)', temps: [27, 27, 27, 26, 25, 24, 23, 24, 24, 25, 26, 27], landmarks: ['Mamanuca Islands', 'Coral Coast', 'Garden of the Sleeping Giant', 'Sabeto Hot Springs'] },

  // ── Europe (batch 2) ────────────────────────────────────────────────────────
  DK: { capital: 'Copenhagen', population: 5_900_000, areaKm2: 42_930, currency: 'Danish krone (DKK)', temps: [1, 1, 3, 8, 13, 16, 18, 18, 14, 10, 5, 2], landmarks: ['Nyhavn', 'Tivoli Gardens', 'The Little Mermaid', 'Kronborg Castle'] },
  FI: { capital: 'Helsinki', population: 5_500_000, areaKm2: 338_420, currency: 'Euro (EUR)', temps: [-4, -5, -1, 4, 11, 15, 18, 16, 11, 6, 1, -2], landmarks: ['Suomenlinna', 'Lapland', 'Helsinki Cathedral', 'Northern Lights'] },
  RO: { capital: 'Bucharest', population: 19_000_000, areaKm2: 238_400, currency: 'Romanian leu (RON)', temps: [0, 2, 7, 13, 18, 22, 24, 24, 19, 13, 6, 1], landmarks: ['Bran Castle', 'Palace of the Parliament', 'Transfăgărășan', 'Painted Monasteries'] },
  BG: { capital: 'Sofia', population: 6_500_000, areaKm2: 110_990, currency: 'Bulgarian lev (BGN)', temps: [0, 2, 6, 11, 16, 20, 22, 22, 17, 11, 6, 1], landmarks: ['Rila Monastery', 'Alexander Nevsky Cathedral', 'Old Town Plovdiv', 'Black Sea Coast'] },
  RS: { capital: 'Belgrade', population: 6_700_000, areaKm2: 88_360, currency: 'Serbian dinar (RSD)', temps: [1, 3, 8, 13, 18, 21, 23, 23, 18, 13, 7, 2], landmarks: ['Belgrade Fortress', 'Skadarlija', 'Studenica Monastery', 'Drvengrad'] },
  SK: { capital: 'Bratislava', population: 5_400_000, areaKm2: 49_040, currency: 'Euro (EUR)', temps: [0, 2, 6, 12, 17, 20, 22, 21, 16, 11, 5, 1], landmarks: ['Bratislava Castle', 'Spiš Castle', 'High Tatras', 'Old Town'] },
  SI: { capital: 'Ljubljana', population: 2_100_000, areaKm2: 20_270, currency: 'Euro (EUR)', temps: [0, 2, 7, 11, 16, 20, 22, 21, 16, 11, 5, 1], landmarks: ['Lake Bled', 'Ljubljana Castle', 'Postojna Cave', 'Triglav National Park'] },
  EE: { capital: 'Tallinn', population: 1_300_000, areaKm2: 45_340, currency: 'Euro (EUR)', temps: [-4, -5, -1, 5, 11, 15, 18, 16, 12, 6, 1, -2], landmarks: ['Tallinn Old Town', 'Toompea Castle', 'Lahemaa National Park', 'Kadriorg Palace'] },
  LV: { capital: 'Riga', population: 1_850_000, areaKm2: 64_590, currency: 'Euro (EUR)', temps: [-3, -4, 0, 6, 12, 16, 18, 17, 12, 7, 2, -2], landmarks: ['Riga Old Town', 'House of the Black Heads', 'Jūrmala', 'Gauja National Park'] },
  LT: { capital: 'Vilnius', population: 2_800_000, areaKm2: 65_300, currency: 'Euro (EUR)', temps: [-3, -3, 1, 8, 14, 17, 19, 18, 13, 7, 2, -2], landmarks: ['Vilnius Old Town', 'Trakai Castle', 'Hill of Crosses', 'Curonian Spit'] },
  MT: { capital: 'Valletta', population: 540_000, areaKm2: 320, currency: 'Euro (EUR)', temps: [13, 13, 14, 16, 20, 24, 27, 27, 25, 22, 18, 15], landmarks: ['Valletta', 'Mdina', 'Blue Lagoon, Comino', 'Megalithic Temples'] },
  CY: { capital: 'Nicosia', population: 1_250_000, areaKm2: 9_250, currency: 'Euro (EUR)', temps: [12, 12, 14, 18, 23, 27, 30, 30, 27, 22, 17, 13], landmarks: ['Tombs of the Kings', 'Kourion', 'Troödos Mountains', 'Aphrodite’s Rock'] },
  LU: { capital: 'Luxembourg City', population: 660_000, areaKm2: 2_590, currency: 'Euro (EUR)', temps: [2, 3, 6, 10, 14, 17, 19, 19, 15, 11, 6, 3], landmarks: ['Bock Casemates', 'Old Quarter', 'Vianden Castle', 'Mullerthal Trail'] },
  MC: { capital: 'Monaco', population: 38_000, areaKm2: 2, currency: 'Euro (EUR)', temps: [10, 11, 13, 15, 18, 22, 25, 25, 22, 18, 14, 11], landmarks: ['Monte Carlo Casino', 'Prince’s Palace', 'Oceanographic Museum', 'Port Hercule'] },
  AL: { capital: 'Tirana', population: 2_800_000, areaKm2: 28_750, currency: 'Albanian lek (ALL)', temps: [7, 8, 11, 14, 19, 23, 26, 26, 22, 17, 12, 8], landmarks: ['Berat', 'Gjirokastër', 'Albanian Riviera', 'Butrint'] },
  UA: { capital: 'Kyiv', population: 38_000_000, areaKm2: 603_550, currency: 'Ukrainian hryvnia (UAH)', temps: [-3, -2, 3, 11, 17, 20, 22, 21, 16, 9, 3, -1], landmarks: ['Kyiv Pechersk Lavra', 'St. Sophia’s Cathedral', 'Lviv Old Town', 'Independence Square'] },

  // ── Asia (batch 2) ──────────────────────────────────────────────────────────
  PH: { capital: 'Manila', population: 113_000_000, areaKm2: 300_000, currency: 'Philippine peso (PHP)', temps: [26, 27, 28, 30, 30, 29, 28, 28, 28, 28, 28, 27], landmarks: ['Chocolate Hills', 'Banaue Rice Terraces', 'El Nido', 'Boracay'] },
  KH: { capital: 'Phnom Penh', population: 17_000_000, areaKm2: 181_040, currency: 'Cambodian riel (KHR)', temps: [27, 28, 29, 30, 30, 29, 28, 28, 28, 28, 27, 26], landmarks: ['Angkor Wat', 'Bayon Temple', 'Royal Palace', 'Ta Prohm'] },
  LA: { capital: 'Vientiane', population: 7_500_000, areaKm2: 236_800, currency: 'Lao kip (LAK)', temps: [22, 24, 27, 29, 29, 28, 28, 28, 27, 26, 24, 22], landmarks: ['Luang Prabang', 'Kuang Si Falls', 'Plain of Jars', 'Pha That Luang'] },
  NP: { capital: 'Kathmandu', population: 30_000_000, areaKm2: 147_180, currency: 'Nepalese rupee (NPR)', temps: [10, 13, 17, 20, 22, 23, 23, 23, 22, 19, 14, 11], landmarks: ['Mount Everest', 'Boudhanath Stupa', 'Pashupatinath', 'Pokhara'] },
  MV: { capital: 'Malé', population: 520_000, areaKm2: 300, currency: 'Maldivian rufiyaa (MVR)', temps: [28, 28, 29, 29, 29, 29, 28, 28, 28, 28, 28, 28], landmarks: ['Coral Atolls', 'Maafushi', 'HP Reef', 'Malé Friday Mosque'] },
  SA: { capital: 'Riyadh', population: 36_000_000, areaKm2: 2_149_690, currency: 'Saudi riyal (SAR)', temps: [14, 17, 22, 27, 33, 36, 37, 37, 33, 28, 21, 16], landmarks: ['Hegra (Mada’in Salih)', 'Edge of the World', 'Diriyah', 'Al-Masjid al-Haram'] },
  QA: { capital: 'Doha', population: 2_700_000, areaKm2: 11_590, currency: 'Qatari riyal (QAR)', temps: [18, 19, 23, 28, 33, 36, 37, 37, 34, 30, 25, 20], landmarks: ['Museum of Islamic Art', 'Souq Waqif', 'The Pearl', 'Katara Cultural Village'] },
  JO: { capital: 'Amman', population: 11_000_000, areaKm2: 89_320, currency: 'Jordanian dinar (JOD)', temps: [8, 9, 12, 16, 21, 24, 26, 26, 24, 20, 14, 10], landmarks: ['Petra', 'Wadi Rum', 'Dead Sea', 'Jerash'] },
  OM: { capital: 'Muscat', population: 4_600_000, areaKm2: 309_500, currency: 'Omani rial (OMR)', temps: [22, 23, 26, 30, 34, 35, 34, 32, 31, 29, 26, 23], landmarks: ['Sultan Qaboos Grand Mosque', 'Wahiba Sands', 'Jebel Akhdar', 'Mutrah Souq'] },
  LB: { capital: 'Beirut', population: 5_300_000, areaKm2: 10_450, currency: 'Lebanese pound (LBP)', temps: [14, 14, 16, 19, 22, 25, 27, 28, 27, 24, 19, 15], landmarks: ['Baalbek', 'Jeita Grotto', 'Byblos', 'Pigeon Rocks'] },
  TW: { capital: 'Taipei', population: 23_500_000, areaKm2: 36_190, currency: 'New Taiwan dollar (TWD)', temps: [16, 16, 18, 22, 25, 28, 29, 29, 27, 24, 21, 17], landmarks: ['Taipei 101', 'Taroko Gorge', 'Sun Moon Lake', 'Jiufen'] },
  HK: { capital: 'Hong Kong', population: 7_400_000, areaKm2: 1_110, currency: 'Hong Kong dollar (HKD)', temps: [16, 17, 19, 22, 26, 28, 29, 29, 28, 25, 22, 18], landmarks: ['Victoria Peak', 'Tian Tan Buddha', 'Star Ferry', 'Temple Street Night Market'] },
  BD: { capital: 'Dhaka', population: 171_000_000, areaKm2: 147_570, currency: 'Bangladeshi taka (BDT)', temps: [19, 22, 27, 29, 29, 29, 28, 28, 28, 27, 24, 20], landmarks: ['Sundarbans', 'Cox’s Bazar', 'Sixty Dome Mosque', 'Lalbagh Fort'] },
  KZ: { capital: 'Astana', population: 19_400_000, areaKm2: 2_724_900, currency: 'Kazakhstani tenge (KZT)', temps: [-14, -13, -6, 6, 14, 20, 22, 20, 14, 6, -4, -11], landmarks: ['Bayterek Tower', 'Charyn Canyon', 'Big Almaty Lake', 'Khan Shatyr'] },
  UZ: { capital: 'Tashkent', population: 35_000_000, areaKm2: 447_400, currency: 'Uzbekistani sum (UZS)', temps: [2, 4, 10, 16, 21, 26, 28, 26, 21, 14, 8, 4], landmarks: ['Registan, Samarkand', 'Bukhara Old City', 'Khiva', 'Shah-i-Zinda'] },
  GE: { capital: 'Tbilisi', population: 3_700_000, areaKm2: 69_700, currency: 'Georgian lari (GEL)', temps: [3, 4, 8, 13, 18, 22, 25, 25, 20, 14, 9, 5], landmarks: ['Old Tbilisi', 'Gergeti Trinity Church', 'Uplistsikhe', 'Vardzia'] },

  // ── Africa (batch 2) ──────────────────────────────────────────────────────
  TN: { capital: 'Tunis', population: 12_000_000, areaKm2: 163_610, currency: 'Tunisian dinar (TND)', temps: [12, 12, 14, 17, 21, 25, 28, 29, 26, 22, 17, 13], landmarks: ['Carthage', 'Sidi Bou Said', 'El Djem Amphitheatre', 'Medina of Tunis'] },
  NG: { capital: 'Abuja', population: 219_000_000, areaKm2: 923_770, currency: 'Nigerian naira (NGN)', temps: [27, 29, 30, 30, 28, 27, 25, 25, 26, 27, 27, 27], landmarks: ['Zuma Rock', 'Olumo Rock', 'Yankari National Park', 'Lekki Conservation Centre'] },
  GH: { capital: 'Accra', population: 33_000_000, areaKm2: 238_540, currency: 'Ghanaian cedi (GHS)', temps: [27, 28, 28, 28, 28, 26, 26, 25, 26, 27, 28, 27], landmarks: ['Cape Coast Castle', 'Kakum National Park', 'Lake Volta', 'Elmina Castle'] },
  ET: { capital: 'Addis Ababa', population: 123_000_000, areaKm2: 1_104_300, currency: 'Ethiopian birr (ETB)', temps: [16, 17, 18, 18, 18, 17, 16, 16, 16, 16, 15, 15], landmarks: ['Rock-Hewn Churches of Lalibela', 'Simien Mountains', 'Danakil Depression', 'Gondar Castles'] },
  ZW: { capital: 'Harare', population: 16_000_000, areaKm2: 390_760, currency: 'US dollar (USD)', temps: [21, 21, 20, 19, 16, 14, 14, 16, 19, 22, 22, 21], landmarks: ['Victoria Falls', 'Great Zimbabwe', 'Hwange National Park', 'Matobo Hills'] },
  NA: { capital: 'Windhoek', population: 2_600_000, areaKm2: 825_620, currency: 'Namibian dollar (NAD)', temps: [24, 23, 22, 20, 17, 14, 14, 17, 21, 23, 24, 24], landmarks: ['Sossusvlei', 'Etosha National Park', 'Fish River Canyon', 'Skeleton Coast'] },
  BW: { capital: 'Gaborone', population: 2_600_000, areaKm2: 581_730, currency: 'Botswana pula (BWP)', temps: [26, 25, 24, 21, 17, 14, 14, 17, 22, 25, 26, 26], landmarks: ['Okavango Delta', 'Chobe National Park', 'Makgadikgadi Pans', 'Tsodilo Hills'] },
  MU: { capital: 'Port Louis', population: 1_300_000, areaKm2: 2_040, currency: 'Mauritian rupee (MUR)', temps: [27, 27, 27, 26, 24, 23, 22, 22, 23, 24, 25, 26], landmarks: ['Le Morne Brabant', 'Chamarel Seven Coloured Earths', 'Black River Gorges', 'Île aux Cerfs'] },
  SC: { capital: 'Victoria', population: 100_000, areaKm2: 460, currency: 'Seychellois rupee (SCR)', temps: [27, 28, 28, 28, 28, 27, 26, 27, 27, 27, 27, 27], landmarks: ['Anse Source d’Argent', 'Vallée de Mai', 'Anse Lazio', 'Morne Seychellois'] },
  SN: { capital: 'Dakar', population: 17_000_000, areaKm2: 196_720, currency: 'West African CFA franc (XOF)', temps: [22, 22, 23, 23, 25, 27, 28, 28, 28, 28, 26, 23], landmarks: ['Gorée Island', 'Lake Retba', 'Djoudj Bird Sanctuary', 'African Renaissance Monument'] },
  UG: { capital: 'Kampala', population: 47_000_000, areaKm2: 241_550, currency: 'Ugandan shilling (UGX)', temps: [23, 23, 23, 22, 22, 21, 21, 21, 22, 22, 22, 22], landmarks: ['Bwindi Impenetrable Forest', 'Murchison Falls', 'Lake Bunyonyi', 'Source of the Nile'] },
  RW: { capital: 'Kigali', population: 13_500_000, areaKm2: 26_340, currency: 'Rwandan franc (RWF)', temps: [21, 21, 21, 20, 20, 21, 21, 22, 22, 21, 20, 20], landmarks: ['Volcanoes National Park', 'Lake Kivu', 'Nyungwe Forest', 'Kigali Genocide Memorial'] },
  DZ: { capital: 'Algiers', population: 45_000_000, areaKm2: 2_381_740, currency: 'Algerian dinar (DZD)', temps: [12, 13, 14, 16, 19, 23, 26, 27, 24, 21, 16, 13], landmarks: ['Casbah of Algiers', 'Timgad', 'Tassili n’Ajjer', 'Djémila'] },

  // ── North America & Caribbean (batch 2) ─────────────────────────────────────
  JM: { capital: 'Kingston', population: 2_800_000, areaKm2: 10_990, currency: 'Jamaican dollar (JMD)', temps: [26, 26, 26, 27, 28, 29, 29, 29, 28, 28, 27, 27], landmarks: ['Dunn’s River Falls', 'Blue Mountains', 'Seven Mile Beach', 'Bob Marley Museum'] },
  DO: { capital: 'Santo Domingo', population: 11_200_000, areaKm2: 48_670, currency: 'Dominican peso (DOP)', temps: [25, 25, 26, 26, 27, 28, 28, 28, 28, 28, 27, 26], landmarks: ['Zona Colonial', 'Punta Cana', 'Los Tres Ojos', 'Saona Island'] },
  PA: { capital: 'Panama City', population: 4_400_000, areaKm2: 75_420, currency: 'Panamanian balboa (PAB)', temps: [27, 27, 28, 28, 28, 27, 27, 27, 27, 26, 27, 27], landmarks: ['Panama Canal', 'Casco Viejo', 'San Blas Islands', 'Bocas del Toro'] },
  GT: { capital: 'Guatemala City', population: 18_000_000, areaKm2: 108_890, currency: 'Guatemalan quetzal (GTQ)', temps: [17, 18, 19, 20, 20, 20, 19, 19, 19, 19, 18, 17], landmarks: ['Tikal', 'Antigua Guatemala', 'Lake Atitlán', 'Semuc Champey'] },
  BS: { capital: 'Nassau', population: 410_000, areaKm2: 13_880, currency: 'Bahamian dollar (BSD)', temps: [22, 22, 23, 24, 26, 28, 28, 29, 28, 27, 25, 23], landmarks: ['Exuma Cays', 'Pink Sands Beach', 'Blue Lagoon Island', 'Atlantis Paradise Island'] },
  BB: { capital: 'Bridgetown', population: 280_000, areaKm2: 430, currency: 'Barbadian dollar (BBD)', temps: [25, 25, 26, 26, 27, 27, 27, 27, 27, 27, 26, 26], landmarks: ['Harrison’s Cave', 'Carlisle Bay', 'Bathsheba Beach', 'St. Nicholas Abbey'] },
  PR: { capital: 'San Juan', population: 3_200_000, areaKm2: 9_100, currency: 'US dollar (USD)', temps: [25, 25, 25, 26, 27, 28, 28, 28, 28, 28, 27, 26], landmarks: ['Old San Juan', 'El Yunque', 'Bioluminescent Bay', 'Castillo San Felipe del Morro'] },

  // ── South America (batch 2) ─────────────────────────────────────────────────
  EC: { capital: 'Quito', population: 18_000_000, areaKm2: 256_370, currency: 'US dollar (USD)', temps: [14, 14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 14], landmarks: ['Galápagos Islands', 'Quito Old Town', 'Cotopaxi', 'Mitad del Mundo'] },
  BO: { capital: 'La Paz (Sucre)', population: 12_000_000, areaKm2: 1_098_580, currency: 'Bolivian boliviano (BOB)', temps: [11, 11, 11, 10, 9, 8, 8, 9, 10, 12, 12, 12], landmarks: ['Salar de Uyuni', 'Lake Titicaca', 'Death Road', 'Tiwanaku'] },
  UY: { capital: 'Montevideo', population: 3_400_000, areaKm2: 176_220, currency: 'Uruguayan peso (UYU)', temps: [23, 23, 21, 18, 14, 11, 11, 12, 14, 16, 19, 22], landmarks: ['Punta del Este', 'Colonia del Sacramento', 'Ciudad Vieja', 'Casapueblo'] },
  PY: { capital: 'Asunción', population: 6_800_000, areaKm2: 406_750, currency: 'Paraguayan guaraní (PYG)', temps: [29, 28, 27, 23, 20, 18, 18, 20, 22, 25, 27, 29], landmarks: ['Jesuit Missions of La Santísima Trinidad', 'Asunción Historic Centre', 'Ybycuí National Park', 'Cerro Corá'] },
  VE: { capital: 'Caracas', population: 28_000_000, areaKm2: 916_450, currency: 'Venezuelan bolívar (VES)', temps: [22, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 22], landmarks: ['Angel Falls', 'Los Roques', 'Mount Roraima', 'Mérida Cable Car'] },

  // ── Oceania (batch 2) ─────────────────────────────────────────────────────
  PF: { capital: 'Papeete', population: 280_000, areaKm2: 4_170, currency: 'CFP franc (XPF)', temps: [27, 27, 27, 27, 26, 25, 25, 25, 25, 26, 26, 27], landmarks: ['Bora Bora', 'Moorea', 'Papeete Market', 'Teahupo’o'] },
  PG: { capital: 'Port Moresby', population: 10_000_000, areaKm2: 462_840, currency: 'Papua New Guinean kina (PGK)', temps: [27, 27, 27, 27, 27, 26, 26, 26, 27, 27, 28, 28], landmarks: ['Kokoda Track', 'Tari Basin', 'Sepik River', 'Rabaul Volcano'] },
};

export function countryFacts(code: string): CountryFacts | undefined {
  return COUNTRY_FACTS[code];
}
