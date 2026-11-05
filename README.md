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

## Version 1.7: investigate, reconstruct and deduce

The ten-stage route keeps the first-night room assignment, 4×4 luggage roads, subtle picture differences, balanced lift, moon mirrors and gift packing. The missing-cake case now has three connected phases: inspect physical traces, compare trolley tread patterns, then link high room temperature with melted icing before identifying the mover. Unrelated objects and incorrect comparisons give specific feedback without collecting evidence or awarding coins.

Three new playable episodes follow the previous route:

- **A knock at midnight:** exchange five event cards to satisfy three witness memories about order, adjacency and spacing. All 120 permutations are checked; one sequence fits.
- **The chilly hot springs:** rotate a nine-pipe branching network to supply two baths, connect every pipe and close all leaks. Water and bath warmth update live.
- **Letters at the wrong door:** use four incomplete addresses and illustrated guest profiles together. One letter per guest creates a unique deduction across all four clues, rather than four independent matches.

All puzzle drafts resume offline. Events award 500 coins once, the first room stage 50: 4,550 coins across ten stages. Existing achievements, coins, story outcomes, decorations and scenery remain compatible. Only the redesigned cake draft resets; an already completed cake keeps its achievement and cannot award coins again. No timers, paid retries, live ads or real-money purchases.

The spring cover, standalone lobby buttons, coin-purchased scenery, visible decoration sets and fixed-page menus remain. English and Traditional Chinese, original artwork and locally synthesized audio ship offline.

## Android development build

Requires JDK 21, Android SDK 35 and build tools 35.0.0. See [cloud setup](scripts/setup-android-cloud.sh) and [installation instructions](docs/android-install.zh-Hant.md).

```sh
npm run android:apk
bash scripts/package-android-artifact.sh
```

Output: `artifacts/monster-hotel-midnight-check-in-debug.apk`. This is a sideloadable test APK, not a Play release. The GitHub Actions **Android debug APK** workflow builds and verifies an APK download bundle after pushes. Existing debug signing cache is retained for upgrade compatibility. An owner-managed upload key and Play Console access are still required before internal Play testing; see [Play preparation](docs/play-internal/README.zh-Hant.md). Nothing has been uploaded to Play Console.

## Architecture

- `src/domain/puzzle.ts`, `levels.ts`, `rules.ts`: pure constraints, solver and archived classic puzzles.
- `src/domain/campaign.ts`: active ten-stage route, compatible IDs, unlocks and one-time rewards.
- `src/domain/episodes.ts`, `hotelPuzzles.ts`, `mysteries.ts`: pure puzzle rules, legal moves and validators.
- `src/game/EpisodeScene.ts`, `puzzleWidgets.ts`, `mysteryWidgets.ts`: illustrated puzzle scenes and controls.
- `src/domain/storyNight.ts`, `storyChapters.ts`: encounter drafts, supply rules, endings and one-time rewards.
- `src/domain/decorations.ts`, `sceneryShop.ts`: offline cosmetic ownership, transactions and legacy migration.
- `src/game/HotelScene.ts`, `StoryScene.ts`: legacy renderers; only the first classic puzzle is in active navigation.
- `src/game/challengeSelection.ts`, `hotelMenus.ts`, `details.ts`: fullscreen fixed-page accessible interfaces.
- `src/game/roomDecor.ts`: shared room/lobby prop placement used by gameplay and actual previews.
- `src/platform/`: additive version-1 saves, preferences, audio/haptics and inactive future ad-provider boundary.
- `public/art/manifest.json`: original art metadata and checksums; all assets ship offline.

## Verification and review

Validated: 135 unit checks and 33 distinct browser flows passed in batches. Run `npm test`, `npm run build` and `npm run test:browser`. Coverage includes causal investigation gates, exhaustive timeline and mail solutions, pipe leaks and connectivity, compatible progress and one-time rewards, draft resume, bilingual controls and fixed-screen phone layouts. Physical Android performance and haptics still require device testing. Phaser’s production bundle produces a size warning; it is bundled offline.

With a game server on port 5175, run `npm run review:record` to produce real in-game PNG screenshots plus H.264 MP4 and animated GIF review files under `artifacts/`. Recording requires Chromium, Playwright’s FFmpeg support and system ffmpeg. The current recording uses a documented returning-player save (the previous seven stages completed), replays the redesigned investigation and completes the three new stages through actual controls. No puzzle solution state is injected.

See [inference expansion](docs/inference-expansion.zh-Hant.md), [moderate difficulty revision](docs/moderate-puzzles.zh-Hant.md) and [previous playtest clarity revision](docs/playtest-clarity.zh-Hant.md). Older milestone documents are historical; the current behavior above and [version 1.3 notes](docs/unified-challenges.zh-Hant.md) supersede the former separate storybook and free scenery selection.
