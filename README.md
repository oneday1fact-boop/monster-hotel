# Monster Hotel: Midnight Check-in

Offline-first landscape Android puzzle game built from scratch with TypeScript, Phaser 3, Vite and Capacitor. All characters, illustrations and sound are original or locally synthesized; fonts are bundled under OFL licenses. No live ads, analytics or public publication.

## Installation and development

Requires Node 24 and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
```

Browser tests use Chromium (system `/usr/bin/chromium` when available; otherwise run `npx playwright install chromium`). The suite builds and previews the production game on port 5175, or reuses an existing server there. For stable production-art reviews, build first and run `npm run preview -- --host 127.0.0.1 --port 5175 --strictPort`.

## Version 1.9: perfume, the key cabinet and a hotel memory wall

Three new games extend the growing route to thirteen stages:

- **Ember’s perfume studio:** sort twelve layers of three scents across five bottles. Only matching top layers pour together, with spare bottles for planning and persistent undo. Breadth-first search verifies a ten-pour minimum solution. Colors also have distinct symbols and names.
- **The secret key cabinet:** infer a three-key code from five distinct symbols. Each attempt reports exact-position and misplaced matches. Attempts persist, duplicates do not clutter history, and two-record pages keep everything on screen. Selecting a used key exchanges positions. There are sixty possible codes, no guess limit or paid retry.
- **The monster group photo:** swap six original guests, meet their row requests and pose the front row left/centre/right. The camera checks face boundaries and occlusion before enabling the shutter. Completing the shot adds it to the lobby’s **Hotel memory wall**, with positions and poses restored after reopening or restarting the app.

The new photo is earned only by pressing the valid shutter, not by arranging an unfinished draft. Replay can retake the picture but does not repeat its coin award. Previous progress, purchases and all ten existing games remain; each new stage awards 500 once, making 6,050 across the current route. Every draft and the photograph ship and save offline in English and Traditional Chinese. No timers, live ads or real-money purchases.

The shorter native-style buttons, first-completion gold harvests, original pose companions and reduced-motion support remain. The lobby adds a fixed-screen memory-wall entry. Feeding, friendship stats and other raising mechanics are deferred at the user’s request; this revision implements the three games and earned photograph collection first.

## Android development build

Requires JDK 21, Android SDK 35 and build tools 35.0.0. See [cloud setup](scripts/setup-android-cloud.sh) and [installation instructions](docs/android-install.zh-Hant.md).

```sh
npm run android:apk
bash scripts/package-android-artifact.sh
```

Output: `artifacts/monster-hotel-midnight-check-in-debug.apk`. This is a sideloadable test APK, not a Play release. The GitHub Actions **Android debug APK** workflow builds and verifies an APK download bundle after pushes. Existing debug signing cache is retained for upgrade compatibility. An owner-managed upload key and Play Console access are still required before internal Play testing; see [Play preparation](docs/play-internal/README.zh-Hant.md). Nothing has been uploaded to Play Console.

## Architecture

- `src/domain/puzzle.ts`, `levels.ts`, `rules.ts`: pure constraints, solver and archived classic puzzles.
- `src/domain/campaign.ts`: active thirteen-stage route, compatible IDs, unlocks and one-time rewards.
- `src/domain/episodes.ts`, `hotelPuzzles.ts`, `mysteries.ts`, `guestPuzzles.ts`: pure puzzle rules, legal moves and validators.
- `src/game/EpisodeScene.ts`, `puzzleWidgets.ts`, `mysteryWidgets.ts`, `guestPuzzleWidgets.ts`: illustrated puzzle scenes and controls.
- `src/domain/storyNight.ts`, `storyChapters.ts`: encounter drafts, supply rules, endings and one-time rewards.
- `src/domain/decorations.ts`, `sceneryShop.ts`: offline cosmetic ownership, transactions and legacy migration.
- `src/game/HotelScene.ts`, `StoryScene.ts`: legacy renderers; only the first classic puzzle is in active navigation.
- `src/game/challengeSelection.ts`, `hotelMenus.ts`, `details.ts`: fullscreen fixed-page accessible interfaces.
- `src/game/roomDecor.ts`: shared room/lobby prop placement used by gameplay and actual previews.
- `src/platform/`: additive version-1 saves, preferences, audio/haptics and inactive future ad-provider boundary.
- `public/art/manifest.json`: original art metadata and checksums; all assets ship offline.

## Verification and review

Validated: 143 unit checks and 43 distinct browser flows passed in batches. Run `npm test`, `npm run build` and `npm run test:browser`. Coverage includes perfume conservation and minimum solutions, cabinet deductions and key exchanges, photo visibility and collection guards, saved drafts, one-time rewards, prior-game regressions and bilingual fixed-screen layouts. Physical Android performance and haptics still require device testing. Phaser’s production bundle produces a size warning; it ships offline.

With a game server on port 5175, run `npm run review:record` to produce real in-game PNG screenshots plus H.264 MP4 and animated GIF review files under `artifacts/`. Recording requires Chromium, Playwright’s FFmpeg support and system ffmpeg. The current recording uses a documented returning-player save (the previous ten stages complete, 4,550 coins), plays the three new games through real controls and reopens the earned photograph after a reload. No new puzzle solution or collection state is injected.

See [three guest games and photos](docs/guest-games-photos.zh-Hant.md), [previous laundry and harvest revision](docs/laundry-harvest.zh-Hant.md), [previous inference expansion](docs/inference-expansion.zh-Hant.md), [moderate difficulty revision](docs/moderate-puzzles.zh-Hant.md) and [previous playtest clarity revision](docs/playtest-clarity.zh-Hant.md). Older milestone documents are historical; the current behavior above and [version 1.3 notes](docs/unified-challenges.zh-Hant.md) supersede the former separate storybook and free scenery selection.
