# Monster Hotel: Midnight Check-in

Fresh implementation through Milestone 3 of an original landscape puzzle game. No previous prototype, licensed character artwork, external fonts, analytics, or live advertising is used. All current art is drawn locally with Phaser graphics.

## Develop

Requires Node.js 22.12+ (Node 24 LTS recommended) and npm. From the repository root:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
# Browser tests start their own local Vite server:
npm run test:browser
```

Vite serves the game on port 5173. Browser tests use port 5175 and a system Chromium at `/usr/bin/chromium` when present; otherwise run `npx playwright install chromium` once on your development machine before testing. The production build goes into `dist/`. TypeScript checking runs before every production build. The lockfile is committed; use `npm ci` for reproducible installations.

## Play

Open the doors, enter the lobby, open the night selection, and begin an unlocked night. Twenty authored nights unlock in order; completed nights remain replayable. Drag each guest onto a room, or tap a guest followed by a room. Luno the werewolf wants moonlight, Dou the jiangshi needs quiet, Ember the lantern spirit needs warmth, and Rollo the mummy needs a dry room. These are original interpretations of folklore; the hotel preferences are fictional game rules, not claims about traditional beliefs. See [角色設計](docs/characters.zh-Hant.md) for the design brief. Each room holds one guest. Moving a guest into an occupied room returns the former occupant to the queue. Check in all guests to validate the solution. Reset clears the assignments; returning to night selection abandons the current attempt. Completing a night awards 50 coins once. Replay is available from the night-selection screen. See [二十晚入住手冊](docs/campaign.zh-Hant.md) for the full progression and rule definitions.

The 844 × 480 logical canvas scales to fit the available screen without cropping. Android locks landscape; portrait web windows retain a centered landscape canvas. No game action depends on a remote service. Capacitor bundles all web assets for offline native startup. The web development build needs its local Vite server and is not a PWA. Progress is stored locally on the device; clearing app data removes it. If browser storage is unavailable, the session remains playable but cannot retain progress after reload.

## Room details, guest cards and hints (Milestone 2)

The default language is Traditional Chinese. Switch between English and Traditional Chinese at the top right on any game screen. The preference is saved separately from progression, and switching during a puzzle preserves room assignments. All translations are bundled locally; there is no translation API or downloaded font.

Tap a guest's **name** to open their card (personality, wish and dialogue); the avatar remains the tap/drag assignment control. Tap **ⓘ** on a room to inspect its name, interior description, condition and occupancy rule. Dialogs pause canvas input, preserve the current puzzle, support Escape to close, trap keyboard focus on their buttons, and scroll on small screens.

Tap **Hint / 提示** to open the keeper's notebook. Stage 1 explains the method, stage 2 identifies an unresolved guest and their wish, and stage 3 names a compatible room. Hints never place guests, charge coins or require ads. Further hints follow the next unresolved guest; reset or a new attempt restarts the hint sequence. If all wishes are satisfied, the notebook points to the check-in button.

## Twenty-night campaign (Milestone 3)

Room amenities can overlap; meeting a guest's usual wish is necessary but no longer sufficient. The **Night clues / 本晚線索** panel and each character's card show the extra rules for the selected night: required floor, forbidden amenity, adjacency, separation, same/different floor, and left-of on the same floor. Room cards show all amenities plus floor/position. Only consecutive rooms on the same floor are adjacent; rooms on separate floors are never neighbors. Night 1 retains its original four-room corridor and room IDs; nights 2–20 use 201/202 and 301/302.

Every night is explicit authored content, with one solution verified by exhaustive search. Hints now solve all active conditions before suggesting a placement. Each night awards 50 coins once; a complete campaign awards 1,000 coins. Existing version-1 saves remain valid, including earlier coins and night-one completion. Invalid completion IDs are filtered and locked nights cannot award coins. Returning to selection or reloading abandons an unfinished attempt.

## Structure

- `src/domain/puzzle.ts`: scene-independent level data, immutable placement, and complete puzzle validation.
- `src/game/HotelScene.ts`: Phaser presentation and title/lobby/puzzle/results navigation.
- `src/domain/levels.ts`: 20 authored nights, bilingual titles and sequential unlocking.
- `src/i18n/rules.ts`: bilingual relational clues and combined room descriptions.
- `src/game/nightSelection.ts`: accessible, responsive 20-night selection.
- `src/domain/hints.ts`: pure progressive hints targeting an unresolved guest.
- `src/i18n/catalog.ts`: typed bilingual interface, character and room content; saved locale preference.
- `src/game/details.ts`: accessible DOM dialog above the Phaser canvas.
- `src/game/drawMonster.ts`: four original folklore-inspired vector silhouettes.
- `docs/characters.zh-Hant.md`: Traditional Chinese character design brief and implementation boundaries.
- `src/platform/save.ts`: versioned local save boundary and one-time completion rewards.
- `src/platform/ads.ts`: inactive future provider contract. No ad SDK or live ads.
- `tests/`: puzzle validation, exhaustive unique-solution check, progression, hints and catalog tests.
- `e2e/`: reproducible Playwright checks for cards, modal input, hints, locale persistence, rewards, offline dragging and responsive layout.
- `capacitor.config.ts` and `android/`: native wrapper and landscape configuration.

Presentation intentionally remains a small scene for this vertical slice. Future levels can reuse the pure domain model; localization and details dialogs are separate modules. Audio and native service adapters can be added as their features arrive.

## Android preparation

The Android project is already checked in. Use JDK 21 and Android Studio with Android SDK Platform 35 and compatible build tools. Configure the local SDK through Android Studio or an untracked `android/local.properties`.

```sh
npm run android:sync
npm run android:open
# Or, after configuring the SDK:
cd android
./gradlew assembleDebug
```

Always rebuild/sync after changing web code. Do not run `android:add` again unless deliberately regenerating the native project; regeneration would require restoring the landscape manifest setting. Release signing, final app ID ownership, launcher artwork, store policy review, device testing, and publishing are outside the current milestone. Never commit signing keys or `local.properties`.

## Validation and scope

Milestone 1: title animation, interactive lobby, gameplay navigation, four original vector monster guests, one handcrafted uniquely solvable puzzle, tap/drag controls, results, saved completion and coins, and Android project preparation.

Milestone 2 adds bilingual room and character details, saved language selection, and progressive hints. Milestone 3 adds the complete 20-night campaign, relational rules and sequential selection/unlocking.

Verified in the cloud environment: production build/type check; 66 unit tests and 6 saved Playwright browser tests; Chromium navigation, tap completion, drag-only completion with networking disabled after load, one-time reward replay, persistence after reload, rejection of three-guest incomplete assignments, and landscape/portrait viewport fit. Native APK assembly and device testing are not verified; the Android SDK is not configured here. Vite reports a large bundle warning from Phaser (about 1.2 MB uncompressed); release optimization remains future work.

Remaining after approval: decoration upgrades, music/SFX/haptics settings, final illustrated assets and animation polish, accessibility improvements, Android device QA, and optional ad provider integration. The current cast stays at four until further expansion is approved. No live advertisements or publishing in this milestone.
