// Curated country subdivisions (regions) for the core set, so users can record
// where within a country they've been — US states, UK home nations, etc.
// Codes are ISO-3166-2-style where practical; `name` is what's stored on the
// region Place. Countries without an entry simply have no curated regions
// (the picker falls back to free-text).

export interface Region {
  /** Short subdivision code (unique within its country). */
  code: string;
  name: string;
}

const REGIONS: Record<string, Region[]> = {
  // United Kingdom — home nations
  GB: [
    { code: 'ENG', name: 'England' },
    { code: 'SCT', name: 'Scotland' },
    { code: 'WLS', name: 'Wales' },
    { code: 'NIR', name: 'Northern Ireland' },
  ],

  // United States — 50 states + DC
  US: [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'DC', name: 'Washington, D.C.' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ],

  // Canada — provinces & territories
  CA: [
    { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' }, { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' }, { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'NT', name: 'Northwest Territories' }, { code: 'NU', name: 'Nunavut' },
    { code: 'YT', name: 'Yukon' },
  ],

  // Australia — states & territories
  AU: [
    { code: 'NSW', name: 'New South Wales' }, { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' }, { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' },
  ],

  // Germany — Länder
  DE: [
    { code: 'BW', name: 'Baden-Württemberg' }, { code: 'BY', name: 'Bavaria' },
    { code: 'BE', name: 'Berlin' }, { code: 'BB', name: 'Brandenburg' },
    { code: 'HB', name: 'Bremen' }, { code: 'HH', name: 'Hamburg' },
    { code: 'HE', name: 'Hesse' }, { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'NI', name: 'Lower Saxony' },
    { code: 'NW', name: 'North Rhine-Westphalia' },
    { code: 'RP', name: 'Rhineland-Palatinate' }, { code: 'SL', name: 'Saarland' },
    { code: 'SN', name: 'Saxony' }, { code: 'ST', name: 'Saxony-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' }, { code: 'TH', name: 'Thuringia' },
  ],

  // Spain — autonomous communities
  ES: [
    { code: 'AN', name: 'Andalusia' }, { code: 'AR', name: 'Aragon' },
    { code: 'AS', name: 'Asturias' }, { code: 'IB', name: 'Balearic Islands' },
    { code: 'PV', name: 'Basque Country' }, { code: 'CN', name: 'Canary Islands' },
    { code: 'CB', name: 'Cantabria' }, { code: 'CL', name: 'Castile and León' },
    { code: 'CM', name: 'Castilla-La Mancha' }, { code: 'CT', name: 'Catalonia' },
    { code: 'EX', name: 'Extremadura' }, { code: 'GA', name: 'Galicia' },
    { code: 'RI', name: 'La Rioja' }, { code: 'MD', name: 'Madrid' },
    { code: 'MC', name: 'Murcia' }, { code: 'NC', name: 'Navarre' },
    { code: 'VC', name: 'Valencia' },
  ],

  // India — a selection of states/UTs (most-visited)
  IN: [
    { code: 'DL', name: 'Delhi' }, { code: 'MH', name: 'Maharashtra' },
    { code: 'RJ', name: 'Rajasthan' }, { code: 'GA', name: 'Goa' },
    { code: 'KL', name: 'Kerala' }, { code: 'TN', name: 'Tamil Nadu' },
    { code: 'KA', name: 'Karnataka' }, { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'WB', name: 'West Bengal' }, { code: 'PB', name: 'Punjab' },
    { code: 'GJ', name: 'Gujarat' }, { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'UK', name: 'Uttarakhand' }, { code: 'JK', name: 'Jammu & Kashmir' },
  ],
};

/** Curated regions for a country, or [] if none are defined. */
export function regionsFor(countryCode: string): Region[] {
  return REGIONS[countryCode] ?? [];
}

export function hasRegions(countryCode: string): boolean {
  return (REGIONS[countryCode]?.length ?? 0) > 0;
}
