# Monster Hotel: Midnight Check-in

Fresh Milestone 1 implementation of an original landscape puzzle game. No previous prototype, licensed character artwork, external fonts, analytics, or live advertising is used. All current art is drawn locally with Phaser graphics.

## Develop

Requires Node.js 22.12+ (Node 24 LTS recommended) and npm. From the repository root:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite serves the game on port 5173. The production build goes into `dist/`. TypeScript checking runs before every production build. The lockfile is committed; use `npm ci` for reproducible installations.

## Play

Open the doors, enter the lobby, and begin Night 01. Drag each guest onto a room, or tap a guest followed by a room. Yue the nine-tail fox wants moonlight, Dou the jiangshi needs quiet, Ember the lantern spirit needs warmth, and Sumi the kappa needs water. These are original interpretations of folklore; the hotel preferences are fictional game rules, not claims about traditional beliefs. See [角色設計](docs/characters.zh-Hant.md) for the design brief. Each room holds one guest. Moving a guest into an occupied room returns the former occupant to the queue. Check in all guests to validate the solution. Reset clears the assignments; returning to the lobby abandons the current attempt. Completing a night awards 50 coins once. Replay is available from the lobby.

The 844 × 480 logical canvas scales to fit the available screen without cropping. Android locks landscape; portrait web windows retain a centered landscape canvas. No game action depends on a remote service. Capacitor bundles all web assets for offline native startup. The web development build needs its local Vite server and is not a PWA. Progress is stored locally on the device; clearing app data removes it. If browser storage is unavailable, the session remains playable but cannot retain progress after reload.

## Structure

- `src/domain/puzzle.ts`: scene-independent level data, immutable placement, and complete puzzle validation.
- `src/game/HotelScene.ts`: Phaser presentation and title/lobby/puzzle/results navigation.
- `src/game/drawMonster.ts`: four original folklore-inspired vector silhouettes.
- `docs/characters.zh-Hant.md`: Traditional Chinese character design brief and implementation boundaries.
- `src/platform/save.ts`: versioned local save boundary and one-time completion rewards.
- `src/platform/ads.ts`: inactive future provider contract. No ad SDK or live ads.
- `tests/puzzle.test.ts`: validation, exhaustive unique-solution check, placement, and progression tests.
- `capacitor.config.ts` and `android/`: native wrapper and landscape configuration.

Presentation intentionally remains a small scene for this vertical slice. Future levels can reuse the pure domain model; production localization, content catalogs, audio, and native service adapters should be extracted as their features arrive.

## Android preparation

The Android project is already checked in. Use JDK 21 and Android Studio with Android SDK Platform 35 and compatible build tools. Configure the local SDK through Android Studio or an untracked `android/local.properties`.

```sh
npm run android:sync
npm run android:open
# Or, after configuring the SDK:
cd android
./gradlew assembleDebug
```

Always rebuild/sync after changing web code. Do not run `android:add` again unless deliberately regenerating the native project; regeneration would require restoring the landscape manifest setting. Release signing, final app ID ownership, launcher artwork, store policy review, device testing, and publishing are outside Milestone 1. Never commit signing keys or `local.properties`.

## Validation and scope

Milestone 1: title animation, interactive lobby, gameplay navigation, four original vector monster guests, one handcrafted uniquely solvable puzzle, tap/drag controls, results, saved completion and coins, and Android project preparation.

Verified in the cloud environment: production build/type check; 11 automated tests; Chromium navigation, tap completion, drag-only completion with networking disabled after load, one-time reward replay, persistence after reload, rejection of three-guest incomplete assignments, and landscape/portrait viewport fit. Native APK assembly and device testing are not verified; the Android SDK is not configured here. Vite reports a large bundle warning from Phaser (about 1.2 MB uncompressed); release optimization remains future work.

Remaining after approval: 19 more handcrafted levels, a level-selection screen, two further original monster types, richer conditions, decoration upgrades, English/Traditional Chinese localization, music/SFX/haptics settings, final illustrated assets and animation polish, accessibility improvements, Android device QA, and optional ad provider integration. No live advertisements or publishing in this milestone.
