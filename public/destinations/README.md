# Destination imagery

These photos power Worldly's hero, country and journey cards. They are curated
free stock photography under the **Unsplash License**
(https://unsplash.com/license) — free for commercial and non-commercial use, no
permission or attribution required.

- Files are named by ISO 3166-1 alpha-2 country code (e.g. `FR.jpg`), plus
  `WW.jpg` as the default hero.
- Bundled locally so they always render with no runtime network dependency.
- Mapping + fallback logic: `src/lib/destinationImage.ts` (countries without a
  bundled photo fall back to an on-brand gradient).

To add a country: drop `XX.jpg` here and add its code to `HAS_PHOTO` in
`destinationImage.ts`.
