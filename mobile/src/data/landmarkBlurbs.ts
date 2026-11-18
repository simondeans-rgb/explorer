// Warm, travel-magazine one-liners for well-known landmarks — used to give the
// exported itinerary editorial voice instead of dry encyclopaedia extracts.
// Keys are matched case-insensitively against the landmark/place name (and a
// few common aliases). When a name isn't here, the exporter falls back to a
// tidied first sentence from Wikipedia. Keep each line concise (≈1 sentence),
// warm and useful — what you'd tell a friend, not a definition.

export const LANDMARK_BLURBS: Record<string, string> = {
  // ── United Kingdom ────────────────────────────────────────────────────────
  'big ben & westminster': 'Britain’s most recognisable clock tower, rising over the Houses of Parliament beside the Thames.',
  'big ben': 'Britain’s most recognisable clock tower, rising over the Houses of Parliament beside the Thames.',
  'tower of london': 'A thousand years of royal history, ravens and the Crown Jewels, guarded on the riverbank.',
  'buckingham palace': 'The King’s London home — come for the Changing of the Guard and those famous railings.',
  'london eye': 'Glide 135 metres up for the definitive slow-turning panorama over the city and the Thames.',
  'stonehenge': 'A 5,000-year-old stone circle standing alone on Salisbury Plain — ancient, mysterious and unmissable.',
  'edinburgh castle': 'A fortress on a volcanic crag over Edinburgh, with big views and the One O’Clock Gun.',
  'roman baths': 'Steaming, remarkably intact Roman spa in honey-stone Bath — walk the terraces the Romans built.',
  'lake district': 'England’s most romantic scenery — glassy lakes, fell walks and Wordsworth’s villages.',
  'borough market': 'London’s greatest food market — go hungry and graze your way through the stalls.',
  'the shard': 'Western Europe’s tallest tower, with a vertigo-inducing viewing gallery near the top.',
  'hyde park': 'London’s green lung — boating on the Serpentine, Speakers’ Corner and endless people-watching.',
  'british museum': 'Two million years of human history under one roof, from the Rosetta Stone to the Parthenon marbles.',

  // ── France ────────────────────────────────────────────────────────────────
  'eiffel tower': 'Paris’s iron sweetheart — climb it, picnic beneath it, or watch it sparkle on the hour after dark.',
  'louvre museum': 'The world’s most-visited museum — the Mona Lisa, endless galleries and that glass pyramid.',
  'louvre': 'The world’s most-visited museum — the Mona Lisa, endless galleries and that glass pyramid.',
  'palace of versailles': 'Louis XIV’s jaw-dropping palace of gilt and mirrors, wrapped in formal gardens.',
  'mont saint-michel': 'A medieval abbey crowning a tidal island in Normandy — spellbinding at high tide.',
  'notre-dame de paris': 'The Gothic soul of Paris on the Île de la Cité, reborn after the great fire.',
  'arc de triomphe': 'Napoleon’s triumphal arch anchoring the Champs-Élysées, with a rooftop view down twelve avenues.',
  'french riviera': 'Sun-drenched Mediterranean coast of Nice, Cannes and turquoise coves.',

  // ── Spain ─────────────────────────────────────────────────────────────────
  'sagrada família': 'Gaudí’s otherworldly basilica in Barcelona — still rising, and utterly breathtaking inside.',
  'sagrada familia': 'Gaudí’s otherworldly basilica in Barcelona — still rising, and utterly breathtaking inside.',
  'alhambra': 'A dreamlike Moorish palace-fortress above Granada, all courtyards, fountains and filigree.',
  'park güell': 'Gaudí’s mosaic-tiled playground of a park, with sweeping views over Barcelona.',
  'plaza mayor': 'Madrid’s grand arcaded square — grab a café table and watch the city go by.',
  'seville cathedral': 'The world’s largest Gothic cathedral, with the Giralda tower to climb.',

  // ── Italy ─────────────────────────────────────────────────────────────────
  'colosseum': 'Rome’s mighty amphitheatre, where 50,000 once roared for the gladiators.',
  'venice canals': 'Glide by gondola through a city built on water — no cars, just bridges and light.',
  'leaning tower of pisa': 'The world’s most famous architectural wobble — yes, you have to take the photo.',
  'vatican city': 'St Peter’s, the Sistine Chapel and Michelangelo’s ceiling in the world’s smallest state.',
  'florence cathedral': 'Brunelleschi’s terracotta dome crowning Renaissance Florence — climb it for the reward.',
  'amalfi coast': 'Pastel villages tumbling down cliffs above an impossibly blue sea.',
  'pompeii': 'A Roman city frozen by Vesuvius in AD 79 — streets, frescoes and all.',
  'trevi fountain': 'Rome’s baroque showstopper — toss a coin over your shoulder to guarantee your return.',

  // ── Rest of Europe ────────────────────────────────────────────────────────
  'brandenburg gate': 'Berlin’s neoclassical icon and symbol of a reunited city.',
  'neuschwanstein castle': 'The fairy-tale Bavarian castle that inspired Disney’s, floating above alpine forest.',
  'cologne cathedral': 'A soaring twin-spired Gothic giant right beside the Rhine.',
  'belém tower': 'A whimsical riverside fort from Lisbon’s Age of Discovery.',
  'pena palace': 'A candy-coloured romantic palace crowning the hills of Sintra.',
  'anne frank house': 'The canal-side hiding place behind the bookcase — moving and unforgettable.',
  'rijksmuseum': 'Amsterdam’s treasure house of Dutch masters, Rembrandt’s Night Watch and all.',
  'keukenhof gardens': 'Seven million tulips in bloom — the Netherlands at its most joyful, spring only.',
  'acropolis': 'The Parthenon crowning Athens — the birthplace of Western civilisation, floodlit by night.',
  'santorini': 'Whitewashed villages spilling down caldera cliffs to a wine-dark sea.',
  'matterhorn': 'The Alps’ most photogenic peak, a near-perfect pyramid above Zermatt.',
  'jungfraujoch': 'The “Top of Europe” — a railway to a glacier saddle among the high Alps.',
  'schönbrunn palace': 'The Habsburgs’ summer palace in Vienna, with gardens made for a stroll.',
  'cliffs of moher': 'Ireland’s wild Atlantic edge — 200 metres of sheer, wind-blown drama.',
  'guinness storehouse': 'Dublin’s temple to the black stuff, topped by a 360° Gravity Bar.',
  'blue lagoon': 'Bathe in milky-blue geothermal water amid Iceland’s black lava fields.',
  'golden circle': 'Iceland’s greatest hits in a day — geysers, waterfalls and a continental rift.',
  'northern lights': 'Nature’s light show — ribbons of green and violet dancing across the polar sky.',
  'charles bridge': 'Prague’s statue-lined medieval bridge — best at dawn before the crowds.',
  'prague castle': 'The world’s largest ancient castle complex, watching over the red rooftops.',
  'geirangerfjord': 'A UNESCO fjord of sheer walls and tumbling waterfalls, deep in Norway.',

  // ── Asia ──────────────────────────────────────────────────────────────────
  'mount fuji': 'Japan’s sacred, snow-capped symbol — most magical mirrored in the Fuji Five Lakes.',
  'fushimi inari shrine': 'Thousands of vermilion torii gates winding up a wooded Kyoto hillside.',
  'senso-ji temple': 'Tokyo’s oldest temple, approached through a lantern-lit street of old-Edo snacks.',
  'tokyo skytree': 'A 634-metre tower with dizzying glass-floor views across the megacity.',
  'kinkaku-ji': 'Kyoto’s Golden Pavilion, gilded and glowing over a mirror-still pond.',
  'great wall of china': 'Snaking thousands of miles over the mountains — walk a wild, uncrowded stretch if you can.',
  'forbidden city': 'The vast imperial palace at Beijing’s heart, home to 24 emperors.',
  'terracotta army': 'Thousands of life-size clay warriors standing guard for 2,000 years near Xi’an.',
  'grand palace': 'Bangkok’s dazzling complex of gilded spires and the Emerald Buddha.',
  'wat arun': 'The Temple of Dawn, its porcelain-studded spire glowing over the Chao Phraya.',
  'ha long bay': 'Emerald water and thousands of limestone karsts — best explored by overnight junk.',
  'taj mahal': 'A marble monument to love in Agra, luminous at sunrise.',
  'petronas towers': 'Kuala Lumpur’s glittering twin towers, joined by a sky bridge.',
  'marina bay sands': 'Singapore’s ship-topped icon, with an infinity pool floating above the skyline.',
  'gardens by the bay': 'Futuristic Supertrees and cooled domes in the heart of Singapore.',
  'burj khalifa': 'The world’s tallest building — rocket to the 148th floor for the desert-and-sea view.',
  'sheikh zayed mosque': 'A gleaming white marble marvel in Abu Dhabi, dazzling under floodlight.',
  'angkor wat': 'The largest religious monument on earth, breathtaking at sunrise over the lotus ponds.',
  'gyeongbokgung palace': 'Seoul’s grandest royal palace, with a colourful changing-of-the-guard.',

  // ── Americas, Africa & Oceania ────────────────────────────────────────────
  'statue of liberty': 'Lady Liberty in New York Harbor — the classic ferry approach never gets old.',
  'grand canyon': 'A mile-deep, 277-mile gash of layered rock — vast beyond any photograph.',
  'times square': 'New York at full voltage — a canyon of billboards that never sleeps.',
  'golden gate bridge': 'San Francisco’s burnt-orange icon, often wreathed dramatically in fog.',
  'christ the redeemer': 'Arms outstretched above Rio from the summit of Corcovado.',
  'machu picchu': 'The lost Inca city on its cloud-wrapped Andean ridge — a bucket-list arrival.',
  'chichen itza': 'The great Maya pyramid of El Castillo, aligned to the equinox sun.',
  'table mountain': 'A flat-topped giant over Cape Town — cable-car up for the ocean-to-city view.',
  'pyramids of giza': 'The last of the ancient wonders, rising straight from the desert edge of Cairo.',
  'victoria falls': 'The thundering “smoke that thunders” on the Zambezi — mile-wide and drenching.',
  'sydney opera house': 'Those billowing white sails on the harbour — an architectural icon up close.',
  'uluru': 'A sacred red monolith glowing at sunset in Australia’s vast Red Centre.',
};

/** Look up a warm curated blurb for a place name (case-insensitive), if any. */
export function landmarkBlurb(name: string): string | undefined {
  return LANDMARK_BLURBS[name.trim().toLowerCase()];
}
