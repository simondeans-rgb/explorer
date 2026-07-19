# The Worldly Passport Cover Catalogue — First Generation

Passport Covers are Worldly's flagship collectible: a switchable app icon plus a
matching in-app theme (accent, gradient, ambient particles) and — soon — a
rarity-scaled unlock celebration. This document is the creative-director source
of truth. The machine-readable version lives in
`covers-engine/src/catalogue.ts`; the visual themes in `catalog.ts`; the
in-app presentation in `src/lib/covers.ts`.

The goal: covers that feel like collectibles, not app icons. Delight on day one,
reward exploration, seed "I want to unlock that," support seasonal excitement
and future monetisation — while staying tasteful and unmistakably Worldly.

## The hierarchy

| Tier | Availability | Monetisation (when billing is on) |
| --- | --- | --- |
| **Core** | Everyone, always | Free |
| **Seasonal** | Free while the season is active; returns yearly | Free in-season |
| **Lifestyle** | Included with Explorer | Explorer subscription |
| **Achievement** | Unlocked only by exploring | **Never for sale** |
| **Premium** | Purchasable packs | One-off purchase / bundles |
| **Limited Edition** | Time-boxed event drops | Limited, time-limited |

## Rarity

Every cover carries a rarity that drives the **unlock celebration and badge**,
never price alone. It exists to create excitement.

| Rarity | Feel | Unlock celebration (spec) |
| --- | --- | --- |
| Common | The staples | Quiet checkmark, accent ripple |
| Uncommon | A nice find | Accent ripple + soft haptic |
| Rare | "Oh nice" | Confetti burst in cover colours + success haptic |
| Epic | Genuinely special | Full-screen sheet, particle shower, heavy haptic |
| Legendary | Trophy moment | Cinematic reveal, the mark animates in, sound |
| Mythic | Once-in-a-journey | Reserved for `Worldly Legend` — the rarest reveal of all |

## Animation & theme profiles

Each cover ships a **particle profile** (`catalog.ts`) used on its preview, the
Covers screen, the widget, and the unlock moment — all on the native driver,
Reduce-Motion aware. Every cover also drives the app's **accent** and a
two-stop **gradient**, so choosing a cover re-themes the app and the widget.

---

## 1. Core Collection — *free, defines the brand*

Audience: everyone. Rarity: Common (Explorer is Uncommon).
Accent themes: full brand spectrum. Animation: sparkle / none.

`Classic` · `Midnight` · `Pearl` · `Earth` · `Sunset` · `Ocean` · **`Linen`**
(woven, understated) · **`Explorer`** (contours + compass — the adventurer's
map).

*App Store / marketing:* the hero six on a clean gradient; "Make Worldly yours."

## 2. Seasonal Collections — *free in-season, back every year*

Audience: everyone; drives yearly re-engagement. Rarity: Uncommon–Rare.

- **Spring** (petals, fresh green) — Mar–May
- **Summer** (sun, sea, palms) — Jun–Aug
- **Autumn** (falling leaves, amber) — Sep–Nov
- **Winter** (`Winter`, `CozyWinter` — snow) — Dec–Feb
- **Christmas** (`Christmas`, `CandyCane`) — Nov–Jan · Rare
- **Halloween** (`Halloween`, `Ghost`, `WitchingHour`) — Oct · Rare
- **Lunar New Year** (lanterns + gold) — late Jan–Feb · Rare
- **Pride** (`Pride`, `PrideNeon`, `PrideNight`) — year-round

*Marketing:* a countdown teaser ("Autumn returns in September") + greyed teaser
rows in-app build anticipation.

## 3. Lifestyle Collections — *Explorer-included, aspirational*

Audience: engaged travellers. Rarity: Uncommon–Rare.

- **Signature**: `Sakura`, `Tropical`, `Coffee`, **`Nordic`** (fjord, midnight
  sun), **`Safari`** (savanna golden hour), **`Mediterranean`** (whitewashed,
  blue)
- **Voyager**: `Metropolis`, `VintageVoyage`, `Summit`, `Oasis`

## 4. Achievement Collection — *earned only, never for sale*

The prestige tier. These are the "I want that" covers. Rarity climbs with
effort.

| Cover | Unlock | Rarity |
| --- | --- | --- |
| `FrequentFlyer` | 10 countries | Rare |
| `Aurora` | Level 5 | Rare |
| `Neon` | 25 countries | Epic |
| `Luxury` | Level 8 | Epic |
| **`Every Continent`** | every continent (≈40 countries) | **Legendary** |
| **`Worldly Legend`** | 50 countries | **Mythic** |

*Marketing:* "Some covers can't be bought — only travelled to." `Worldly
Legend` is the halo.

## 5. Premium Collections — *purchasable when billing is on*

Locked, preview-only today; free-for-now while monetisation is dormant.

- **Materials**: `Gold` (18-karat on midnight) · `Marble` (Carrara + gold vein)
  — Epic
- **Atmosphere**: `Galaxy` (nebula) · `Art Deco` (golden age of travel) —
  Legendary / Epic

*Commercial:* sold as packs, bundled, or granted to Explorer subscribers.

## 6. Limited Editions — *time-boxed drops* (roadmap)

Olympics, World Cup, World Expo, Earth Day, Anniversary editions. Architecture
present (`unlock: { kind: 'event' }`, `monetisation: 'limited'`); art rendered
per-event.

---

## Roadmap (designed, art scheduled)

The engine grows by appending a recipe + theme + catalogue row. Planned
generations (`ROADMAP` in `catalogue.ts`): Modern/Monochrome core; City Breaks
(Paris/NYC/London/Tokyo); Nature (Northern Lights, National Parks, Rainforest);
Golden-Age/Retro-Airlines/Vintage-Luggage; Luxury (First Class, Hotels,
Cruise); more Materials (Glass, Chrome, Carbon); the full milestone + interest
achievement ladder (First Flight → 100 Countries, UK Nations, US States,
Foodie, UNESCO, Sunrise Chaser…); and event Limited Editions.

## How to add a cover (one prompt → shipped)

See `PROMPTS.md`. In short: add a recipe in `src/recipes/`, a theme in
`catalog.ts`, a catalogue row in `catalogue.ts`, register the icon in
`app.json`, add it to a section in `src/lib/covers.ts`, then
`npm run covers:build && covers:gen && covers:check && npm test`. Themes,
previews and metadata ship over-the-air; the icon art activates with the next
native build.

## First-generation count

41 shipped covers across all six tiers (26 launch + 15 catalogue expansion),
every one themed, rarity-tagged and monetisation-mapped, on a roadmap designed
to expand for years.
