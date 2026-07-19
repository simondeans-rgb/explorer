# Worldly widgets

A configurable, Passport-Cover-themed WidgetKit family. Each widget has **one
clear focus**; there is no internal branding (the Home Screen already names the
widget), so the space goes to content.

## Focuses

Chosen per-widget via an AppIntent configuration (`WorldlyFocusIntent`), or
**Smart**, which rotates the most relevant focus across the day's timeline.

| Focus | Primary | Secondary |
| --- | --- | --- |
| **Smart** | rotates (below) | — |
| **Exploration Progress** | country count | `N cities · N continents` |
| **Next Trip** | destination + countdown | departure date (photo hero) |
| **Explorer Level** | level ring | `740 XP to <next title>` |
| **World Progress** | `9.8%` | `19 of 195 countries` |
| **Next Achievement** | achievement title | progress bar + `X of Y unit` |
| **Travel Memory** | `This day in 2024` + place | photo hero |

Smart rotation (`smartRotation`) leads with a trip that's underway or within
14 days, then exploration, achievement, level, world and memory — only focuses
with real data are included.

## Sizes

- **Small** — one focus, ≤3 text elements, the whole tile is a single deep link
  (country card for trip/memory, else quick-add).
- **Medium** — two-zone default (exploration + next trip) on the Exploration/
  Smart focus; a single focused panel otherwise. Subtle add button.
- **Large** — three sections on Exploration/Smart (exploration → next trip →
  next achievement); a hero panel + supporting content on other focuses.
- **Lock Screen** — circular gauge (countries / 195), rectangular (next trip /
  memory / stats), inline.

## Data flow

`WidgetSync.tsx` derives a snapshot with the pure helpers in
`src/lib/widgetPayload.ts` (trip status, world %, XP-to-next, next achievement,
contrast-safe accent) and pushes it — plus three keyed hero photos
(`hero` / `trip` / `memory`) — across the app group via `WorldlyWidgetBridge`.
`index.swift` reads `widgetData` + `widget-<key>.jpg` and renders. The countdown
is refreshed per timeline entry so it stays live without a resync.

## Theming

Colours come entirely from the active Passport Cover (`accent`, `accentText`,
`gradient`) — never hard-coded. `accentText` is a luminance-lifted accent so
small labels stay legible on the deep background under any cover. Photos get an
adaptive top/bottom scrim; text over photography sits on a translucent glass
pill so the image still reads through.

## Empty & edge states

No countries → "Start your journey"; no trip → "No upcoming trip"; trip today /
underway → "Starts today" / "You're there now"; no memory → gentle empty; not
yet synced → "Open Worldly to sync". No misleading "0 days away".

## Accessibility

Each home-screen widget carries a composed VoiceOver label (`a11y`) so meaning
never depends on colour or layout; numbers use `minimumScaleFactor` so large
values and long names don't truncate; widgets are static (Reduce Motion safe).

## Extending

Add a focus: extend `WidgetFocus`, add a `caseDisplayRepresentations` entry, a
`SmallView`/`MediumView`/`LargeView` branch and (if it needs one) a panel
struct. Add any new field to `widgetPayload.ts` (with a test), push it in
`WidgetSync.tsx`, and parse it in `loadData`.

## Preview

`scratchpad/widgetpreview/preview.html` is an HTML proxy of every size × focus ×
state for reviewing hierarchy at Home-Screen scale without a device build.
