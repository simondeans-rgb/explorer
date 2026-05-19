# Stickies

A cloud-synced sticky-notes board — a modern evolution of Apple Stickies that
runs in any browser and syncs every change in real time across signed-in
devices.

Built with **Vite + React 18 + TypeScript + Tailwind CSS** for the UI, **Framer
Motion** for fluid drag interactions, and **Firebase** (Auth + Firestore +
IndexedDB offline cache) for sync and persistence. Deployed via Vercel from
this GitHub repo.

For the deep dive on architecture, schema, sync strategy, and mobile/desktop
roadmap, see [ARCHITECTURE.md](ARCHITECTURE.md).

## What it does

- Create, edit, drag, resize, recolour, and delete sticky notes on a freeform
  canvas.
- Auto-saves as you type (debounced).
- Real-time sync across every signed-in device.
- Works offline — changes queue and flush automatically when you reconnect.
- Light and dark mode, responsive to system preference and persisted.
- Email + password sign-in (Apple / Google can be wired up later).

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Firebase project

1. Open the [Firebase console](https://console.firebase.google.com) and create
   a new project (no Google Analytics needed).
2. **Authentication → Sign-in method**: enable **Email/Password**.
3. **Firestore Database → Create database**: start in **production mode**, pick
   your region.
4. **Firestore Database → Rules**: paste the contents of
   [`firestore.rules`](firestore.rules) and publish.
5. **Project settings → Your apps → Add app → Web**: register a web app and
   copy the config values.

### 3. Wire up env vars

Copy `.env.example` to `.env.local` and paste the values from step 5:

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run

```bash
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## Deploy (Vercel)

1. Import this GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Vercel auto-detects the Vite framework — no overrides needed.
3. In **Project Settings → Environment Variables**, add the same six
   `VITE_FIREBASE_*` keys from `.env.local`.
4. Every push to `main` triggers an automatic redeploy.

Once deployed, add your Vercel domain to **Firebase Authentication →
Settings → Authorized domains**.

## Keyboard / interaction

- **Double-click** a note to start editing. **Click outside** or press
  **Escape** to commit and exit.
- **Drag** anywhere on a note to move it.
- **Drag the bottom-right corner** to resize.
- **Hover** to reveal the color palette and delete buttons.
