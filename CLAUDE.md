# Worldly

A cloud-synced personal travel archive — **Worldly** (formerly "Explorer's
Passport"). React + Vite + TypeScript + Tailwind, Firebase auth/Firestore.
Falls back to a fully clickable localStorage-backed demo when Firebase env vars
are absent.

## Design system (Worldly)

Premium consumer travel app — "travel magazine meets premium mobile app",
story-first, visual, airy. Tokens keep the legacy `passport-*` names so the
whole app themes from one place; semantics changed:
- `passport-navy` = primary indigo ink/surface; `passport-gold` = **sunset-coral
  accent** (#FF6A55); `passport-chart` = electric indigo; `passport-brass` =
  teal. Surfaces are clean white (`passport-card`) with soft `shadow-card`/
  `shadow-float` (no hard borders).
- Type: **Fraunces** (display) + **Plus Jakarta Sans** (UI).
- Utilities in `index.css`: `.bg-brand-gradient`, `.text-brand-gradient`,
  `.glass`, `.hero-scrim`, `.shimmer`. Brand mark/logo in `components/Brand.tsx`.
- Navigation: minimal top bar (logo + profile) + floating glass bottom tab bar
  (`AppShell.tsx`). Primary actions use the coral→indigo gradient.
Keep new screens consistent: rounded-2xl/3xl white cards, gradient primary CTA,
one clear primary action per screen, generous spacing.

## Deploy workflow

- **Production deploys from the `main` branch** to https://stickynotes-sand.vercel.app
  (Vercel auto-deploys on every push to `main`, ~1-2 min).
- Active development happens on `claude/explorers-passport-product-2My8o`.
- **A change only appears on the live site once it's merged into `main`.**

### Merge preference: AUTO

The user prefers changes to ship automatically. After pushing work to the
development branch, open a PR into `main` and **squash-merge it immediately
without asking for confirmation** (this matches the existing PR history and
triggers the production deploy). Only pause to ask if the change is risky,
ambiguous, or explicitly experimental. Always run typecheck + build + lint
before merging.

## Checks to run before merging

```
npx tsc --noEmit          # typecheck
npm run build             # prod build (tsc && vite build)
npm run lint              # eslint (note: AuthContext/ThemeContext have 2
                          #   pre-existing react-refresh warnings — unrelated)
```

## Firebase

Frontend reads `VITE_FIREBASE_*` env vars at **build time** (set in Vercel
project settings, scoped to Production). If any are missing the app drops to
the offline/demo mode and sign-in is unavailable. Env var names live in
`src/lib/firebase.ts`.
