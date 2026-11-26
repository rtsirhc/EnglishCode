# 🎓 EnglishCode

Free English classroom games from Christine's original EnglishCode collection, the Faro lessons, and Grammar Rush.

The gallery catalogues 50 games. It supports filters by CEFR level, skill and game category, browser-local collections, game previews, validated teacher content packs, configurable controls and explicit offline downloads. [Open the public gallery](https://englishcode-gallery.vercel.app/)

## Run the gallery

Use Node.js 22 or newer. From this repository root, run:

```sh
npm ci
npm run dev
```

Open the local address printed by the server. The server compiles every application and serves the public `dist/` output. For a production build, run `npm run build`. Vercel uses the root `vercel.json`.

## Prepare a lesson

Open a game card to preview it, read its setup requirements or choose Play. Games with a content editor accept a version 1 JSON pack. The editor includes an example, validation, import/export and a prompt you can copy to an AI tool. Browser storage keeps your changes on that device.

Choose Download offline for a downloadable game before leaving your connection. Wait for confirmation, then use the library or player to open it. Multiplayer connection requirements appear in each game's instructions. Settings lets you map keyboard-style clickers and gamepad buttons. The player offers touch controls for the actions supported by that game.

All 50 games have verified download and cold launch in Chromium. Classroom modes that use separate devices can still need internet for signalling. Per-game notes record which modes were exercised. [Implementation ledger](docs/IMPLEMENTATION.md) · [Migration evidence](catalog/migration.json)

## Add a game

Follow [Adding games](docs/ADDING-GAMES.md). The canonical catalogue is [catalog/games.json](catalog/games.json). Validate changes with `npm test`, `npm run check` and `npm run build`, then verify the real gameplay and advertised download mode.

## Original repository games

| Game | Folder | What it is |
|---|---|---|
| 🕵️ Detective Case Files | [`detective-case-files`](detective-case-files) | Murder-mystery reading game: 11 cases, collect evidence, accuse the culprit, investigator's report |
| 🧬 Bio Master | [`bio-master`](bio-master) | Biology vocabulary & science quiz |
| 👪 Classroom Feud | [`classroom-feud`](classroom-feud) | Family Feud-style team game |
| 🔐 The Compliance Cipher | [`compliance-cipher`](compliance-cipher) | Escape-room activity |
| 🚀 Escape Planet Earth | [`escape-planet-earth`](escape-planet-earth) | Multiplayer escape game with teacher dashboard |
| 🏳️ Flags & Nationalities | [`flags-and-nationalities`](flags-and-nationalities) | Countries, flags & nationalities quiz |
| 🗺️ Geo Master | [`geo-master-primary-edition`](geo-master-primary-edition) | Geography quiz |
| 🧭 Grammar Adventurers | [`grammar-adventurers`](grammar-adventurers) | Grammar adventure & mock test |
| 🏛️ ESL Grammar Auction | [`grammar-auction`](grammar-auction) | Bid on correct/incorrect sentences |
| 🚢 Grammar Battleship | [`grammar-battleship`](grammar-battleship) | Battleship with grammar questions |
| ⏳ The Grammar Time Machine | [`grammar-time-machine`](grammar-time-machine) | Interactive tenses storybook |
| 🧍 Human Sentence Scramble | [`human-sentence-scramble`](human-sentence-scramble) | Students form sentences with word cards |
| 📚 Memory Court: Library Kiosk Trial | [`library-kiosk-buzzer`](library-kiosk-buzzer) | Timed reading-memory buzzer challenge |
| 🖥️ Mega-Console | [`mega-console`](mega-console) | Six-level vocabulary, spelling and science challenge |
| 🐍 Mission: 30-Stage Override | [`mission-30-stage-override`](mission-30-stage-override) | Vocabulary & trivia security challenge |
| 🎯 Operation: Chronos | [`negotiation-tactics`](negotiation-tactics) | Negotiation/tactics mission activity |
| 🏚️ The Paradox at Blackwood Manor | [`paradox-blackwood`](paradox-blackwood) | Mystery adventure |
| 💰 Sentence Auction | [`sentence-auction`](sentence-auction) | Multiplayer sentence auction |
| 🤠 Sentence Showdown | [`sentence-showdown`](sentence-showdown) | Multiplayer sentence duel |
| 🐝 Spelling Bee | [`spelling-bee`](spelling-bee) | Spelling bee |
| 🐝 Classroom Spelling Bee (Sudden Death) | [`sudden-death-spelling-bee`](sudden-death-spelling-bee) | Sudden-death spelling bee |
| ⚡ Tense Master: Sudden Death | [`tense-master-sudden-death`](tense-master-sudden-death) | Verb tenses elimination game |
| 🌍 Time Zone Travelers | [`timezone-game`](timezone-game) | Time zones & telling time + placement test |
| 🚫 Grammar Arena (Transformation Taboo) | [`transformation-taboo`](transformation-taboo) | Sentence-transformation team game |
| 🎲 Vocab Spelling Bet | [`vocab-spelling`](vocab-spelling) | Bet points on vocabulary spelling |
| 🏛️ Grammar Auction – Betting Game | [`webrtc-betting-game`](webrtc-betting-game) | Phone-connected multiplayer grammar auction |
| ❓ WH-Questions Game Show | [`wh-questions-game`](wh-questions-game) | WH-questions game show |
| 📜 World History Quiz | [`world-history-quiz`](world-history-quiz) | Parchment-style history quiz |
| ⚽ English World Cup | [`world_cup`](world_cup) | Penalty-shootout English quiz |

## 📁 Other folders
- `libs/`: legacy shared browser libraries.
- `.agent/skills/`: the ESL App Creator skill used to build these games.
