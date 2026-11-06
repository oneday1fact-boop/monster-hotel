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

## Version 1.8: ghost laundry and satisfying harvests

The ten-stage route now replaces the missing-cake investigation with **Ghost Laundry**, a 5×4 sliding furniture puzzle. Seven differently shaped laundry items move along their own axes; free the star quilt at the right-hand exit. A breadth-first search verifies an eleven-single-cell minimum solution. It is a new game, with no investigation or evidence screens.

The cover uses a shorter **Play / 開始遊戲** button with larger lettering; the standalone lobby buttons are narrower too. Every first completion now presents a gold coin burst, automatic collection into a wallet, an animated balance and a local reward chime. Currency is awarded once by the domain before the visual effect. Replays with zero earned coins never show a harvest. Effects do not intercept touches, are bounded and are removed on scene exit; reduced motion uses a static receipt.

Each event has an original four-pose guest companion with a small activity effect. Timeline swaps and laundry pieces move smoothly, lift platforms tilt with interpolated motion, and light rays, packed gifts, warm baths and mail portraits have richer feedback. The two difference pictures remain static so decorative animation cannot create false differences. Existing four-room guest activities remain.

Progress, coins, purchases, the other eight event games and offline/bilingual play are retained. The replacement keeps the legacy `cake-case` completion ID internally, preserving prior awards and unlocks; its old draft is replaced by v4 laundry state. The route still awards 4,550 coins once across ten stages. No timers, paid retries or live ads.

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

Validated: 137 unit checks and 34 distinct browser flows passed in batches. Run `npm test`, `npm run build` and `npm run test:browser`. Coverage includes the minimum laundry solution, illegal slides, compatible saves and one-time awards, coin collection and nonblocking navigation, reduced-motion companions, bilingual fixed-screen layouts and the entire ten-stage route. Physical Android performance and haptics still require device testing. Phaser’s production bundle produces a size warning; it ships offline.

With a game server on port 5175, run `npm run review:record` to produce real in-game PNG screenshots plus H.264 MP4 and animated GIF review files under `artifacts/`. Recording requires Chromium, Playwright’s FFmpeg support and system ffmpeg. The current recording starts from a fresh save and completes all ten games through their real controls, including the first-completion harvests. No puzzle or wallet state is injected.

See [laundry and harvest revision](docs/laundry-harvest.zh-Hant.md), [previous inference expansion](docs/inference-expansion.zh-Hant.md), [moderate difficulty revision](docs/moderate-puzzles.zh-Hant.md) and [previous playtest clarity revision](docs/playtest-clarity.zh-Hant.md). Older milestone documents are historical; the current behavior above and [version 1.3 notes](docs/unified-challenges.zh-Hant.md) supersede the former separate storybook and free scenery selection.
