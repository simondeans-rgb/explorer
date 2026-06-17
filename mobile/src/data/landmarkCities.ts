// Which city a well-known landmark sits in (or nearest town), so trip-planning
// surfaces can show "Granada" under "Alhambra" without an API call. Keyed by the
// exact landmark string used in `countryFacts.ts`. Natural wonders and whole
// regions/islands (Santorini, the Sahara, fjords) are intentionally omitted —
// callers fall back to the generic "Popular landmark" label for those.
const LANDMARK_CITY: Record<string, string> = {
  // United Kingdom
  'Big Ben & Westminster': 'London',
  'Tower of London': 'London',
  Stonehenge: 'Salisbury',
  'Edinburgh Castle': 'Edinburgh',
  // France
  'Eiffel Tower': 'Paris',
  'Louvre Museum': 'Paris',
  'Palace of Versailles': 'Versailles',
  // Spain
  'Sagrada Família': 'Barcelona',
  Alhambra: 'Granada',
  'Park Güell': 'Barcelona',
  'Plaza Mayor': 'Madrid',
  // Italy
  Colosseum: 'Rome',
  'Venice Canals': 'Venice',
  'Leaning Tower of Pisa': 'Pisa',
  'Vatican City': 'Rome',
  // Germany
  'Brandenburg Gate': 'Berlin',
  'Cologne Cathedral': 'Cologne',
  'Berlin Wall': 'Berlin',
  // Portugal
  'Belém Tower': 'Lisbon',
  'Pena Palace': 'Sintra',
  'Jerónimos Monastery': 'Lisbon',
  // Netherlands
  'Anne Frank House': 'Amsterdam',
  Rijksmuseum: 'Amsterdam',
  'Keukenhof Gardens': 'Lisse',
  'Canal Ring': 'Amsterdam',
  // Greece
  Acropolis: 'Athens',
  Meteora: 'Kalambaka',
  // Switzerland
  Matterhorn: 'Zermatt',
  'Lake Geneva': 'Geneva',
  'Chapel Bridge': 'Lucerne',
  // Austria
  'Schönbrunn Palace': 'Vienna',
  'St. Stephen’s Cathedral': 'Vienna',
  'Salzburg Old Town': 'Salzburg',
  // Ireland
  'Guinness Storehouse': 'Dublin',
  'Trinity College': 'Dublin',
  // Norway
  'Bryggen, Bergen': 'Bergen',
  // Sweden
  'Gamla Stan': 'Stockholm',
  'Vasa Museum': 'Stockholm',
  Icehotel: 'Jukkasjärvi',
  'Drottningholm Palace': 'Stockholm',
  // Croatia
  'Dubrovnik Old Town': 'Dubrovnik',
  'Diocletian’s Palace': 'Split',
  // Czechia
  'Charles Bridge': 'Prague',
  'Prague Castle': 'Prague',
  'Old Town Square': 'Prague',
  // Turkey
  'Hagia Sophia': 'Istanbul',
  Ephesus: 'Selçuk',
  // Russia
  'Red Square': 'Moscow',
  'Saint Basil’s Cathedral': 'Moscow',
  'The Hermitage': 'Saint Petersburg',
  Kremlin: 'Moscow',
  // Belgium
  'Grand-Place': 'Brussels',
  Atomium: 'Brussels',
  'Bruges Canals': 'Bruges',
  'Manneken Pis': 'Brussels',
  // Poland
  'Wawel Castle': 'Kraków',
  'Auschwitz-Birkenau': 'Oświęcim',
  'Old Town Warsaw': 'Warsaw',
  'Wieliczka Salt Mine': 'Wieliczka',
  // Hungary
  'Parliament Building': 'Budapest',
  'Buda Castle': 'Budapest',
  'Széchenyi Baths': 'Budapest',
  'Fisherman’s Bastion': 'Budapest',
  // Japan
  'Fushimi Inari Shrine': 'Kyoto',
  'Senso-ji Temple': 'Tokyo',
  'Itsukushima Shrine': 'Miyajima',
  // China
  'Forbidden City': 'Beijing',
  'Terracotta Army': 'Xi’an',
  'Li River': 'Guilin',
  // Thailand
  'Grand Palace': 'Bangkok',
  'Wat Arun': 'Bangkok',
  // Vietnam
  'Hoi An Old Town': 'Hoi An',
  'Cu Chi Tunnels': 'Ho Chi Minh City',
  'Golden Bridge': 'Da Nang',
  // India
  'Taj Mahal': 'Agra',
  'Amber Fort': 'Jaipur',
  'Golden Temple': 'Amritsar',
  'Gateway of India': 'Mumbai',
  // Singapore
  'Gardens by the Bay': 'Singapore',
  'Marina Bay Sands': 'Singapore',
  Merlion: 'Singapore',
  // UAE
  'Burj Khalifa': 'Dubai',
  'Sheikh Zayed Mosque': 'Abu Dhabi',
  'Palm Jumeirah': 'Dubai',
  'Dubai Mall': 'Dubai',
  // Malaysia
  'Petronas Towers': 'Kuala Lumpur',
  'Batu Caves': 'Kuala Lumpur',
  // South Korea
  'Gyeongbokgung Palace': 'Seoul',
  'Bukchon Hanok Village': 'Seoul',
  'N Seoul Tower': 'Seoul',
  // Sri Lanka
  'Temple of the Tooth': 'Kandy',
  'Galle Fort': 'Galle',
  // Israel
  'Western Wall': 'Jerusalem',
  'Old City of Jerusalem': 'Jerusalem',
  // Egypt
  'Pyramids of Giza': 'Giza',
  'Great Sphinx': 'Giza',
  'Karnak Temple': 'Luxor',
  'Valley of the Kings': 'Luxor',
  // Morocco
  'Jemaa el-Fnaa': 'Marrakesh',
  'Hassan II Mosque': 'Casablanca',
  // South Africa
  'Table Mountain': 'Cape Town',
  'Cape of Good Hope': 'Cape Town',
  'Robben Island': 'Cape Town',
  // Tanzania
  Serengeti: 'Arusha',
  // USA
  'Statue of Liberty': 'New York City',
  'Golden Gate Bridge': 'San Francisco',
  // Canada
  'CN Tower': 'Toronto',
  'Old Quebec': 'Quebec City',
  // Mexico
  'Frida Kahlo Museum': 'Mexico City',
  Teotihuacán: 'Mexico City',
  // Cuba
  'Old Havana': 'Havana',
  // Brazil
  'Christ the Redeemer': 'Rio de Janeiro',
  'Sugarloaf Mountain': 'Rio de Janeiro',
  // Argentina
  'La Boca': 'Buenos Aires',
  // Peru
  'Machu Picchu': 'Aguas Calientes',
  Cusco: 'Cusco',
  // Australia
  'Sydney Opera House': 'Sydney',
  // Denmark
  Nyhavn: 'Copenhagen',
  'Tivoli Gardens': 'Copenhagen',
  'The Little Mermaid': 'Copenhagen',
  // Finland
  Suomenlinna: 'Helsinki',
  'Helsinki Cathedral': 'Helsinki',
  // Bulgaria
  'Alexander Nevsky Cathedral': 'Sofia',
  'Old Town Plovdiv': 'Plovdiv',
  // Serbia
  'Belgrade Fortress': 'Belgrade',
  Skadarlija: 'Belgrade',
  // Slovakia
  'Bratislava Castle': 'Bratislava',
  // Slovenia
  'Ljubljana Castle': 'Ljubljana',
  // Estonia
  'Tallinn Old Town': 'Tallinn',
  'Toompea Castle': 'Tallinn',
  'Kadriorg Palace': 'Tallinn',
  // Latvia
  'Riga Old Town': 'Riga',
  'House of the Black Heads': 'Riga',
  // Lithuania
  'Vilnius Old Town': 'Vilnius',
  'Trakai Castle': 'Trakai',
  // Ukraine
  'Kyiv Pechersk Lavra': 'Kyiv',
  'St. Sophia’s Cathedral': 'Kyiv',
  'Lviv Old Town': 'Lviv',
  // Georgia
  'Old Tbilisi': 'Tbilisi',
  // Hong Kong
  'Victoria Peak': 'Hong Kong',
  'Star Ferry': 'Hong Kong',
  'Tian Tan Buddha': 'Hong Kong',
  'Temple Street Night Market': 'Hong Kong',
  // Taiwan
  'Taipei 101': 'Taipei',
  Jiufen: 'New Taipei',
  // Nepal
  'Boudhanath Stupa': 'Kathmandu',
  Pashupatinath: 'Kathmandu',
  // Lebanon
  'Pigeon Rocks': 'Beirut',
  // Qatar
  'Museum of Islamic Art': 'Doha',
  'Souq Waqif': 'Doha',
  'Katara Cultural Village': 'Doha',
  'The Pearl': 'Doha',
  // Oman
  'Sultan Qaboos Grand Mosque': 'Muscat',
  'Mutrah Souq': 'Muscat',
  // Saudi Arabia
  'Al-Masjid al-Haram': 'Mecca',
  // Tunisia
  Carthage: 'Tunis',
  'Sidi Bou Said': 'Tunis',
  'Medina of Tunis': 'Tunis',
  // Monaco
  'Monte Carlo Casino': 'Monte Carlo',
  'Port Hercule': 'Monaco',
  'Prince’s Palace': 'Monaco',
  'Oceanographic Museum': 'Monaco',
  // Malta
  Valletta: 'Valletta',
  Mdina: 'Mdina',
  // Luxembourg
  'Bock Casemates': 'Luxembourg City',
  'Vianden Castle': 'Vianden',
  // Panama
  'Casco Viejo': 'Panama City',
  'Panama Canal': 'Panama City',
  // Puerto Rico
  'Old San Juan': 'San Juan',
  'Castillo San Felipe del Morro': 'San Juan',
  // Dominican Republic
  'Zona Colonial': 'Santo Domingo',
  'Los Tres Ojos': 'Santo Domingo',
  // Bangladesh
  'Lalbagh Fort': 'Dhaka',
  // Uzbekistan
  Registan: 'Samarkand',
  'Shah-i-Zinda': 'Samarkand',
  Khiva: 'Khiva',
  'Bukhara Old City': 'Bukhara',
  // Kazakhstan
  'Bayterek Tower': 'Astana',
  'Khan Shatyr': 'Astana',
};

/** The city a landmark sits in (or nearest town), if known. */
export function landmarkCity(name: string | undefined): string | undefined {
  return name ? LANDMARK_CITY[name] : undefined;
}
