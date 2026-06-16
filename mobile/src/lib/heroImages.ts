// Four distinct destination photos per section for the rotating page heroes.
// Every code here has a bundled photo (see destinationImage.ts HAS_PHOTO).
export const HERO_CODES: Record<'story' | 'atlas' | 'explore' | 'you', string[]> = {
  story: ['JP', 'IS', 'PE', 'IT'], // Japan, Iceland, Peru, Italy
  atlas: ['CH', 'NZ', 'MA', 'TH'], // Switzerland, New Zealand, Morocco, Thailand
  explore: ['GR', 'BR', 'VN', 'ZA'], // Greece, Brazil, Vietnam, South Africa
  you: ['NO', 'MX', 'IN', 'AU'], // Norway, Mexico, India, Australia
};
