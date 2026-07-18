# Passport Cover Design System

The rules that make 27 covers feel like one collectible product line. Most of
these are enforced in code (`compose.ts`, `mark.ts`, `check.ts`, unit tests);
the rest are judgement calls documented here so future covers make the same
calls.

## Principles

1. **The W is the hero.** Every cover is a *place the W lives*, not artwork
   that happens to include a logo. If a scene competes with the mark, the
   scene loses.
2. **One collection, many worlds.** Same mark, same finish, same composition
   grid — different sky. A user should recognise any cover as Worldly from
   across the room.
3. **Collectible, not generated.** Every cover earns its place with one clear
   idea (a city at dusk; a stamped passport page). No filler, no variants
   that are just recolours.
4. **Legible at 60 px.** The Home Screen is the real canvas. If it doesn't
   read at grid size, it doesn't ship.

## The protected mark

- Geometry lives ONLY in `src/geometry.ts`: five pins at fixed anchors
  `(178,302) (340,688) (512,415) (685,695) (852,300)`, head radius 88,
  tip length 118, hole radius 36, route stroke 54, canvas 1024.
- A fingerprint test locks it. Materials change *surface*, never *shape*.
- The signature look is **white porcelain with five coloured pin-holes** —
  reach for another material only when the collection's story demands it
  (gold for Luxury-class, parchment for Vintage, ice for deep winter).
- The five hole colours are each cover's fingerprint: pick them from the
  scene's palette, keep neighbouring holes distinct, and keep contrast
  against the pin body ≥ 3:1.

## Composition

- Canvas 1024×1024; safe area: keep meaningful detail inside a 924px circle
  (iOS masks corners); nothing critical in the outer 50 px.
- The mark occupies the centre band (y ≈ 200–820). Environment interest goes
  **above** (sky: stars, moon, sun, clouds) and **below** (ground: skyline,
  ridges, dunes, hills) the mark — never *on* it.
- Foreground elements may overlap the canvas edges, never the pins' faces.
- One focal accent per scene (a sun, a moon, a stamp cluster) — placed in a
  gap between pins, e.g. the upper-left pocket (~370,150) or upper-right
  (~800,150).

## Colour

- Backgrounds are 3–4 stop gradients, dark-to-light along the scene's light
  direction. Brand family anchors: navy `#14213D`, coral `#FF6B9A`, gold
  `#FFB84D`, teal `#24D1C3`, lavender `#9B7CFF`, sky `#4DA6FF`.
- Every scene keeps at least one brand-family hue in its hole colours.
- Seasonal palettes may leave the brand family for the background, but the
  porcelain mark always restores brand identity.

## Light, texture, depth

- One implied light source, always up-and-left unless the scene's sun/moon
  says otherwise. The mark's drop shadows (baked into `mark.ts`) assume this.
- Depth = layering + blur: far elements get `blur6`, atmosphere gets
  `blur24` glows, near elements stay sharp.
- Finish is standard on every cover: vignette 0.30–0.38, top gloss sheet,
  fine photographic grain (raster stage). This is the "laminated cover" feel
  — do not disable it without a product reason.

## Motion (in-app; the Home Screen icon is static)

- Ambient only: weather and light, never the mark itself. The W never moves.
- Profiles (`CoverParticles`): snow, stars, petals, bubbles, embers, aurora,
  confetti, rain, steam, fireflies, sparkle. Loops are seamless; particles
  are born and die off-screen.
- Timing: ambient falls 6–16 s per traversal; twinkles 2.4–5.6 s; nothing
  faster than rain (1.2 s). Ease is linear for travel, sinusoidal for glow.
- Counts are capped (max 26, most profiles ≤ 18); transforms + opacity only,
  native driver always.
- **Reduce Motion**: static faint frame, automatically. Never bypass it.

## Accessibility & modes

- Cover tiles carry accessibility labels + lock reasons (covers screen).
- Hole colours must survive grayscale: check the preview in grayscale — if
  two adjacent holes merge, adjust lightness, not just hue.
- Dark mode: themes ship a gradient that reads on both; the covers screen
  uses white-on-gradient text over any theme.

## Collections & rarity

- **Core** — always available; the brand staples.
- **Lifestyle / packs** — Explorer-included; seasonal packs carry a season
  window and "Returns in …" copy.
- **Earned** — unlocked by travelling (countries/level); never sold.
- Rarity comes from *meaning* (Level 8, 25 countries, a season) — not from
  artificial scarcity.

## Quality gate (before any cover ships)

Score each 1–10; everything must clear 9+ or iterate:

| Check | How |
| --- | --- |
| Reads at 60 px | contact sheet at grid size |
| Unmistakably Worldly | porcelain mark present + brand hue in holes |
| One clear idea | describable in ≤ 5 words |
| No sibling collision | compare against the full contact sheet |
| Craft | shadows grounded, light source consistent, no stray pixels |

Then: `npm run covers:check && npm test` must pass, and the cover needs an
app.json entry, a theme, previews, and (if gated) unlock/season rules.
