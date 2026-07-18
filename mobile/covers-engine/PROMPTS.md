# From a prompt to a shipped collection

This engine exists so that a future request like **"Create a Nordic
Collection"** needs no further design direction. This file is the playbook —
for a developer, or for an AI agent working in this repo.

## The contract

Given a one-line prompt, produce:

1. **Concept** — 1–3 covers, each one idea in ≤ 5 words (e.g. Nordic:
   "fjord at midnight sun", "knitted-pattern winter", "aurora over cabins").
   Kill any concept that collides with an existing cover (check
   `covers-engine/contact-sheet.png` and the previews folder).
2. **Recipes** — a new file in `src/recipes/<collection>.ts`. Compose ONLY
   from `environments.ts` + `materials.ts` + `filters.ts`; extend those
   libraries (reusably!) if the scene needs something new. Never touch
   `geometry.ts`.
3. **Themes** — entries in `src/catalog.ts` (accent, 2-stop gradient echoing
   the sky, particle profile + tints, androidBg ≈ darkest sky stop).
4. **Assets** — `npm run covers:build` (extend `build.ts`'s recipe map), then
   LOOK at the contact sheet and iterate until it clears the quality gate in
   DESIGN_SYSTEM.md. Then `npm run covers:gen`.
5. **Registration** — app.json plugin entry per icon (ios path + android
   foreground/backgroundColor) and a section (or additions) in
   `src/lib/covers.ts` with previews, taglines, `isNew: true`, and season or
   unlock rules if applicable.
6. **Proof** — `npm run covers:check` and `npm test` pass. Ship via the
   normal PR flow; note in the PR that icons activate with the next native
   build (themes/particles are OTA-live immediately).

## Copy & tone

- Titles: 1–2 words, evocative, no puns that age ("Metropolis", "Summit").
- Taglines: ≤ 6 words, sensory, lowercase-calm ("Dusk over the skyline").
- Seasonal packs get a pack tagline + "Returns in <month>" copy.

## Sample prompts and how they'd resolve

- **"Create a Nordic Collection"** → 3 covers: *Fjord* (steel-blue water
  bands + midnight-sun sky, ICE material), *Hygge* (warm cabin bokeh +
  snowfall, porcelain), *Runestone* (granite material — add to materials.ts —
  moss accents). Season: none. Particles: snow / fireflies / none.
- **"Create a Cherry Blossom Collection"** → 1 cover (*Sakura* already
  exists — extend, don't duplicate): *Hanami Night* — lantern-lit blossom
  against deep indigo, petals profile. Mark: porcelain; holes in blossom pinks
  + lantern gold.
- **"Create a World Cup collection for June"** → *Stadium Lights* (floodlit
  glow + confetti profile), season `{ months: [6, 7] }`, unlock: none,
  pack tagline about the tournament without naming trademarks.

## Hard rules (from the brief, enforced by the engine)

- The W is never redrawn, approximated or regenerated — `geometry.ts` only.
- Materials/lighting/texture/particles may vary; geometry may not.
- Every cover ships with: icon, preview, theme, catalog entry, check pass.
- First attempt is never the shipped attempt: render → critique against the
  full contact sheet → iterate. Two rounds minimum.
