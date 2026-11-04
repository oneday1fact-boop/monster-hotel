# Monster Hotel: Midnight Check-in

Original offline-first landscape puzzle game built from an empty repository with TypeScript, Phaser 3, Vite and Capacitor. Current version: fullscreen living-hotel update, revised to a cute cartoon hotel cutaway with four distinct rooms and an animated check-in queue. No previous prototype, licensed character design, analytics or live ads are used.

## Develop and test

Use Node.js 24 LTS and npm (minimum Node 22.12).

```sh
npm ci
npm run dev                 # Vite on port 5173
npm run build               # TypeScript + production assets in dist/
npm test                    # 109 unit tests
npm run test:browser         # 31 Playwright browser tests; starts Vite on 5175
npm run preview
```

Browser tests use `/usr/bin/chromium` if available; otherwise run `npx playwright install chromium` once. Keep source files unchanged during browser tests so Vite does not reload the game. Native build directories and reports are excluded from Vite's watcher.

## Play

Open the hotel, enter the lobby, choose an unlocked night, and watch the four guests arrive in a queue. Select a waiting guest and then a room, or drag them into the hotel. The guest travels through the central passage and stays in their assigned room. Residents can be selected or dragged again. Assigning a new guest to an occupied room returns the old occupant to the waiting area. Names in the queue open character cards; room ⓘ controls open room details.

The hotel is a two-storey cutaway:

- **101 / upper left:** elegant moonlight salon, canopy bed and gold trim.
- **102 / upper right:** bright mint linen loft, shelves, flowers and fresh bedding.
- **B01 / lower left:** stone crypt basement, lightwell and padded coffin-shaped bed.
- **B02 / lower right:** orange hearth workshop with stove and exposed pipes.

Room amenities change between nights and appear on each room's label/card. The physical set is its visual identity; amenities and all extra clues define the actual puzzle. Werewolf Luno needs moonlight, jiangshi Dou needs quiet, lantern spirit Ember needs warmth, and mummy Rollo needs dry air. Every room holds one guest. Read **Night clues / 本晚線索** for floor, neighbor, left-of and exclusion rules. Only rooms side by side on one floor are neighbors; rooms above/below one another are not. Twenty explicitly authored nights are each checked for exactly one solution.

Stage 1 hints explain the method, stage 2 identifies an unresolved guest, and stage 3 gives a compatible room using the full rules. Hints do not move guests, cost coins or require ads. Reset clears the current attempt. Returning to selection or reloading abandons unfinished placements. Saved completed-night IDs and coins from previous milestones remain compatible; room IDs inside unfinished attempts were never persisted.

## Presentation, preferences and progression

The canvas fills the available viewport with no artificial letterboxing. The 844 × 480 design coordinates adapt to wider phones and tablets; text and characters retain their proportions while room layout uses the available space. Resizing preserves the current puzzle. Android is locked landscape and requests immersive system-bar hiding, with transient system navigation available by swiping. Traditional Chinese is the default; English can be selected and saved. All gameplay art and text are local. Native assets work without Internet; the web dev build needs Vite and is not a PWA.

Guests have different procedural room activities: Luno crouches and pounces on a moonbeam, Dou practices three hops with landing ripples, Ember plays with orbiting fireflies, and Rollo unwinds and tidies linen from a spool. The room sets also have flickering fire, moon sparkles, a floating basement glow and a fluttering loft butterfly. Tapping a checked-in guest gives a small heart reaction. These are sprite/tween loops, not skeletal or frame-by-frame animation; a feeding/growth system is not included. The operating system's reduced-motion preference skips arrivals, travel and idle loops. The canvas exposes an accessible busy state while characters arrive or walk; input resumes when they finish.

Each night awards 50 coins once. Three purely cosmetic lobby decorations cost 100/200/300 coins; all can be displayed together. Owned items can be put away and redisplayed for free. Shop, settings, guest/room cards and clues are bilingual. Settings provide independent saved music, SFX and haptic switches. Sound is synthesized locally after interaction and pauses in the background. Haptics default off; the official Capacitor plugin handles native feedback with browser vibration fallback where available. If storage is blocked, settings/purchases report session-only changes.

See [角色設定](docs/characters.zh-Hant.md), [二十晚手冊](docs/campaign.zh-Hant.md), [佈置與聲音](docs/hotel.zh-Hant.md), and [橫切面及 Android 驗證](docs/cutaway.zh-Hant.md).

## Android build

A complete workspace-local JDK 21 and SDK 35 toolchain is installed in this cloud environment. Both native build and APK signature verification have passed. To reproduce the setup on this Debian amd64 cloud host:

```sh
npm run android:setup:cloud
npm run android:apk
```

The setup helper downloads pinned Google command-line tools with their published checksum, uses Debian-signed package indexes and verified JDK packages without root access, and retains tools under `/workspace/.tooling`. Gradle's distribution checksum is pinned. The APK helper builds the web app, syncs Capacitor, assembles debug with three workers, and copies the result to:

`artifacts/monster-hotel-midnight-check-in-debug.apk`

On other hosts, use Android Studio, a full JDK 21 (including `javac`), SDK Platform 35 and Build-Tools 34/35. Configure `ANDROID_HOME` or local Android Studio SDK settings, then use `npm run android:sync` and `npm run android:open`. `scripts/android-env.sh` selects retained cloud tools when appropriate without changing `HOME` or system files. APKs, caches, local SDK paths and signing keys are ignored by Git.

This is a **debug APK**, not a store release. Physical-device installation, vibration/audio feel and native lifecycle behavior are not verified: no device is attached and this host has no `/dev/kvm` for an accelerated emulator. Release signing, launcher/store artwork, final app ID ownership, device QA and publication remain future work. No app was published.

## Code map

- `src/domain/`: pure puzzle validation/solver, 20 authored nights, progressive hints and cosmetic transactions.
- `AGENTS.md`: agreed direction, including an actual demonstration screenshot for every future visual update and a clip for motion changes.
- `src/game/viewport.ts`: full-viewport camera sizing and isotropic actor/text compensation.
- `src/game/roomLife.ts`: ongoing room ambience.
- `src/game/layout.ts`: shared cutaway/queue geometry; logical floor 0 is basement and 1 is upper floor.
- `src/game/HotelScene.ts`: scene navigation, arrivals, room assignment and room activities.
- `src/game/art.ts`, `drawMonster.ts`: runtime atlas framing, local art and vector fallback.
- `public/art/guests-cartoon.png`: original simplified cartoon sprite atlas, with clear cell gutters.
- `public/art/rooms/`: four detailed panoramic cartoon room illustrations matched to the approved characters. Rejected painted assets are not shipped.
- `public/art/manifest.json`: art provenance and SHA-256 digests; original generation outputs remain outside the checkout.
- `src/game/details.ts`, `hotelMenus.ts`, `nightSelection.ts`: accessible responsive DOM menus above the canvas.
- `src/i18n/`: bundled English/Traditional Chinese content and clue descriptions.
- `src/platform/`: version-1 save compatibility, preferences, original synthesized audio, haptics and an inactive future ad-provider boundary.
- `tests/`, `e2e/`: unit tests plus real-browser campaign, economy, offline, animation, art and responsive checks.

The 109 unit checks pass; browser coverage now has 31 scenarios, including all twenty nights, topology/render agreement, original asset loading, arrivals, resident reassignment, reduced motion, rewards, save compatibility, shop purchases and sound/haptic switches. Production build passes; Phaser still produces a large-bundle warning (about 1.26 MB minified, 355 KB gzip). Art direction and motion can be refined further after review; no live ad integration is included.

## Room-style and review-format revision

The primitive SVG room placeholders have been replaced by four separate original 3:1 panoramic illustrations, using the approved character atlas as the style reference. Rounded furniture, plum outlines, warm cel shading and distinct palettes tie the rooms to the cast. The cutaway now reaches the left/right edges and uses a compact HUD; residents are larger and their loops more pronounced. Room panels are framed proportionally rather than stretching furniture.

Run `npm run review:record` with Vite running (Node 24 and `ffmpeg` required) to save an actual screenshot, H.264/yuv420p MP4 with fast-start metadata, and an inline animated-GIF fallback in `artifacts/`. Timestamped browser screenshots form the intermediate recording. Review clips are silent full-page captures, including the DOM touch controls. The script verifies H.264 output and a nontrivial frame count. Re-encoding does not establish that every chat client can play a video; use the GIF/download fallback when needed.

Full-screen icon controls, settings switches and language cards are documented in [game UI notes](docs/game-ui.zh-Hant.md). Review recording includes the complete browser frame, including its touch controls.

Four distinct room activity loops now include a moonbeam pounce, hopping practice, orbiting fireflies and linen winding. See [房內角色活動](docs/activities.zh-Hant.md) for choreography and motion limits.

First-night guidance uses short bilingual coaching and passive target highlights, then leaves three guests to the player. Skipping is saved independently; returning players with a completed first night bypass it. See [第一晚互動教學](docs/tutorial.zh-Hant.md).

## GitHub APK downloads

[Android test APK workflow](.github/workflows/android-debug.yml) builds and uploads a 14-day download bundle on every push, with a manual trigger once present on the default branch. It runs unit tests and the existing Android build, verifies the debug APK signature, and includes checksums, build metadata and Chinese installation instructions. It does not create a public Release or publish the app. See [GitHub 打包與下載](docs/github-apk.zh-Hant.md).

The title and lobby now share an original illustrated reception, with live guest sprites and compatible cosmetic decorations. See [標題與前台大廳](docs/reception.zh-Hant.md).

The cover now uses a frame-free illustration with a rounded bilingual upper-centred wordmark. Its small OFL font subset is bundled offline. The first story-night friendship outcome is implemented. The broader heart/gift progression remains proposed in [輕育成規劃](docs/guest-bond-plan.zh-Hant.md).

## Play the first story night

From the lobby choose **Story night: Moonlight & Linen / 故事夜：月光與繃帶**. Assign the four guests, use the draggable curtains or moon lamp to solve their wishes and noise conflict, then choose one of two small character events. The first ending awards 50 coins, friendship and a persistent toy basket. Replays do not farm rewards. The original twenty uniquely solvable levels remain under **20-night puzzle challenge**.

The renderer now uses up to two device pixels per CSS pixel, tightly framed guests, four separate action atlases and room close-ups. See [可玩故事夜與高清示範](docs/story-night.zh-Hant.md) for implemented features, save compatibility, test results and actual previews.
