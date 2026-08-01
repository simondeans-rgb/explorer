# Session handoff — Worldly (mobile app)

This note hands off context to a **new Claude Code session**. It summarises what
was done in the previous session and what's left. The app being worked on is the
**mobile app in the `mobile/` folder** (Expo SDK 54, React Native, Firebase).

> First action for the new session is in **"▶ Do this first"** at the bottom.

---

## What this session accomplished

All of the following is **already merged to `main`** (PRs #379–#385). A fresh
clone of `main` has everything.

1. **App Store rejection fixes (build 58 → 59):** social-login account deletion
   (Apple/Google re-auth), and the "save memory unresponsive" fix (non-blocking).
2. **Pre-submission audit + independent re-review:** privacy manifests
   (`app.json` `ios.privacyManifests` + `targets/widget/PrivacyInfo.xcprivacy`),
   removed background-location dead code (2.5.4), guest mode no longer shows fake
   seed data, Reduce-Motion support, dark-mode chip fixes, WCAG contrast,
   deep-link consent (`add/[code]`), Polarsteps zip OOM guard, account-deletion
   completeness (likes/replies/blocks/pushTokens), blocked-accounts screen,
   permission dead-end recovery ("Open Settings"), and more.
3. **The real photo-upload bug (most important):** photos never uploaded from a
   device because the Firebase web SDK's `uploadString('data_url')` can't build a
   Blob from raw bytes in React Native. Fixed with `src/lib/uploadImage.ts`
   (`uploadImageDataUrl` — writes base64 to a temp file, `fetch`es a Blob,
   `uploadBytes`). This is what caused Apple's "save memory unresponsive".
4. **Memories — edit + organise:** new `app/memory/[id].tsx` detail/edit screen
   (caption / trip / location / delete) + `updateCapture` in the store; photos
   are now tappable → the editor from the Story, trip, country, and journey
   pages; trip pages show an auto-album of that trip's photos.
5. **Nav polish:** edge-only back gesture (was full-screen, fought scrolling);
   tap the active tab to scroll that screen to top (`useTabReselect` +
   `src/lib/scrollTop.ts`, wired into all five tabs).

## Current state (as of handoff)

- **`main` is current** with all of the above. Checks pass: `cd mobile && npx tsc
  --noEmit` clean, `npm test` = 49/49. (No lint gate; some pre-existing
  react-refresh + require-image eslint warnings are expected.)
- **Build 60** was built from `main` and installed via TestFlight — **photo
  upload works on device** (confirmed by the user).
- **Build 59** (older) is uploaded to App Store Connect but has the BROKEN photo
  upload — it must **not** be submitted for review; cancel it if still pending.
- The memory-editing / albums / nav-polish changes (items 4–5) are **JS-only and
  merged to `main`** but were **not yet on the user's device** — they need an OTA
  update or a fresh build.
- **Firestore + Storage rules** were deployed by the user (the Storage rules being
  unpublished/expired was the real cause of an earlier upload failure). Storage
  rules cap uploads at 10 MB, owner-only.
- `EXPO_TOKEN` is now configured in this environment, so `eas` should be able to
  authenticate non-interactively.

## Remaining tasks (for the App Store)

1. **OTA the JS changes** so the user can test memories/albums/nav on device
   (see "Do this first").
2. **Build 61** from `main` (`autoIncrement` → 61) — it includes everything
   (upload fix + memories + nav polish + privacy manifests) — and **submit** it,
   not build 59.
3. **App Store Connect metadata (user does in browser):**
   - Age Rating → set **User-Generated Content = Yes** (Guideline 2.3.6).
   - App Privacy nutrition label: Email, Name, User ID, Device ID, Coarse
     Location, Photos → *Linked, App Functionality, no tracking*; Crash Data
     (Sentry) → *Not linked, App Functionality*. Precise Location: No. Contacts:
     not collected. "Track you?": No.
   - Attach **build 61**, reply to the reviewer (account deletion in-app + via
     provider re-auth; contacts on-device only; save-memory fixed), submit.
4. **Do NOT set `EXPO_PUBLIC_REVENUECAT_KEY`** in a submitted build — the paywall
   is intentionally dormant and would fail 3.1.1 (no working purchase / restore /
   terms) if enabled.
5. User security: revoke the Expo token that was accidentally pasted in chat
   (expo.dev → Settings → Access tokens) if not already done.

## Handy commands (run from the `mobile/` folder)

```bash
npx eas-cli update  --branch main --profile production --message "..."   # OTA (JS only)
npx eas-cli build   --platform ios --profile production --non-interactive # build 61
npx eas-cli submit  --platform ios --latest                              # submit
npx tsc --noEmit && npm test                                             # checks
```

## ▶ Do this first

Publish an EAS **OTA update** to the `main` branch so the user can test the new
memory-editing, photo albums, and navigation changes on their existing build:

```bash
cd mobile
npx eas-cli update --branch main --message "memory editing, albums, nav polish"
```

Then confirm it succeeded and report the update group/ID. (The user reopens the
app twice — downloads on one launch, applies on the next.)
