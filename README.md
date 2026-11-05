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

## Version 1.5: welcome guests, see clues and build roads

The four-stage route opens with **the hotel’s first night**: meet four new guests, then watch them arrive and assign their rooms. Guest wishes sit below their names, and room conditions are written inside the rooms. Then play **the missing cake** (tap visible bandage prints, icing and trolley ribbon; collected art matches each clue), **sliding roads** (eight road tiles and exactly one empty slot; slide a neighboring tile without rotation, connect actual road ports, then watch the suitcase travel), and **reality/dream spot-the-differences** (two matched static room pictures, five authored changes, mirrored found markers).

Goals and controls stay visible, with free retries and no timer. The three event stages each award 500 coins once and the first room stage awards 50 once. All 1,420 coins of cosmetics can be earned from the 1,550-coin route. Existing version-1 achievements, coins, story outcomes, decorations and scenery remain compatible. Only changed puzzle drafts reset; the cake investigation can migrate its original collected clues.

The spring-morning cover, standalone lobby buttons, coin-purchased scenery, six visible decoration sets and fixed-page menus remain. English and Traditional Chinese, all art and locally synthesized audio work offline. There are no live ads or real-money purchases.

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

Validated: 126 unit checks and 25 distinct browser flows in batches, including the final introduction and full-evidence layouts. The long animation screenshot scenario was rerun with a larger software-rendering time budget. Run `npm test`, `npm run build` and `npm run test:browser`. Coverage includes opening-night order/introduction, physical evidence and thumbnails, one-gap adjacent sliding, actual road-port connectivity, five unique picture differences, mirrored markings, compatible saves, bilingual play and offline storage failure. Menus and puzzle content are checked at 844×480, 915×412, 640×320 and portrait fallback sizes; classic animation, dragging and tutorial regressions remain covered. Device performance and native haptics still require physical Android testing. Phaser’s production bundle produces a size warning; it is bundled offline.

With a game server on port 5175, run `node scripts/record-episodes.cjs` to produce real in-game PNG screenshots plus H.264 MP4 and animated GIF review files under `artifacts/`. Recording requires Chromium, Playwright’s FFmpeg support and system ffmpeg. The episode recording starts from a fresh save.

See [playtest clarity revision](docs/playtest-clarity.zh-Hant.md). Older milestone documents are historical; the current behavior above and [version 1.3 notes](docs/unified-challenges.zh-Hant.md) supersede the former separate storybook and free scenery selection.
