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

## Version 1.4: different stories and mechanics

The active route now has four stages: **missing birthday cake** (investigate three clues and make an evidence-based accusation), **runaway luggage** (slide furniture into adjacent empty tiles and clear a path), **dream door** (change objects across waking/dream worlds), and exactly one classic room-assignment puzzle. Each episode has its own objective, interaction system, feedback and ending. Future stages should vary mechanics, not repeat the same four-room match with different dialogue.

Goals and controls remain visible throughout play. Classic guest wishes are written directly above the queue and room conditions are written inside each room; biographies are optional. All three new episodes save partial progress locally. First episode completion awards 500 coins once; the classic stage awards 50 once. The 1,550-coin route can fund all 1,420 coins of cosmetics. Previous version-1 completed IDs, story outcomes, coins and purchases remain compatible. Old repeated stages are archived in source and saves, not listed in the active route.

The spring-morning cover, standalone lobby buttons, permanent coin-purchased scenery and six visible decoration sets remain. Shop previews never charge until confirmation. Settings, inventory, stage selection and descriptions use fixed pages without scrolling. English and Traditional Chinese, local audio/haptics and all art work offline.

## Android development build

Requires JDK 21, Android SDK 35 and build tools 35.0.0. See [cloud setup](scripts/setup-android-cloud.sh) and [installation instructions](docs/android-install.zh-Hant.md).

```sh
npm run android:apk
bash scripts/package-android-artifact.sh
```

Output: `artifacts/monster-hotel-midnight-check-in-debug.apk`. This is a sideloadable test APK, not a Play release. The GitHub Actions **Android debug APK** workflow builds and verifies an APK download bundle after pushes. Existing debug signing cache is retained for upgrade compatibility. An owner-managed upload key and Play Console access are still required before internal Play testing; see [Play preparation](docs/play-internal/README.zh-Hant.md). Nothing has been uploaded to Play Console.

## Architecture

- `src/domain/puzzle.ts`, `levels.ts`, `rules.ts`: pure constraints, solver and archived classic puzzles.
- `src/domain/campaign.ts`: active four-stage route, compatible IDs, unlocks and one-time rewards.
- `src/domain/episodes.ts`, `src/game/EpisodeScene.ts`: pure new puzzle systems and their illustrated renderer.
- `src/domain/storyNight.ts`, `storyChapters.ts`: encounter drafts, supply rules, endings and one-time rewards.
- `src/domain/decorations.ts`, `sceneryShop.ts`: offline cosmetic ownership, transactions and legacy migration.
- `src/game/HotelScene.ts`, `StoryScene.ts`: legacy renderers; only the first classic puzzle is in active navigation.
- `src/game/challengeSelection.ts`, `hotelMenus.ts`, `details.ts`: fullscreen fixed-page accessible interfaces.
- `src/game/roomDecor.ts`: shared room/lobby prop placement used by gameplay and actual previews.
- `src/platform/`: additive version-1 saves, preferences, audio/haptics and inactive future ad-provider boundary.
- `public/art/manifest.json`: original art metadata and checksums; all assets ship offline.

## Verification and review

Verified: 125 unit checks and 21 browser scenarios pass; final text-position and map bounds checks also pass. Run `npm test`, `npm run build` and `npm run test:browser`. New browser coverage plays the entire different-mechanics route, validates evidence, illegal furniture moves, cross-world causality, saved drafts, bilingual UI, offline/storage failure and one-time rewards. It checks visible content bounds on 844×480, 915×412, 640×320 and portrait fallback screens; classic motion, drag, tutorial and font regressions remain covered. Device performance and native haptics still require physical Android testing. Phaser’s production bundle produces a size warning; it is bundled offline.

With a game server on port 5175, run `node scripts/record-episodes.cjs` to produce real in-game PNG screenshots plus H.264 MP4 and animated GIF review files under `artifacts/`. Recording requires Chromium, Playwright’s FFmpeg support and system ffmpeg. The episode recording starts from a fresh save.

See [new mechanics and visible instructions](docs/distinct-episodes.zh-Hant.md). Older milestone documents are historical; the current behavior above and [version 1.3 notes](docs/unified-challenges.zh-Hant.md) supersede the former separate storybook and free scenery selection.
