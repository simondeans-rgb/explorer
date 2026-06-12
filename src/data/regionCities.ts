// City → region (subdivision) lookup, so the app can automatically infer which
// regions a Member has been to from the cities they've recorded. Curated for
// the core set of countries that have a region list (see data/regions.ts).
// Keyed by country code, then lowercased city name → region code.
// Coverage is "major cities"; unknown cities simply don't infer a region.

const CITY_REGION: Record<string, Record<string, string>> = {
  // United Kingdom — home nations
  GB: {
    london: 'ENG', manchester: 'ENG', liverpool: 'ENG', birmingham: 'ENG',
    leeds: 'ENG', bristol: 'ENG', newcastle: 'ENG', 'newcastle upon tyne': 'ENG',
    sheffield: 'ENG', nottingham: 'ENG', leicester: 'ENG', brighton: 'ENG',
    oxford: 'ENG', cambridge: 'ENG', york: 'ENG', bath: 'ENG', southampton: 'ENG',
    portsmouth: 'ENG', coventry: 'ENG', plymouth: 'ENG', norwich: 'ENG',
    exeter: 'ENG', hull: 'ENG', reading: 'ENG', bournemouth: 'ENG',
    blackpool: 'ENG', durham: 'ENG', canterbury: 'ENG', windsor: 'ENG',
    'milton keynes': 'ENG', 'stratford-upon-avon': 'ENG',
    edinburgh: 'SCT', glasgow: 'SCT', aberdeen: 'SCT', dundee: 'SCT',
    inverness: 'SCT', stirling: 'SCT', 'st andrews': 'SCT', 'fort william': 'SCT',
    oban: 'SCT',
    cardiff: 'WLS', swansea: 'WLS', newport: 'WLS', bangor: 'WLS',
    aberystwyth: 'WLS', wrexham: 'WLS',
    belfast: 'NIR', derry: 'NIR', londonderry: 'NIR', lisburn: 'NIR',
  },

  // United States — states
  US: {
    'new york': 'NY', 'new york city': 'NY', brooklyn: 'NY', buffalo: 'NY',
    'los angeles': 'CA', 'san francisco': 'CA', 'san diego': 'CA',
    sacramento: 'CA', 'san jose': 'CA', oakland: 'CA', 'long beach': 'CA',
    fresno: 'CA', 'palm springs': 'CA', napa: 'CA',
    chicago: 'IL', houston: 'TX', dallas: 'TX', austin: 'TX',
    'san antonio': 'TX', phoenix: 'AZ', tucson: 'AZ', philadelphia: 'PA',
    pittsburgh: 'PA', jacksonville: 'FL', miami: 'FL', orlando: 'FL',
    tampa: 'FL', 'key west': 'FL', columbus: 'OH', cleveland: 'OH',
    cincinnati: 'OH', charlotte: 'NC', raleigh: 'NC', indianapolis: 'IN',
    seattle: 'WA', denver: 'CO', aspen: 'CO', washington: 'DC',
    'washington dc': 'DC', boston: 'MA', nashville: 'TN', memphis: 'TN',
    portland: 'OR', 'las vegas': 'NV', reno: 'NV', detroit: 'MI',
    atlanta: 'GA', savannah: 'GA', 'new orleans': 'LA', minneapolis: 'MN',
    'st louis': 'MO', 'kansas city': 'MO', 'salt lake city': 'UT',
    honolulu: 'HI', maui: 'HI', anchorage: 'AK', milwaukee: 'WI',
    madison: 'WI', albuquerque: 'NM', 'santa fe': 'NM', 'virginia beach': 'VA',
    richmond: 'VA', baltimore: 'MD', providence: 'RI', hartford: 'CT',
    charleston: 'SC', columbia: 'SC', louisville: 'KY', omaha: 'NE',
    'oklahoma city': 'OK', tulsa: 'OK', boise: 'ID', 'des moines': 'IA',
    'little rock': 'AR', jackson: 'MS', montgomery: 'AL', birmingham: 'AL',
  },

  // Canada — provinces & territories
  CA: {
    toronto: 'ON', ottawa: 'ON', mississauga: 'ON', hamilton: 'ON',
    london: 'ON', montreal: 'QC', 'quebec city': 'QC', quebec: 'QC',
    vancouver: 'BC', victoria: 'BC', whistler: 'BC', calgary: 'AB',
    edmonton: 'AB', banff: 'AB', jasper: 'AB', winnipeg: 'MB',
    halifax: 'NS', saskatoon: 'SK', regina: 'SK', "st john's": 'NL',
    fredericton: 'NB', charlottetown: 'PE', yellowknife: 'NT',
    whitehorse: 'YT',
  },

  // Australia — states & territories
  AU: {
    sydney: 'NSW', newcastle: 'NSW', 'byron bay': 'NSW', wollongong: 'NSW',
    melbourne: 'VIC', geelong: 'VIC', brisbane: 'QLD', 'gold coast': 'QLD',
    cairns: 'QLD', 'sunshine coast': 'QLD', perth: 'WA', fremantle: 'WA',
    broome: 'WA', adelaide: 'SA', hobart: 'TAS', launceston: 'TAS',
    canberra: 'ACT', darwin: 'NT', 'alice springs': 'NT',
  },

  // Germany — Länder
  DE: {
    berlin: 'BE', munich: 'BY', münchen: 'BY', muenchen: 'BY', nuremberg: 'BY',
    nürnberg: 'BY', hamburg: 'HH', cologne: 'NW', köln: 'NW', koeln: 'NW',
    düsseldorf: 'NW', dusseldorf: 'NW', dortmund: 'NW', essen: 'NW',
    frankfurt: 'HE', stuttgart: 'BW', heidelberg: 'BW', 'baden-baden': 'BW',
    freiburg: 'BW', dresden: 'SN', leipzig: 'SN', bremen: 'HB',
    hannover: 'NI', hanover: 'NI', kiel: 'SH', 'lübeck': 'SH',
  },

  // Spain — autonomous communities
  ES: {
    madrid: 'MD', barcelona: 'CT', girona: 'CT', tarragona: 'CT',
    valencia: 'VC', alicante: 'VC', seville: 'AN', sevilla: 'AN',
    malaga: 'AN', málaga: 'AN', granada: 'AN', cordoba: 'AN', córdoba: 'AN',
    marbella: 'AN', bilbao: 'PV', 'san sebastian': 'PV', 'san sebastián': 'PV',
    zaragoza: 'AR', palma: 'IB', 'palma de mallorca': 'IB',
    'las palmas': 'CN', 'santa cruz de tenerife': 'CN',
    'santiago de compostela': 'GA', 'a coruna': 'GA', 'a coruña': 'GA',
    toledo: 'CM', salamanca: 'CL', valladolid: 'CL', oviedo: 'AS',
    pamplona: 'NC', murcia: 'MC',
  },

  // India — states / UTs (matching the curated set in regions.ts)
  IN: {
    delhi: 'DL', 'new delhi': 'DL', mumbai: 'MH', bombay: 'MH', pune: 'MH',
    jaipur: 'RJ', udaipur: 'RJ', jodhpur: 'RJ', jaisalmer: 'RJ',
    panaji: 'GA', goa: 'GA', kochi: 'KL', cochin: 'KL',
    thiruvananthapuram: 'KL', munnar: 'KL', chennai: 'TN', madras: 'TN',
    bengaluru: 'KA', bangalore: 'KA', mysore: 'KA', mysuru: 'KA',
    agra: 'UP', varanasi: 'UP', lucknow: 'UP', kolkata: 'WB', calcutta: 'WB',
    amritsar: 'PB', ahmedabad: 'GJ', shimla: 'HP', manali: 'HP',
    dharamshala: 'HP', rishikesh: 'UK', haridwar: 'UK', srinagar: 'JK',
    leh: 'JK',
  },
};

/** Region code for a city in a country, or undefined if unknown. */
export function regionForCity(
  countryCode: string,
  city: string,
): string | undefined {
  const table = CITY_REGION[countryCode];
  if (!table) return undefined;
  return table[city.trim().toLowerCase()];
}
