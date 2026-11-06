# Monster Hotel: Midnight Check-in

Offline-first landscape Android puzzle game built from scratch with TypeScript, Phaser 3, Vite and Capacitor. Character art, illustrations and sound are original or locally synthesized; Pooh uses newly drawn art based on the 1926 novel (US public domain; other territories require separate review); fonts are bundled under OFL licenses. No live ads, analytics or public publication.

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

## Version 1.17: warm original bear art and three chapter designs

Replace the flat bear sprite with a high-resolution transparent amber-gold original teddy, retaining its cream muzzle, stitched belly, honey crock and bee. The image service rejected the Disney-lookalike request; this accepted original design must not be presented as that likeness or as cleared for worldwide commercial use. Single-sprite CSS sizing keeps the complete character visible on cover, lobby, gameplay and completion; continuous motion and reduced motion are preserved.

The three [afternoon-tea chapter designs](docs/pooh-next-three.zh-Hant.md) are **not playable in this APK**: honey-pot pushing (paper board BFS-verified at thirteen walk/push steps), shadow theatre and pillow bounce. Projection and physics layouts still require implementation and playtesting. Existing clock difficulty, route, saved achievements, prices and rewards are unchanged. Android 1.17 / versionCode 18.

## Version 1.16: Winnie-the-Pooh replaces Grin

The new guest is now Winnie-the-Pooh / 維尼 throughout the arrival introduction, clock game, completion, animated cover and lobby. Newly drawn honey-brown teddy artwork has no clothing, a stitched belly and a blue-grey honey pot. The story centres on quiet clocks and afternoon tea. See [source and territory notes](docs/public-domain-guests.zh-Hant.md): removing a red shirt alone is not a global copyright clearance.

Keep `clockwork-guest` IDs, drafts, unlocks and one-time rewards unchanged: a player who already earned Grin receives Pooh automatically without replay or extra coins. Shadow theatre and pillow bounce remain designs only, with Pooh replacing Grin in their plans. Android 1.16 / versionCode 17. Run `MONSTER_SOFTWARE_TEST=1 npx playwright test e2e/pooh.spec.ts`; `npm run review:record` records the actual replacement and completion against port 5188.

## Version 1.15: one shared lineup and a public-domain story guest

Cover and lobby now use the same continuous character renderer, positions and sizing; Nimbus no longer jumps to a separate right-hand resident badge. The line has four guests initially, five after Nimbus, and six after Grin’s chapter. Landscape and portrait fallback layouts keep menus clear and honor reduced motion.

Append **Grin checks in: the cuckoo clocks** after Nimbus. The original mint-coloured Cheshire guest is based on Carroll’s public-domain novel, with newly drawn SVG artwork, dialogue and animation. See [source/design notes](docs/public-domain-guests.zh-Hant.md). Four linked clocks and three gears have a shortest eight-turn solution, free undo and adaptive hints. A wrong answer never spends currency. Drafts survive reload; first completion earns 500 coins once and permanently unlocks Grin on both cover and lobby. The 64 reachable boards were checked for solvability. Shadow theatre and pillow bounce remain **designs only**, now featuring Grin in [the updated plan](docs/next-three-games.zh-Hant.md).

Android 1.15 / versionCode 16. Run `MONSTER_SOFTWARE_TEST=1 npx playwright test e2e/cheshire.spec.ts` for shared lineup, completion, persistence, bilingual layouts and reduced motion. Existing saves, decorations and photograph collection remain compatible.

## Version 1.14: earned cover companion and a small laundry tune

Nimbus joins the animated cover only after `storm-arrival` is completed. The five-guest lineup uses the existing saved achievement, continuous motion and responsive spacing that keeps Play clear; reduced motion remains static. Existing four-guest covers are unchanged for players who have not met him.

Laundry keeps the same rules and seven objects, with two starting positions adjusted. Its BFS-verified minimum increases from eleven to twelve one-cell moves. Unfinished legacy drafts remain valid; completed solved replays start the revised board. Currency and completion records are preserved.

The next three chapters are **designs only**, documented in [the design draft](docs/next-three-games.zh-Hant.md): coupled cuckoo clocks, a shadow theatre and a pillow-bounce ball puzzle. They are not playable in this APK. Android 1.14 / versionCode 15.

## Version 1.13: a new guest in the storm

Append **A stormy arrival** after the group photograph. Nimbus (小雷) is an original shy cloud creature with a lightning forelock, pastel paws and a tiny chime collar, illustrated as a four-pose scalable SVG atlas. He arrives during a rainstorm, worried that his nervous thunder will frighten the other guests.

The new 6×5 wind-glide puzzle uses fixed walls, three visible chime pieces and four wind directions. A gust slides Nimbus until a wall stops him; pieces are collected along the path. The authored shortest route takes ten gusts. Undo and state-aware BFS hints are free, with no timer. Draft/undo history survives reload; interrupted final moves recover completion once. First completion earns the usual 500 coins, and Nimbus remains visible in the lobby thereafter.

The same update corrects the laundry prop depth, moves the lobby controls right, replaces stretched horizontal skins with fixed-cap vector plates, and adds direct 中/EN controls. The spring cover uses continuous layers from the original character artwork (head/body/tail motion) plus 24 falling petals, with no sprite-frame swapping. Reduced motion keeps it static.

Existing progress, photographs, currency and prices are preserved. The preceding photo ending keeps a convenient hotel-return control alongside Next/Replay. Android 1.13 / versionCode 14. New checks: `MONSTER_SOFTWARE_TEST=1 npx playwright test e2e/nimbus.spec.ts`. `npm run review:record` records actual story, gameplay, arrival and persistence against port 5188. The recording fixture only completes previous chapters.

## Version 1.12: responsive guests and completion scenes

Each of the twelve episode puzzles now has an original animated completion vignette: returning the quilt, rolling luggage, sealing gifts, sharing tea, lighting the moon window, enjoying the spa, dancing, perfume, unlocking the cabinet and the group photograph. These are presentation only: saves/rewards commit first and Next/Replay remain immediately usable. Reduced motion uses a static illustration.

The six guest kinds have distinct idle gestures and thinking/pleased/puzzled responses. Pose timing survives DOM updates. Episode backgrounds now persist across puzzle input and repaint only on scene entry or viewport changes, preserving their animation lifecycle and avoiding repeated reconstruction. No difficulty, economy, save-format or campaign changes.

Android 1.12 / versionCode 13. New checks: `MONSTER_SOFTWARE_TEST=1 npx playwright test e2e/animation-life.spec.ts`. Physical Android performance and haptics still require a device playtest.

## Version 1.11: livelier, retryable hotel games

The opening night now needs three visible relational clues rather than simple one-to-one amenity matching. Laundry pieces slide with cloth follow-through. Runaway Luggage stays 4×4, starts eight moves from its authored route, and has persisted undo/redo. Difference markers are smaller while touch targets stay generous. The lift carries two original passengers and actually travels after a valid load.

Souvenirs support pointer/touch drag with green/red placement previews, commit only on release and preserve the prior state on an invalid/cancelled drop. Tap/rotate controls remain available. The old letter-elimination stage is replaced by a three-round animated monster memory relay. The photo stage is now a live camera-moment game: freeze each guest during their green cue, then shoot to earn the existing photo collection. There is no overall timer or penalty for a missed photo moment; relay mistakes retry only the current round.

The cover start button moves down/right. A compact coin wallet appears on the cover and lobby; four lobby buttons sit as a centred two-by-two group on the right. Cosmetic prices now total 16,200 coins, against 6,050 available from the active route, so purchases require choices. Owned items, old coin balances, completion IDs and earned photos are preserved. Only replaced letter/photo drafts use new keys.

`MONSTER_SOFTWARE_TEST=1 npm run test:browser` selects the supported Canvas2D fallback for GPU-less cloud testing. Default browser tests and Android still use Phaser AUTO. `node scripts/record-lively-games.cjs` records real browser input against preview port 5188, using a returning-player fixture. Android versionCode is 12 (1.11).

## Version 1.10: mobile interaction feedback

Shared touch and keyboard controls now press, rebound and emit a small bounded gold glint. Full-screen sheets fade in/out; route changes use a short opacity fade that keeps Phaser and reward counters rendering across Android WebViews. Switches slide, route pages stagger in, and changed puzzle selections briefly brighten without blocking repeated input. Reduced-motion settings skip these effects.

Navigation suppresses repeated outgoing actions while allowing nested next-stage transitions. First-completion rewards still save once before presentation; currency, collection and puzzle rules are unchanged. Raising mechanics remain deferred. Android versionCode is 11.

Run `npx playwright test e2e/game-feel.spec.ts` for interaction regressions. Run `PLAYWRIGHT_BROWSERS_PATH=/workspace/.tooling/playwright node scripts/record-game-feel.cjs` against preview port 5188 for actual screenshots, H.264 MP4 and GIF. The recording uses a returning-player save fixture and Canvas2D for capture; physical-device performance and haptics require an Android playtest.

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
