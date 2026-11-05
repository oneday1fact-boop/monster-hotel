# Project direction agreed with the user

- Communicate with the user in Traditional Chinese / natural Hong Kong phrasing.
- For every visual update, provide an actual in-game demonstration screenshot in the final response. Include a short gameplay recording when motion changes. Save review artifacts under ignored `artifacts/` and link them; do not substitute concept art for the running game.
- The landscape game must fill the available viewport, including wider phone screens, without artificial letterboxing or cropped controls. Keep characters and text in their proper proportions.
- Keep the original cute cartoon hotel cutaway: two visually distinct upper rooms and two distinct basement rooms, with guests entering, queueing, moving into rooms and performing individual ongoing activities.
- Aim for the lively, approachable presentation of a cute raising/management game. Use original characters, artwork and interface designs; do not copy a named game's assets or distinctive designs. The previous painted portrait/card-grid direction was rejected.
- Preserve the four approved guests: werewolf Luno, jiangshi Dou, lantern spirit Ember and mummy Rollo. Preserve the 20 uniquely solvable puzzles, compatible saves, bilingual UI and cosmetic economy unless the user requests a change.
- Live ads and public store publication remain unauthorized. The user has now authorized preparing, release-signing and uploading this game to Google Play internal testing only (2026-11-05). Confirm the existing Play app identity and owner-managed upload key before uploading; do not replace an existing key or claim a completed upload without Play Console evidence. Debug APK builds and local validation remain authorized.

- Review clips must be supplied as H.264 MP4 plus an inline animated GIF fallback; WebM-only delivery was not viewable for the user. Verify the files contain multiple real gameplay frames.
- Room art must match the approved character style and have rich, differentiated furnishings. Primitive geometric placeholder rooms were rejected. Keep the room cutaway near edge-to-edge, with a compact HUD.

- Keep the main HUD minimal: native-style icon buttons and short action labels. Settings, language, night selection and shop must use full-screen illustrated-game panels with large tap targets, rather than document-style links or web form layouts.

- The title cover must remain full bleed with standalone buttons, without the large framed menu panel. Place the cute rounded bilingual 怪物旅館 / MONSTER HOTEL wordmark upper-centre. Keep proposed raising/bond systems distinct from implemented features when reporting.

- The playable story night Moonlight & Linen is the main new gameplay prototype; preserve the original 20 unique-solution nights as a separate challenge mode. Keep both story choices, multiple supply-based room solutions, idempotent first rewards and compatible saves. Show actual high-density close-ups and multi-character event recordings for visual reviews.

- The main lobby now opens a three-chapter guest storybook. Preserve chapter 1 plus the two follow-ups (Ember’s firefly trail; Dou’s midnight dance), sequential unlocks, per-chapter drafts, both endings and one-time rewards. Existing first-story saves remain under `storyNight`; follow-ups use optional `stories[2]` and `stories[3]`.
- Keep the enlarged edge-to-edge four-room layout and illustrated queue floor. On short wide phones, classic puzzle actions sit right of the compact left-hand queue so buttons never cover guests. Use bundled playful numerals/Latin alongside rounded Traditional Chinese; idle guests use the high-resolution action atlas too.
- Lobby decorations must explain their purpose and offer a real in-hotel preview before committing coins. Preview/cancel never charges; native HTML controls must stop pointer propagation into Phaser. Preserve original illustrated decoration sprites, compatible ownership and optional display state.
