# EnglishCode — implementation and verification ledger

The complete scope is in [OBJECTIVE.md](OBJECTIVE.md). This ledger is a continuation checkpoint, not a declaration of completion.

## Required end state

- Consolidate every game from rtsirhc/EnglishCode, Documents/faro, and repos/betting_game. Inventory aliases, non-game materials, and duplicates with reasons; preserve distinct mechanics.
- Professional responsive gallery with real previews, search, categories, CEFR A1–C2, sorting, helpful empty states, and clear launch/setup instructions.
- No accounts or database. Browser-local settings, content packs, and progress. Remove student rosters, personal defaults, school-specific assumptions, live credentials, and hardcoded remote persistence.
- Each game works on a public HTTPS static deployment suitable for Vercel. Convert the Python desktop game. Replace local-only server dependencies while preserving gameplay; explicitly explain genuine online/hardware requirements.
- PWA installability. Per-game offline downloads with complete dependency manifests, atomic success/failure, storage management, and verified cold offline launch. Never advertise offline support based on HTML alone.
- Common, validated JSON content packs where mechanics permit. Per-game adapters must consume those packs; include example, download, import/export, and a copyable AI prompt. Fixed narrative games may retain authored content.
- Common keyboard/touch/gamepad input mappings, configurable by the teacher. Hardware-specific enhancements remain optional and have a usable fallback. Verify without claiming untested physical hardware.
- Document the standard for adding games, content schemas, architecture, and Vercel deployment. Appropriate automated checks and functional/visual browser QA across all games.
- Final deployed URL and evidence for the above; do not publish unfinished/private source data.

## Architecture decisions

Keep existing game source folders and their mechanics. Add a small static gallery at the root, a versioned catalogue, common browser modules, and a reproducible build to `dist/`. Source files and teacher-private artifacts are never served wholesale. Deploy on Vercel as requested, not alternate hosting.

Local imports copy application code and public assets only. Do not copy `.env`, `.vercel`, `private`, student codes, logs, local saved sessions, teacher registers, documents, archives, node_modules, or Git histories. Imported source still needs a privacy/content audit before publication.

## Current evidence

- 2026-11-22: cloned the requested GitHub repository into `/home/benjaminrm10/repos/EnglishCode`.
- Initial scan: 29 upstream games, including a Python/Tk desktop game; React/Vite games; server/socket games; CDN-loaded games; external API dependencies.
- Faro includes lesson activities, folder-based games, Family Feud and Farito. Several aliases point to other activities. Farito currently uses an AI/server proxy and must be adapted without adding credentials or a database.
- Implementation is in progress. No game is considered verified until its launch and actual gameplay, customization (where applicable), persistence, and stated offline behavior have been tested.

## Next work

1. Complete source inventory and sanitized local imports.
2. Implement gallery, content/input settings, build, PWA and validation.
3. Migrate and verify every game; use `catalog/migration.json` for per-game evidence and remaining work.
4. Browser review desktop/mobile, full offline tests, deployment and final completion audit.

## Checkpoint 2026-11-22 (foundation and first migrations)

- 50 distinct catalogue entries and sanitized source trees are present. See SOURCE-INVENTORY.md for aliases/exclusions. Original sources outside this repo are untouched.
- Responsive gallery, local saved collection, URL filters, EN/ES shell, real iframe preview, per-model validated content editor/prompt/import/export, input settings/test panel, storage manager, PWA icons and shell worker implemented.
- Unified build compiles 11 existing Vite applications; root dependencies/lockfile installed. Static source is filtered into dist; no private/server tree is served. Build limits worker threads after host EAGAIN incidents.
- Mission Python port completed and representative custom-pack/reload/victory/cold-offline tests passed. Evidence in browser-control-reports/2026-11-22-foundation.md and catalog/migration.json.
- Content adapters implemented for Mega Console, WH-Questions, World History, Spelling Bee and Sudden Death Spelling Bee. These still require browser verification. Do not mark them offline yet.
- Fixed Spelling Bee root routing, wrong display link, shared cross-game broadcast channel, missing initial display snapshot, and empty-vocabulary setup. Source has a default vocabulary list. Last empty-list fix requires browser retest.
- Removed Grammar Adventurers remote exam submission; browser-local optional score saving replaces it. Browser test pending.
- 13 meaningful unit cases pass across content validation and service worker behavior; catalogue validates all 50 entries. Last full build before the final setup changes passed; rebuild current sources.

### Immediate next actions

1. Finish the running build if still live, otherwise build current sources. Reopen only owned QA sessions after builds (host has limited spare processes).
2. Verify the five new adapters (short packs including 2-option and 6-option quizzes). Fix actual play/score/transition issues; record evidence. Mission is the only advertised offline game so far.
3. Implement browser-hosted transport for original Socket.IO games without a persistent backend; preserve their server/domain logic. Teacher/device flows need real tests, not a generic quiz replacement. Review existing PeerJS games for a consistent online connection option. BroadcastChannel alone is same-browser only.
4. Adapt Faro local server games (Mystery Menu, Clinic Rally, Farito, Family Feud, Grammar Rush) while preserving mechanics; remove root /api assumptions and school/student data. Some game modes inherently require online services; provide truthful functional alternatives without credentials/database.
5. Build a full asset/privacy/CEFR audit across all 50; convert remaining grade choices and hardcoded rosters, localize paths/CDN dependencies, wire appropriate pack/input adapters, repair mobile layout and content errors. Do not simply label all source copies as working.
6. Complete full QA, download tests for every advertised offline game, documentation and Vercel publication. Goal remains active; do not complete on this checkpoint.

### Subsequent checkpoint (same session)

- Added common `play.html` player with library/instructions/fullscreen, content/settings links and optional touch controls. New runtime adapters announce their supported actions; origin/source-checked messages invoke those actions. The catalogue opens games through this common player; raw source URLs remain available for projections/legacy links.
- World History custom quiz verified in Chromium within the player: a 1-item/6-option pack showed six options, completed normal round with 1/1, and completed typed final boss with 1/1. Screenshot `world-history-custom-victory.png` reviewed. Later source edits generalize the custom pack title and add mappings for answers 5/6; those small changes require a browser check.
- Removed unsupported `bluetooth` iframe policy token after a browser warning. Keyboard-style Bluetooth devices do not require that token. Physical hardware remains untested.
- Root content/offline unit cases and catalogue check pass after latest changes. Static reference audit generated in `catalog/source-audit.json` (findings are review pointers, not conclusions).
- Need to re-test Mission offline through the **new player**, since earlier cold-offline proof used the raw game URL. Source audit has not replaced per-game gameplay/privacy review.
- Own browser sessions closed before final build to avoid host process pressure. Do not stop unrelated Brave/Docker/Codex processes. A final build is in progress/just completed; inspect the actual process/output on continuation rather than assuming.

Final verified checkpoint of this turn: full unified build succeeded after all source edits; tests and catalogue check passed. Owned preview server stopped after testing. No production deployment or upstream Git push/PR has been made. Next turn should continue migrations and browser QA under the full objective.

### Offline player and quiz migration

Six games passed a fresh player navigation and a one-item custom round in Chromium at 390 × 844 with the preview server stopped: Bio Master, Geo Master, Mission, Mega Console, WH-Questions and World History. Each was installed through the production service worker before stopping the server. WH-Questions revealed one letter for two points, awarded five for a correct answer, and advanced to the other team. The five other games reached their round completion screen. The run reported no page exceptions or HTTP errors. Wider built-in gameplay, other browsers, and physical controllers remain pending.

Bio Master and Geo Master now compile their original JSX as local production applications and accept quiz packs. They retain their built-in banks. The unified build compiled 13 applications and generated six download manifests. Corrected WH-Questions mobile team selection, hint initialization, feedback advancement, and Mission input readiness. Removed the embedded class roster from Clothing Store Vocabulary Lab and replaced Human Sentence Scramble's sample names with numbered players. A full inventory-wide privacy review remains outstanding.

### Sentence Auction browser rooms

Replaced its production Socket.IO dependency with a dealer-owned browser room. Same-browser mode uses a locked BroadcastChannel room. Separate-device mode loads the bundled PeerJS client and uses public signalling. Bidder messages contain a bid for the current lot, and the dealer sends a filtered question view without verdicts or explanations. Teacher sentence packs feed the actual deck. Recorded verdicts prevent duplicate payouts, and zero bankroll remains zero.

Verified a two-item custom auction in Chromium with two tabs after stopping the preview server. A $150 winning bid produced $1,150, then an all-in incorrect verdict produced $0. Both screens agreed. Completion and dealer departure returned the bidder to the lobby. Tested the same flow with two isolated browser contexts through public PeerJS signalling. Each viewport stayed within its available width. Common player controls were added afterwards and require the final regression run. Physical devices and restricted school networks remain untested.

### Flags and Tense Master follow-up

Flags & Nationalities now ships 249 local flag images, country names and demonyms. Its previous REST Countries endpoint returned a deprecation message. Country/demonym data is distributed with its ODbL license and attribution, flags with MIT attribution, and 2023 World Bank population values are used for the existing question ordering. A mobile Chromium run downloaded the game, stopped the preview server, completed 20 turns through common Confirm/Next controls and replayed. Every displayed flag loaded, answer options were unique, and no page exceptions or HTTP failures were reported.

The final Sentence Auction regression passed using common player controls. The separate-browser PeerJS run and the six earlier offline game custom-round checks also passed after the common runtime was refactored.

Tense Master had a bare import in a classic script. Its original compiled React code now builds as a production app, accepts teacher quiz packs and registers mapped controls. Six-option custom quiz play, wrong answer handling, malformed legacy leaderboard tolerance, offline player launch and authored round start passed at mobile width. Two authored 30-question rounds completed with recognition, fill, correction and table questions represented. The final run selected error words using keyboard Enter after conversion to native buttons. The unified build now compiles 14 applications and produces nine download manifests.

### Detective Case Files verification

Removed external font requests and added explicit complete offline assets. Original 11 authored mysteries and their questions remain available. Added common answers 1–4 for the first unanswered question and Confirm for submission. Story evidence can be toggled with keyboard Enter/Space. Old saved state is normalized before use, preserving valid report fields and scores while discarding invalid values. Mobile header positioning and stamp animation containment were corrected after browser checks.

A production Chromium run at 390 × 844 downloaded the game, stopped the preview server, opened the player from a blank page, solved all 11 cases and answered all 55 questions with the common controls. A collected clue and investigator's report draft survived reload. Retrying a case with one wrong answer and one hint produced four correct answers and the expected 25-point deduction. No page exceptions, HTTP failures or viewport width overflow were reported. Reviewed screenshot detective-mobile.png. Root build, tests and catalogue validation passed after the final code changes.

Current generated output contains 50 catalogue entries, 14 compiled applications and 10 explicit offline manifests. The full objective remains active. Outstanding work includes the other backend-dependent games, Faro server games, per-game content/input/privacy reviews, remaining UI/physical-controller QA and Vercel publication. The Time Zone Travelers source was inspected but not changed: its intro still describes time zones while its authored bank contains general English questions, and its fixed-height/timer behavior needs review.

### Time Zone Travelers

Its authored deck contains general English questions, so the introduction and gallery description now explain the actual spoken-answer team game. The original map presentation remains. Added validated word/clue packs, dynamic question count and common controls for reveal/correct/incorrect. Local generated tones replace missing root sound-file requests. A verdict locks the turn during feedback, timer effects clean up on pause and turn change, reveal pauses the timer, and a tied result names every team with the highest score.

A mobile Chromium run downloaded the production game, stopped the preview server and opened the player from a blank page. A three-item teacher pack passed timeout, pause/resume, wrong answer/retry, 1-point retry and 5-point first-attempt scoring, tied winners and replay. The viewport width stayed within 390 pixels and the run reported no exceptions or HTTP failures. An early test found the intro arrows covered by the title; they were moved to the lower corners and the navigation passed. Full authored 30-question QA remains pending. Root build, tests and catalogue checks passed. The current output has 11 explicit offline manifests.

### Grammar Battleship

Replaced the production Socket.IO client with a browser-owned room adapter that calls the original GameManager. Same-browser mode uses BroadcastChannel and a host lock. Separate-device mode is implemented with the bundled PeerJS client and public signalling. Both players keep their own filtered board view. The host maintains private fleet state and validates placement, actor identity, attack coordinates and verdict types.

Fixed a domain bug in which an incorrect grammar verdict erased a ship segment. It now costs the turn and leaves the target available for a later attempt. A distinct retry marker explains that state. Correct water misses remain misses, and a correct hit consumes a segment. Added native keyboard-accessible board cells, common placement/validation controls, mobile board scrolling guidance, connection error/leave handling, and typed JSON axes packs. Axes packs require at least 10 distinct subjects and 10 distinct participles and use the existing import/export/example/AI-prompt UI.

Two mobile same-browser runs explicitly downloaded the game, stopped the preview server and played the full match. Both fleets had 17 segments, opponent ships stayed hidden, overlap placement was rejected, failed grammar left the fleet intact, a later attack hit that cell, a valid water miss was recorded, all 17 target segments produced a winner, and host departure returned the opponent to the lobby. The final core-flow run asserted the water-miss state. Reviewed battleship-mobile.png.

Separate-context PeerJS QA is still pending. The first attempt did not reach setup within its five-second assertion. Subsequent attempts with a 30-second diagnostic could not launch Chrome because of host pthread/EAGAIN resource errors. The managed Chromium browser failed with the same resource error. No unrelated user browser was closed. The full build subsequently passed outside the restricted process environment, producing 14 compiled applications and 12 download manifests. Root tests and catalogue checks passed. Small subsequent mobile hint and page-restoration changes compiled successfully but have not received another browser pass.

Next continuation should re-run /tmp/ec_battleship_peer_check.py when the browser can launch, inspect both role screens on any connection failure, and verify the pending separate-device path. Continue the remaining server games and all other objective requirements. Goal remains active.

### Compliance Cipher and final Battleship connection checks

Compliance Cipher now builds its styles and browser code locally. It preserves solo play and a teacher classroom dashboard with independent team progress. The shared room transport supports locked BroadcastChannel rooms and bundled PeerJS signalling. Solo state persists by content fingerprint. Team tabs retain their own identity on reload, and simultaneous copied identities receive separate local room reservations. Late replies from abandoned sessions are ignored.

Teacher content uses the existing word/clue editor. The original sustainability clues were clarified: PLAN-3 now explicitly asks for the first four letters of Planet, and recycling is correctly identified as the third R. Hints charge 60 then 300 seconds per stage. Server-owned elapsed time, stage checks and one-time final timing replace client-submitted level/timer claims. QRCode.js is loaded as a local classic script with its license because its original code relies on classic-script semantics.

Production Chromium Headless Shell tests at 390 × 844 downloaded the game, stopped the preview server, completed all four authored stages, checked an incorrect key, both hint penalties, saved stage reload and replay. The gallery editor saved a two-word custom pack. A teacher room generated a QR code and join link, received the team progress to 100%, and the team recovered its stage and name after reload. Host departure returned the team to setup. No page exceptions or HTTP failures were reported. Reviewed cipher-teacher-mobile.png and cipher-team-mobile.png. The QR panel uses a single column on mobile.

Battleship's public PeerJS transport completed a full match using two clients in pages of one context. The run covered the same fleet privacy, grammar failure/retry, miss, hit, victory and departure behavior as the offline run. This adds online transport evidence. Isolated contexts, separate hardware and school-network conditions remain unverified.

Single-process Chromium Headless Shell allowed these runs under current process pressure. Earlier Chrome/Chromium launches failed with pthread resource exhaustion, and one Battleship run was interrupted at creation of the second browser context. Owned test servers and browsers closed at each completed run.

Current build has 50 catalogue entries, 15 compiled applications and 13 explicit offline manifests. Root test suites now include Cipher domain timing/progression, native-channel room routing/closure, old input-map expansion, Battleship rules, pack schemas and offline downloads. Build, tests and catalogue validation passed. Full project requirements remain active, including the other backend-dependent games, remaining per-game privacy/input/content reviews, full QA and Vercel publication.

Compliance Cipher online follow-up: the public PeerJS classroom scenario completed with two page clients in one single-process Chromium context. The host created its QR and room, the team joined and completed the custom mission, the host saw the final state, and host departure returned the team to setup. The scenario printed PASS before process exit 143 during cleanup. Inspection confirmed both test server ports closed and no corresponding Python check process remained. This verifies the tested page-client online flow. Separate physical devices and network restrictions remain untested.

The native BroadcastChannel transport test also verifies private replies, reservation of the host, distinct IDs for copied team tabs and closure of both participants. Input mapping migration tests verify that a new Hint action preserves previous saved keys/buttons while assigning distinct remaining bindings.

Time Zone Travelers authored round follow-up: the production download opened after preview shutdown and completed all 30 original questions with common reveal/correct controls. The run checked each question counter and the final tied winners, Teams 1 and 2 at 40 points. No page exceptions or HTTP errors were reported. This completes the previously pending authored round check.

### Spelling games

Spelling Bee passed cold offline solo retry and two-player elimination through the podium, same-browser late classroom projection, live transcription, selected gallery vocabulary and replay. Fixed solo wheel locking, duplicate participant nicknames and the teacher dictation word. Each teacher now uses a separate projection channel. Setup uses generic names and native controls work with common Confirm/Next actions.

Sudden Death Spelling Bee now completes each turn once, clears its selected player after grading and displays teacher standings at game end. The 60-second timer uses a deadline, supports pause/resume and stops at zero while preserving teacher adjudication. Spin animation timers dispose on unmount. Each teacher has an isolated projection channel. Hidden words remain in the teacher tab until revealed. The bundled A1/A2 vocabulary and shared word-pack adapter remain available. Native browser speech is optional because teachers can read the visible word aloud.

The Chromium production check at 390 × 844 downloaded the game, stopped the preview server and opened a fresh gallery player and late projector view. Three participants completed a correct auto-checked turn followed by two teacher-judged eliminations. It checked duplicate-name rejection, hidden/revealed words, live transcription, timer start/pause/resume/expiry, disabled repeat verdicts, matching three-place podiums and replay. The original test compared rendered uppercase names with their source strings, so its assertion was corrected. A real animation overflow on the podium was fixed and the final run passed viewport width verification. Reviewed ec-sudden-teacher.png and ec-sudden-podium.png. Physical projection, browser voice playback and hardware controllers remain unverified.

Current build contains 50 catalogue entries, 15 compiled applications and 15 explicit download manifests. The whole objective remains active, including remaining game migrations, full privacy/content/input QA and Vercel publication.

### Operation Chronos

Extracted the original four-phase mission into local task and runtime modules. It retains 10 navigation choices, 10 past-perfect timelines, 25 science questions with a three-strike phase reset and 10 sentence corrections. Fixed a past-perfect answer and used the stable largest-planet question instead of changing moon counts. Sentence input accepts case, spacing and final-punctuation differences while retaining the authored grammar target. Removed insulting feedback and corrected the game description to match its actual activities.

Cards are native buttons, sentence inputs are labeled and the common controls announce Confirm plus the available numbered choices for each phase. The layout scrolls on mobile. Expiry closes feedback and clears its callback before showing the end state, preventing pending success feedback from reviving an expired mission. A full cold offline mobile Chromium run completed all 55 tasks with common controls, wrong choice retry, all timelines, a three-strike restart, all science questions, rejected/corrected sentences, success and replay. It then expired a new mission with feedback open and verified the dialog stayed closed and the timer showed 00:00. No page errors or HTTP failures. Reviewed ec-chronos-timeout.png.

The generated build now has 16 explicit offline manifests. Remaining source/server migrations, complete per-game QA and actual Vercel deployment remain open.

### Blackwood Manor

The investigation retains its fictional cast, images, route report, suspect alibis, three-question grammar encryption and final indictment. Corrected an educational defect in the original alibi task: using simple past after before was treated as a lie. The replacement uses a contradiction between the nephew's past-perfect claim and an explicit confirmed death time. The train question now clearly contrasts simple past with past perfect.

Route checks use whole preposition tokens and the requested 3–5 sentences. The final report requires at least 100 words, five distinct prepositions and a past-perfect form in three separate sentences. Both reports explicitly ask for teacher review and approval after these structural checks. They provide no automatic claim of semantic or grammatical correctness. Editing a ready report invalidates its approval. Unit regressions cover substring false positives, length and sentence thresholds. Trivia answers lock during feedback, preventing overlapping transitions. The evidence dialog has native close, Escape and contained Tab focus. Removed the inert 60-minute label and external fonts. Updated mobile sizing and contrast.

The complete production offline Chromium run at 390 × 844 checked the route's invalid and valid submissions, edited-report invalidation, evidence opening/closing, an incorrect alibi and the corrected chronology, a trivia retry and all three answers, a short rejected indictment, a full report, teacher approval, all evidence unlocks, case closure and replay. Server was stopped before opening the player. No page exceptions, HTTP failures or viewport width overflow. Reviewed the evidence and closed-case screenshots under browser-control-reports/assets/2026-11-22-migrations.

The current generated output contains 50 entries, 15 compiled applications and 17 offline manifests. All seven root test files and catalogue validation passed. The complete project goal is still active. Backend-dependent games, remaining privacy/content/input reviews, broader browser/hardware verification and Vercel publication are still pending.

### Grammar Time Machine

The seven authored A1/A2 chapters now compile with local Tailwind styling and the shared runtime. Matching cards are native buttons. Chapter transitions cancel pending feedback timers and reset the past-time visual filter. Quizzes use mapped numbered controls, chapter navigation uses Next and the final time-machine toggle uses Confirm. The production download includes its generated JavaScript and CSS. Initial cold-offline Chromium gameplay completed all seven chapters, ten matching pairs and ten quiz questions. Follow-up verification covers incorrect-answer retry and navigating away during pending feedback.

## Transformation Taboo browser rooms

The teacher tab now hosts the transformation drill and the 15-card Taboo game. The student joins with an eight-character room code. Same-browser tabs use the downloaded app and BroadcastChannel. Separate devices use PeerJS signalling. Teacher sentence packs add a correction drill alongside the nine built-in tense categories. Role-specific snapshots keep future cards and the drill answer key off the student connection.

The original final card hid the only action leading to results. Both success and timeout now expose the final-score action. Late joiners inherit the active timer phase. Expired teacher grades and guesses are checked against the current deadline. Chromium completed a one-card custom drill with retry, all 15 Taboo rounds, final scores, reset and host departure in both connection modes. Separate-device mode was exercised through two origins within one browser context. Physical classroom devices and the public deployment remain pending.

## Vocab Spelling Bet

The teacher browser now hosts the dictation game, using same-browser tabs after download or PeerJS with separate devices. The teacher can choose the original 115-word bank or a validated word pack. The student places wagers and receives the spelling after grading. The teacher's browser stores the best times. The app retains streak bonuses, every fifteenth all-in round and debt-based penalties. Engine tests cover the original bank and the correction override. Two mobile-sized Chromium tabs completed all 15 rounds of a custom pack with the HTTP server stopped.

## Sentence Showdown

The teacher hosts the room in a browser tab and shares a link that carries the room code and connection mode. The original listening and pronunciation banks are available alongside the shared JSON sentence packs. The teacher controls the buzzer, the timer and pronunciation grading. Players can wager points, buzz in and request steals. In dictation, the public player state hides the sentence until the round ends. The browser caps timeout transfers at the losing player's available balance. If a player leaves, the room returns to setup and resets the scores for the next pair.

Chromium completed one three-screen match with the HTTP server stopped, using a custom sentence pack, three rounds, an all-in victory and replay. The deployment and physical controller checks remain pending.

## Grammar Adventurers

The book keeps its seven illustrated chapters, The Vault and the original 20-question mock test. A validated quiz pack can replace the test questions. Optional nicknames and scores stay in the browser. Six local WebP images total about 300 KB. The matching game accepts either interchangeable “Are” tile. Chapter navigation uses labeled links, and the player exposes mapped page turns and numbered options.

A mobile-sized Chromium run with the HTTP server stopped completed all seven chapters, all nine Vault questions, the authored test at 20/20 and a six-choice custom test. The saved score survived reload. No external requests or page errors were observed.

## Escape Planet Earth

The teacher tab hosts a room with up to 30 teams and a live leaderboard. The local QR code opens the team page with its room code and connection mode. The host grades answers, tracks each team's letters and penalties, and records completion after the final escape code. A team can retry a door while retaining its elapsed time and hint costs. The five authored sustainability question sets remain linked to their word locks.

A mobile-sized Chromium run with the server stopped joined two teams, applied both hints to one team, retried its first room and escaped through all five doors. The second team stayed on its first question. The teacher ended the room and the student screen returned to setup. The former database integration is absent from the production bundle.

## Grammar Betting Game

The teacher tab hosts this multiple-choice game. Team links and locally generated QR codes point to the hosted room. Teachers can choose the original 60-question bank or import a quiz with up to six options per prompt. The host locks one wager per team and settles each round once. Correct teams earn their stake and split lost points. A team with a nonpositive balance can stake 10 points and keep playing. The game shows the winner on each screen and supports replay with the same teams.

Chromium completed a three-round custom quiz with the HTTP server stopped and through PeerJS between distinct loopback origins. The run included an expired timer, the 1,000-point no-vote penalty, a wager while in debt, final scores and replay.

## Grammar Auction

The teacher tab hosts the original legal/illegal wager game. A room accepts two to eight teams using a link or locally generated QR code. The game supports the original 50 sentences and validated teacher sentence packs. A round settles once and shares lost classroom points among correct teams. The teacher judges the original final challenge by entering the leading balance in English. An incorrect spelling changes the standings before the next attempt and the feedback locks duplicate submissions.

Chromium opened three screens from the downloaded app after HTTP shutdown. The match reached the balance challenge, changed leaders after a miss, announced the winner to both teams and replayed with starting balances. The original filename redirects to the catalogue entry while preserving the room link parameters.

## Classroom Feud

Teachers select an authored theme or a validated JSON survey. Team nicknames are optional. The teacher panel controls reveals, manual scores, speaking turns and a 15-second clock. Each game has a separate projector channel. The projector can reopen midgame, receives answers only as they are revealed, and reports room closure. It has a dark backdrop and a layout that can scroll on narrow displays.

The offline browser test covered a complete two-question survey, a timed strike, mapped reveals, projector reopening, final scores and replay. A second room opened an authored theme and revealed its first answer without connectivity.

## English World Cup

The World Cup build now serves the local stadium clips and typefaces from its game directory. The published files total about 13 MB. The original school badge is absent from the published build. Native nickname fields, answer buttons and directions support local play on touchscreens and keyboards alongside the two-controller layout. Imported quizzes accept two to four options. The service worker supports single byte ranges from downloaded files.

A Chromium run with HTTP stopped exercised a two-option pack, a penalty minigame and a five-goal championship. Phase transitions now follow wall time so a slow video renderer cannot leave the game on the answer reveal. The remaining minigame variants and physical controllers need further verification.

## Memory Court

The activity starts a five-minute reading window on demand and supports an early finish. The original fictional passage and all 15 linked questions are available offline. The teacher can require a buzz for each team attempt. A wrong answer hands the buzzer back to the class. The final screen reports first-attempt accuracy, and the teacher can replay or switch to solo mode.

## The Party Invite

Seven slides guide partner practice, invitations, scheduling and a final report. The presentation uses English facilitator instructions and general classroom branding. Five timed segments total 33 minutes. The teacher can pause, reset or advance with mapped controls. The offline Chromium test covered all slides and navigation in both directions.

## Mystery Menu

The entry offers team competition and a separate cashier. The teacher, consultation and projector views share a browser-local game. Web Locks serialize writes and revision checks prevent stale purchases and stale verdict submissions. Teachers can enter the three judge scores offline or import a validated verdict. Exported judging briefs identify teams by ID and leave out their nicknames. Checkout uses either a typed barcode or product search.

Chromium completed the teacher, consultation and projector flow after HTTP shutdown. The standalone cashier supported payment, undo and reload. Separate-device consultation and physical barcode scanning remain pending.

## Clinic Rally

The teacher browser hosts the race state, scoring and deadline. Teams can join from tabs in the same browser after download or use the PeerJS option on separate devices with internet. The five modes, illustrated vocabulary, matching, sentence ordering and optional dexterity rounds remain available. The teacher can select one to five teams and use an imported multiple-choice pack. The projector and teams track the same scoreboard, and the teacher can recover the last tournament after reload.

The cold-offline Chromium run opened two team tabs and the projector after HTTP shutdown. It completed all five modes with a six-option custom quiz and 15 dexterity rounds, then recovered the final scoreboard after reload. The scenario used the reduced-motion rendering.

A second Chromium run used public PeerJS signalling across distinct loopback origins. It verified the lobby QR, an incorrect answer, victory at 12 points, a live projector and room closure. Separate physical devices remain pending.

## The Missing Key

The four authored escape cases are identified by CEFR level from A2 to B2. The school-route case uses a fictional corridor so players can find every letter without visiting the original building. The clues can be projected, read on a phone or printed from the browser. The B2 bonus can be opened on the same projector during the B1 case. One to forty numbered teams can share the timed lock, and the first escape and other scores survive reload.

Chromium completed all four cases with two teams after the preview server was stopped. The run checked the cooldown after a wrong code, pausing and adding time, the B1 prerequisite for bonus submissions, and keeping the projector zoom while scores change.

## Pronunciation labs

S & Z and Beer, Bird, Bear, Beard retain eight teaching slides each. Short word and sentence clips can be played individually. Classroom mode lets the teacher reveal the answer after students show a number. Solo mode records answers and reports a score after 14 prompts for S & Z or six for Beer, Bird, Bear, Beard. The prompts do not repeat within a round, and a reload or mode switch preserves progress.

The original American English recordings were converted to MP3. The 45 local clips total about 760 KB across both labs. Each game download includes its own recordings. Chromium at 390 pixels completed both solo rounds with HTTP stopped, checked exact scores and replay, and verified audio, answer reveal and mode-specific progress.

## Guess the Patient and Health Lotería

Guess the Patient retains three illustrated boards and adds toggled picture descriptions, persistent cross-outs and a solo opponent that answers yes/no questions. The picture tiles are local WebP assets. Chromium loaded all 36 tiles and verified both modes after HTTP shutdown.

Health Lotería includes the original 48 cards, the four illustration sheets and 96 recordings for words and riddles. A caller can open any of 23 generated digital boards and students can print or mark them. Students can also draw their own cards in solo mode. A row, column or diagonal wins. The same-browser class boards receive only revealed cards for marking, and undo removes a mark if its card is withdrawn. Teachers can import a words pack and read the entries aloud or use an installed local English voice.

With HTTP stopped, Chromium completed the full authored deck, a synchronized digital board, and a four-word custom solo board. It also tested hidden clues, the automatic timer, undo and saved marks.

## The Dental Lab and Monster Smiles

The Dental Lab now loads the original local 3D vocabulary demonstrations. Its illustrated view supports reduced motion and browsers with unavailable WebGL. The 22 slides use A1, A2 and B1 labels. The built-in and imported words decks each offer a finite, non-repeating clue round with answer reveal and replay.

Monster Smiles supports one to six numbered teams. It preserves authored vocabulary, oral challenges, memory trays, timed turns, coins, tooth recovery and undo. The projected view shows the live game and hides the answer reference before grading. Teachers can select an imported multiple-choice deck. The solo quiz scores selections, and the authored solo mode presents a model for self-grading.

Chromium at 390 pixels tested an offline Dental Lab lesson, both practice decks, and an offline Monster Smiles game with a teacher, projector and individual quiz.

A separate cold-offline Chromium run with software WebGL verified the Dental Lab canvas, drill and filling animations, and pause.

## Classroom Survey Show

The Faro survey game now has its own title and board. The three authored A1–B1 classroom banks and original generated sound cues remain available, and validated survey packs can supply a custom deck. Its face-off, three-strike steal, one-at-a-time board review and double and triple rounds run in the browser. The teacher can type a spoken answer for an exact or alias match, accept a response from the answer list, or mark a strike. The projector receives a filtered view. Browser-local progress includes undo history.

Native buzzers and the shared controls work during ordinary play. The optional serial controller accepts A/B lines and writes the reset command used by the original Arduino. An optional browser dictation feature requires on-device processing and fills the editable answer field for the teacher to review. [Web Speech API specification](https://webaudio.github.io/web-speech-api/#dom-speechrecognition-processlocally)

Chromium completed four imported rounds after HTTP shutdown. The run covered the face-off, clock, successful steal, undo, review, reload, synchronized scores and a fresh authored round.

## Farito

The three-stage mission keeps the lighthouse mascot and the authored eight-word family review. Learners write six replies in a guided conversation and arrange a fictional cast, outfits, setting, activity and pet in a locally drawn portrait. They can export the portrait as PNG. The vocabulary review also accepts a validated words pack, and the mission saves progress in the learner browser.

Teachers can open a browser room and share its link. Same-browser rooms work from the download. Separate-device rooms use public PeerJS signalling. The teacher sees numbered participants, progress and help requests, and can acknowledge a request. Rejoining recovers the learner's own progress. Conversation and portrait data stay on the learner screen.

Chromium tested the mission, PNG download and a two-learner classroom with HTTP stopped.

## In a Clothing Store and Clothing Vocabulary Lab

The store lesson preserves all 36 authored slides. The tracks use A1, A2 and B1 labels and the current slide survives reload. Five role-play cards provide separate customer and clerk lines, including plural items, sizes, prices, colours and the fitting room.

The lab keeps 81 vocabulary entries, five illustrations and 60 authored challenges. A words pack adds its own dictionary category and review questions. The glossary, challenge and sketch state persist. A teacher can choose numbered participants and generate turns using only those present. A separate projection tab shows the current card and reveals the example on command.

The cold Chromium run visited all slides, completed all three authored challenge decks, tested the role cards and a projected sketch, and opened a custom pack saved through the gallery editor.

## Numbers, Dates & Times, Daily Routines and Family Sprint

The Numbers board keeps 28 slides across A1, A2 and B1, 30 quick prompts per track, 30 listening prompts used in A1 and A2, and 30 B1 pronunciation sentences. The three former level URLs still open their corresponding tracks. Its 15-minute clock measures elapsed time, supports pause and restart, and recovers the remaining time on reload. The 148 audio files are bundled with the activity.

Daily Routines keeps all 31 authored slides and plays 17 local audio files for examples and listening practice. Learners can answer choices and use three times to build a routine in English. The schedule and lesson progress stay in the browser. Teachers can add a separate quiz deck with two to six options per question.

Family Sprint keeps 54 notebook activities across A1 and A2, including model answers, hints and extensions. Teachers can import a separate vocabulary deck. The lesson tracks progress independently for each authored deck and each imported word pack.

Chromium at 390 × 844 ran all three activities from the PWA after shutting down HTTP. The checks covered three Numbers tracks, the Daily Routines lesson with its imported quiz, and both Family Sprint decks with imported vocabulary.

## Speaking Quest

The nine-slide group activity preserves the organizer and guest dialogue, three invitation rounds, unique-guest scoring and reflection. Learners use paper tickets with a nickname or number. The optional countdowns cover 28 minutes across five slides. The PWA keeps the current slide and remaining time locally. Chromium tested all slides, timer controls and recovery after download and HTTP shutdown.

## Restaurant Mission

The pair-practice activity retains 15 authored scenes and their matched two-voice audio. CEFR tracks distinguish guided A1 orders, everyday A2 service and B1 requests and problems. The customer can hide their lines while the audio plays, then switch roles. Each recording is bundled for offline play. The browser retains the scene, line visibility and speaking timer.

Chromium opened the production download with HTTP stopped, checked all dialogue lines and played all 15 recordings. The run also verified the five-scene cycle in each track, mapped line concealment, and timer pause, reload, expiry and reset.

## The Worst Restaurant in the World

Three CEFR decks retain 48 authored cases. Each match draws 12 and preserves the read-listen-correct sequence, ten-second clock, manual scoring, grammar bonus, steals, undo and podium. The same-browser projector follows the current stage and withholds the waiter reply and grammar bonus. The model correction appears only when the teacher reveals it. The teacher can use the shared mapped controls or the buttons in the teacher view.

The gallery also accepts a version 1 dialogues pack. Its order, mistaken reply and polite correction feed a complete game. An optional grammar note enables the three-point bonus, and shorter packs adjust the round count.

Chromium completed an authored match and a one-round imported pack after HTTP shutdown, including the projector and timer recovery. The build publishes explicitly declared Faro files, excluding authoring metadata and unused media while preserving supported aliases.

## Public release · 2026-11-23

EnglishCode is available on the public Vercel HTTPS domain. The deployment contains the reviewed static build. GitHub remains the original source remote. [Open EnglishCode](https://englishcode-gallery.vercel.app/)

The catalogue includes 29 upstream games, 20 Faro games and Grammar Rush. It has 14 categories, skill filters, CEFR A1–C2 filters and 33 working teacher pack editors. C2 remains available as a filter for future activities. [Source inventory](SOURCE-INVENTORY.md) · [Adding games](ADDING-GAMES.md)

The release audit verified the build, all 50 public entry URLs, 50 download manifests, public service-worker headers, Chromium installability and a fresh offline game after disabling the browser network. The browser also exercised search, category and level combinations, sorting, English and Spanish, collection, preview and downloadable content. Native input, a remapped key, a simulated controller button and mapped touch controls advanced the same activity. Physical accessories remain browser- and device-dependent. [Browser evidence](../browser-control-reports/2026-11-22-migrations.md)
