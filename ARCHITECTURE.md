# Architecture

This document covers the design behind Stickies — how the pieces fit together,
why the choices were made, and the path to native apps later.

---

## 1. Application architecture

```
┌──────────────────────────────────────────────┐
│                    Browser                   │
│                                              │
│   ┌────────────────────────────────────┐    │
│   │       React (Vite + TS)            │    │
│   │                                    │    │
│   │   ThemeProvider                    │    │
│   │   └─ AuthProvider                  │    │
│   │      └─ Shell                      │    │
│   │         ├─ SignInPage (no user)    │    │
│   │         └─ Board (signed in)       │    │
│   │            ├─ Toolbar              │    │
│   │            └─ Canvas               │    │
│   │               └─ Note × N          │    │
│   │                  (Framer Motion)   │    │
│   └──────────────┬─────────────────────┘    │
│                  │                           │
│   ┌──────────────┴─────────────────────┐    │
│   │  Firebase SDK (auth + firestore)   │    │
│   │  └─ IndexedDB offline cache        │    │
│   └──────────────┬─────────────────────┘    │
└──────────────────┼───────────────────────────┘
                   │
                   ▼
   ┌──────────────────────────────────┐
   │  Firebase                        │
   │  ├─ Authentication               │
   │  └─ Cloud Firestore              │
   │     └─ notes/{noteId}            │
   └──────────────────────────────────┘
```

No backend of our own. The browser talks directly to Firebase; Firestore
security rules enforce per-user isolation.

## 2. Firebase architecture

- **Authentication**: Firebase Auth with email/password. The auth provider
  pattern is pluggable — Google/Apple are a single `signInWithPopup` away
  (see "Adding providers" below).
- **Firestore**: a single `notes` collection. Each document represents one
  sticky note and carries its owner's `userId`. Real-time listeners deliver
  every create/update/delete to every signed-in tab and device.
- **Offline cache**: Firestore SDK persists the working set to IndexedDB
  (`persistentLocalCache` + multi-tab manager). When the network drops,
  reads serve from cache and writes queue locally.
- **Hosting**: Vercel hosts the static bundle. Firebase Hosting works too,
  but Vercel matches the user's existing deploy flow.

### Adding providers later

Both Google and Apple slot into `AuthContext` with a single function:

```ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

Apple additionally requires an Apple Developer account, a Services ID, a
configured return URL in the Apple console, and enabling Apple in the Firebase
Auth providers list.

## 3. Firestore schema

Single collection: `notes`.

```ts
{
  id: string;          // doc id (auto-generated)
  userId: string;      // Firebase Auth uid — used by security rules
  body: string;        // note content
  x: number;           // top-left x in canvas pixels
  y: number;           // top-left y in canvas pixels
  width: number;       // px
  height: number;      // px
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'gray';
  zIndex: number;      // bumped to max+1 on focus → preserves layering
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Notes are queried by `where('userId', '==', uid)`. No composite index is
required for v1.

### Security rules

See [`firestore.rules`](firestore.rules). The rules enforce:

- Read/update/delete only if the requester owns the document.
- Create only if the document's `userId` matches the requester.

## 4. Authentication flow

1. App mounts. `AuthProvider` subscribes to `onAuthStateChanged`.
2. While auth state is unknown → `<Splash />`.
3. No user → `<SignInPage />` with sign in / sign up toggle.
4. User signed in → `<Board />`. Notes listener mounts using `user.uid`.
5. Sign out → listener unmounts, page returns to sign-in.

Firebase persists the session in IndexedDB by default, so refreshes don't
re-prompt for credentials.

## 5. React component structure

```
App
└─ ThemeProvider          src/contexts/ThemeContext.tsx
   └─ AuthProvider        src/contexts/AuthContext.tsx
      └─ Shell            src/App.tsx
         ├─ Splash
         ├─ SignInPage    src/components/auth/SignInPage.tsx
         └─ Board         src/components/Board.tsx
            ├─ Toolbar    src/components/Toolbar.tsx
            └─ Canvas     src/components/Canvas.tsx
               └─ Note    src/components/Note.tsx     (× N, AnimatePresence)
```

- `Board` is the orchestrator. It owns no note data — it subscribes to
  Firestore via `useNotes(uid)` and dispatches `createNote` / `updateNote` /
  `deleteNote` from `src/lib/notes.ts`.
- `Note` is intentionally self-contained: it owns its own local edit state
  (text, palette open, resize size, drag motion values) and only fires
  patches upward on commit boundaries.

## 6. State management

No Redux / Zustand. Firestore is the state manager.

- **Server state** (notes): the `useNotes` hook returns a real-time-synced
  array. Optimistic local updates ride on top of motion values during
  drag/resize; the durable value comes from the Firestore snapshot.
- **Auth state**: React Context (`AuthContext`).
- **Theme state**: React Context (`ThemeContext`) + localStorage.
- **UI state** (palette open, edit mode, drag/resize transient values):
  local `useState` / `useMotionValue` inside each `Note`.

## 7. Real-time sync implementation

```
useNotes(uid)
  └─ subscribeNotes(uid, callback)
      └─ onSnapshot( query(collection('notes'), where('userId','==',uid)) )
           └─ on every change anywhere → callback(notes[])
                └─ setState → React re-renders
```

Writes always go through `updateNote()` in `src/lib/notes.ts`, which calls
`updateDoc` with a `serverTimestamp()` for `updatedAt`. The local snapshot
listener then receives the change and re-renders — including the same tab
that wrote it. Conflicts are last-write-wins per-field, which is acceptable
for a single-user-multi-device app.

## 8. Drag and resize implementation

**Drag** — Framer Motion's `drag` on the note root.

- `x` and `y` are `useMotionValue`s. On `onDragEnd` we read the values via
  `info.offset` and write `{x,y}` to Firestore. While dragging, no Firestore
  traffic — the motion values update at frame rate locally.
- A `useEffect` on `note.x` / `note.y` reseats the motion values when a
  remote update arrives (other device moved this note).
- `dragMomentum: false` keeps the feel precise. `whileDrag: { scale: 1.03 }`
  gives subtle lift.

**Resize** — custom pointer-event handle in the bottom-right corner.

- Captures the pointer with `setPointerCapture` so the drag continues even
  if the cursor leaves the handle.
- Updates a local `size` state during the move (no Firestore writes).
- On `pointerup` writes `{width, height}` once.

**Z-index** — `Board` tracks `maxZ`. On note focus (`pointerdown` /
`onDragStart`) it bumps that note's `zIndex` to `maxZ + 1` and writes it.
The new layering syncs to every device.

## 9. Responsive mobile behavior

- `touchAction: none` on each note disables the browser's default scroll
  handling so drag works on touch.
- The canvas itself scrolls (overflow: auto) so users can pan a board larger
  than the viewport on small screens.
- The toolbar collapses the "New note" label below `sm` (≤ 640 px) while
  keeping the `+` icon and the account avatar visible.
- Resize handle is hit-testable at 20×20 px (within Apple's 44 px target
  with palm-area padding around it); double-tap-to-edit replaces hover for
  touch.

## 10. Offline sync strategy

Firestore's `persistentLocalCache` with `persistentMultipleTabManager` is
enabled in `src/lib/firebase.ts`. This gives us:

- **Reads from cache** when offline (instant load on second visit, no
  spinner).
- **Local-first writes** — `addDoc` / `updateDoc` / `deleteDoc` resolve
  optimistically and queue if offline.
- **Auto-flush** when connectivity returns; listeners re-fire with the
  authoritative server state.
- **Cross-tab coordination** so multiple tabs don't race.

Two consequences worth noting:

- A user can create notes offline. They sync next time the device is online.
- A long-offline window followed by an edit on another device produces
  last-write-wins per field; for a single-user-multi-device pattern this
  is acceptable. Real CRDT-grade merging is out of scope.

## 11. UI design system

**Surfaces**

- Canvas: warm off-white (#F2EFE6) / deep warm black (#1A1916), dotted grid
  background.
- Notes: paper-like with a slight per-note tilt (deterministic from id).
- Toolbar / menus: blurred translucent surface over canvas.

**Color palette** (each note picks one; light + dark variants in
`src/types.ts`):

| Token  | Light    | Dark     |
| ------ | -------- | -------- |
| yellow | #FFE9A3  | #C9A646  |
| blue   | #BFE3F7  | #5C9DC8  |
| green  | #C9E8C2  | #6FA068  |
| pink   | #FFC9D8  | #C97D93  |
| purple | #DCCBFA  | #9377C9  |
| gray   | #E4E3DE  | #7C7B76  |

Each note has a darker ink color computed per-color for contrast on its
own background — picked once in `COLOR_SPEC`.

**Typography**

- UI: Inter (400 / 500 / 600 / 700).
- Note body: Caveat — a friendly handwritten feel that distinguishes the
  app from a corporate productivity tool.

**Shadows** (Tailwind config)

- `note` — resting elevation.
- `note-hover` — on hover.
- `note-drag` — used implicitly via Framer's `whileDrag` scale, but
  available as a class.
- `note-dark` — softer shadow for dark mode.

**Motion**

- Note enter/exit: spring scale + fade via `AnimatePresence`.
- Drag end: spring settle (`stiffness: 320, damping: 26`).
- Edit mode: tilt resets to 0 for clean text editing.
- Theme transitions: CSS color transitions, ~150 ms.

## 12. Initial working codebase

Lives in this repo. Entry points:

- [`src/App.tsx`](src/App.tsx) — providers + routing shell
- [`src/components/Board.tsx`](src/components/Board.tsx) — orchestrator
- [`src/components/Note.tsx`](src/components/Note.tsx) — drag/resize/edit
- [`src/lib/firebase.ts`](src/lib/firebase.ts) — SDK init
- [`src/lib/notes.ts`](src/lib/notes.ts) — Firestore CRUD + subscription
- [`firestore.rules`](firestore.rules) — security rules to paste into the
  Firebase console

## 13. Folder structure

```
stickynotes/
├─ ARCHITECTURE.md
├─ README.md
├─ firestore.rules
├─ index.html
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
├─ vite.config.ts
├─ .env.example
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ App.tsx
   ├─ main.tsx
   ├─ index.css
   ├─ types.ts
   ├─ vite-env.d.ts
   ├─ components/
   │  ├─ Board.tsx
   │  ├─ Canvas.tsx
   │  ├─ Note.tsx
   │  ├─ Toolbar.tsx
   │  └─ auth/
   │     └─ SignInPage.tsx
   ├─ contexts/
   │  ├─ AuthContext.tsx
   │  └─ ThemeContext.tsx
   ├─ hooks/
   │  ├─ useDebouncedCallback.ts
   │  └─ useNotes.ts
   └─ lib/
      ├─ cn.ts
      ├─ firebase.ts
      └─ notes.ts
```

## 14. Environment variables

All variables are public-by-design (Firebase web config keys are not secret
— security comes from Firestore rules + Auth):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Set them in `.env.local` for development and in the Vercel project for
production.

## 15. Setup instructions

See [README.md](README.md#setup) for the 4-step setup.

## 16. Deployment instructions

See [README.md](README.md#deploy-vercel). Summary:

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the six `VITE_FIREBASE_*` env vars in Vercel.
4. Add the Vercel domain to Firebase's authorized domains.

## 17. Going native — iOS, Android, Mac, Windows

The cleanest path is **Capacitor for mobile** and **Tauri (or Electron) for
desktop**, both wrapping the existing web build with near-zero code change.

### iOS / Android — Capacitor

- `npm i @capacitor/core @capacitor/cli && npx cap init`
- `npx cap add ios && npx cap add android`
- `npm run build && npx cap copy`
- Open Xcode / Android Studio from `npx cap open ios|android`, sign and
  ship to TestFlight / Play Console.
- Firebase web SDK works inside Capacitor's WebView. For native Sign in
  with Apple / Google, swap to Capacitor's native auth plugins which
  exchange a credential into Firebase Auth.
- Touch gestures already work — drag and resize are pointer-event-based.
- For a more "native" feel add `@capacitor/haptics` to give a light tap
  on drag-end and color change.

### macOS / Windows — Tauri

- `npm i -D @tauri-apps/cli && npx tauri init`
- Use the Vite build output as the frontend; Tauri produces ~5 MB signed
  installers for both platforms.
- For tray icon, global shortcut to create a note, and "always-on-top
  scratchpad" mode use Tauri's tray + window APIs.
- Electron is the heavier alternative — pick it only if you need richer
  Node integration.

### Pure-native rewrite (later, if needed)

If/when scroll performance, system-wide drag, or share-extensions matter
more than code reuse: SwiftUI on iOS/macOS and Jetpack Compose on Android
talking to the same Firestore database via Firebase's native SDKs. The
Firestore schema doesn't change — every client speaks to the same
collection.

---

## Future feature roadmap

Out of scope for v1, but the structure leaves room for each:

- **Search**: in-app filter on `notes[]` from `useNotes`. Adds a `<Search />`
  bar to `Toolbar`.
- **Pinned / locked notes**: add `pinned: boolean` and `locked: boolean`
  fields. Pin = sort to top in board order. Lock = disable drag/edit.
- **Markdown**: render-on-blur via `react-markdown`. Edit-mode stays raw.
- **Keyboard shortcuts**: a small `useShortcuts` hook bound at the canvas
  level (`n` = new note, `delete` = remove selected, etc.).
- **Multi-select**: shift-click adds to a selection set; bulk move/recolor.
- **Tags / categories**: `tags: string[]` field, filter chips in the toolbar.
- **Export / import**: JSON dump and restore — both map directly to the
  Firestore schema.
- **Collaborative shared boards**: add a `boards` collection with a `members`
  array and switch `notes` to scope by `boardId` instead of (or in addition
  to) `userId`. Security rules check membership.
