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

## Version 1.3: one growing puzzle route

The spring-morning cover opens a full-bleed lobby with standalone game buttons. **Puzzle challenges / 解謎挑戰** now includes the guest encounters in the main progression. There is no separate story menu and no fixed-night limit in the interface. The current 26 stages combine 20 uniquely solvable handcrafted classic puzzles with six playable encounter puzzles and their two event choices. New arrivals include Yuzu the fox spirit and Nemu the baku.

Assign four waiting guests to the four distinct rooms by tapping or dragging. Classic guests require moonlight, quiet, warmth or dry air; extra logical clues constrain floor, neighbors and exclusions. Progressive hints explain the method without moving guests. Encounters add curtain/moon-lamp supplies and small character events. Rewards are issued only on first completion. Old saves retain completed puzzle IDs, encounter outcomes, coins, owned decorations and drafts.

**Hotel boutique / 布置商店** sells six cosmetic decoration sets and permanent scenery. Every decoration appears in all four rooms and the lobby. Large heart carpets, moon lanterns, star garlands, rose curtains, flower boxes and tea carts have actual four-room before/after previews. Preview and cancel never charge coins. Owned items can be put away or redisplayed without paying again. Scenery costs: spring morning included; midnight 120, autumn 150, winter 200. Previously selected scenery is retained for legacy saves. Story weather is temporary narrative staging and never blocks the puzzle route.

The current route awards 1,455 coins total on first completion. All six sets and three paid scenes cost 1,420 together. No purchases, ads or real money are needed. Settings independently save music, sound and haptics; English and Traditional Chinese are available offline. All menus fit fixed screens, with explicit page buttons for inventory, levels and long descriptions. No scrolling is required.

## Android development build

Requires JDK 21, Android SDK 35 and build tools 35.0.0. See [cloud setup](scripts/setup-android-cloud.sh) and [installation instructions](docs/android-install.zh-Hant.md).

```sh
npm run android:apk
bash scripts/package-android-artifact.sh
```

Output: `artifacts/monster-hotel-midnight-check-in-debug.apk`. This is a sideloadable test APK, not a Play release. The GitHub Actions **Android debug APK** workflow builds and verifies an APK download bundle after pushes. Existing debug signing cache is retained for upgrade compatibility. An owner-managed upload key and Play Console access are still required before internal Play testing; see [Play preparation](docs/play-internal/README.zh-Hant.md). Nothing has been uploaded to Play Console.

## Architecture

- `src/domain/puzzle.ts`, `levels.ts`, `rules.ts`: pure constraints, solver and handcrafted classic puzzles.
- `src/domain/campaign.ts`: stable unified route IDs, unlocks and progress; new classic puzzles append automatically.
- `src/domain/storyNight.ts`, `storyChapters.ts`: encounter drafts, supply rules, endings and one-time rewards.
- `src/domain/decorations.ts`, `sceneryShop.ts`: offline cosmetic ownership, transactions and legacy migration.
- `src/game/HotelScene.ts`, `StoryScene.ts`: classic and encounter renderers behind one navigation route.
- `src/game/challengeSelection.ts`, `hotelMenus.ts`, `details.ts`: fullscreen fixed-page accessible interfaces.
- `src/game/roomDecor.ts`: shared room/lobby prop placement used by gameplay and actual previews.
- `src/platform/`: additive version-1 saves, preferences, audio/haptics and inactive future ad-provider boundary.
- `public/art/manifest.json`: original art metadata and checksums; all assets ship offline.

## Verification and review

Verified: 123 unit checks and 25 browser scenarios pass, production build and Android debug build succeed. Run `npm test`, `npm run build` and `npm run test:browser`. Browser coverage has been migrated from the removed storybook/free-scenery interfaces to the integrated route, all stages and both endings, paid scenery, decoration preview/transactions, multiple screen sizes, settings, storage failure, density, dragging, tutorial and looping activities. Device performance and native haptics still require physical Android testing. Phaser’s production bundle produces a size warning; it is bundled offline.

With a game server on port 5175, run `node scripts/record-unified.cjs` to produce real in-game PNG screenshots plus H.264 MP4 and animated GIF review files under `artifacts/`. Recording requires Chromium, Playwright’s FFmpeg support and system ffmpeg. The shop recording uses a documented test wallet, not extra in-game currency for players.

Older milestone documents are historical; the current behavior above and [version 1.3 notes](docs/unified-challenges.zh-Hant.md) supersede the former separate storybook and free scenery selection.
