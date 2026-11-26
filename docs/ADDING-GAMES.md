# Adding a game to EnglishCode

Every game keeps its own mechanics and art direction. The gallery provides discovery, local content packs, controls, and explicit downloads.

1. Add public browser application code/assets to a descriptive folder. Do not include personal rosters, student codes, local saved sessions, server secrets, archives, reports, dependencies, or another Git history. Keep original authored story characters; distinguish them from actual student data.
2. Add one entry to `catalog/games.json`. Use a stable ID, title, honest description, reviewed CEFR levels, skills, theme, source, and an entry beginning with `/`. CEFR classifies language demand, not school grade. Do not invent C1/C2 content to fill a filter. Set `duration` to a positive number of minutes when supported by the activity, or leave it null. For a timer that ends the entire game, also set `durationLimit: true`.
3. Use local assets. A Vite source app is compiled automatically if its package has `devDependencies.vite`; required browser/build dependencies are installed once at repository root. For React games that use only the root dependencies, set the catalogue field `build` to `vite-react` and use a module entry in the game HTML. The unified build sets its base path. Use hash routing for in-game pages; use `import.meta.env.BASE_URL` for app links. Keep all server/domain logic separate from persistent network services.
4. For custom content, choose `words`, `quiz`, `sentences`, `survey`, `axes`, or `dialogues`. Import `gameRuntime` from `/gallery/shared/runtime.js` in static modules, or import storage/content modules by source-relative path in bundled apps. The runtime returns a validated `pack` or null. Consume the pack in the real game bank, with an authored fallback. Register only controls that perform real game actions. Set `customizable: true` and the real `adapter` path only after wiring it.
5. Never insert pack strings or participant nicknames into `innerHTML`. Use text nodes/textContent or escape strings where a legacy template requires HTML. Invalid content must not destroy a previously saved valid pack.
6. Keep settings, content, and progress in browser storage with a namespaced game ID. `read`/`write` in the shared storage module handle restricted/quota-exceeded storage. Saving must be optional and a storage failure must not prevent play. Display/projection channels must have separate game namespaces, and late displays must request the current state.
7. Keep `offline` false until dependency review and actual offline verification. An offline game needs an explicit complete `offlineAssets` array of same-origin paths, including dynamically loaded scripts, content, media and shared modules. Font/network fallbacks must be usable. Online room signalling, speech recognition or AI services cannot be promised offline. For a compiled Vite game, set `offlineBundle: true` and list the entry HTML and any public files outside the generated assets directory. The build includes the generated chunks and hashes the complete file list.
   For games in `faro-games/`, the build publishes the entry and files named in `offlineAssets` or `publicAssets`. Use `publicAssets` for any files needed only online.
8. Add setup instructions and truthful device/network requirements. Support a standard keyboard/touch flow even when serial/gamepad/buzzer enhancements are available. State when a projection works only between tabs in the same browser. Never describe that as cross-device multiplayer.
9. Update `catalog/migration.json` with actual evidence: privacy review, representative full gameplay, correct/incorrect answers, custom content where supported, score/timer/round transitions, reload behavior, desktop/mobile screenshots and diagnostics, and offline cold launch when advertised.
10. Run `npm test`, `npm run check`, and `npm run build`. Open the built app with `npm run dev`. The development server serves only `dist/`, not private source. Test meaningful behavior; successful compilation alone does not prove a game works.

## Version 1 content packs

Shared schema and examples: `gallery/shared/content.js`. A pack is `{ "version": 1, "title": "My lesson", "level": "A2", "model": "words", "items": [...] }`. Levels are A1, A2, B1, B2, C1, C2. There are 1–500 items. The UI provides an example file, paste/file import, export, validation, and a copyable AI prompt for every wired adapter. AI output needs teacher review.

- `words`: `word`, `clue`, optional `translation`.
- `quiz`: `question`, 2–6 unique `options`, `answer` exactly matching an option, optional `explanation`.
- `sentences`: `text`, boolean `correct`, `correction` for incorrect sentences, optional `explanation`.
- `axes`: `subject` and `participle` per item, with at least 10 distinct values in each axis. Used by Grammar Battleship.
- `dialogues`: `title`, `order`, mistaken `reply`, and model `correction`. Optional `grammar` adds a bonus correction in The Worst Restaurant in the World.
- `survey`: `question`, 2–10 `answers` each with `text` and integer `points` from 1 to 100.

## Vercel

The tracked `vercel.json` uses `npm run build` and serves `dist/`. Use Node 22 or newer and install from the root lockfile. The gallery needs no database, visitor account or environment secrets.

For an artifact-only deployment, put the reviewed contents of `dist/` in `.vercel/output/static/` in a linked Vercel project directory. The version 3 output config should retain the headers from `vercel.json` and serve `/index.html` at `/`. Run `vercel deploy --prebuilt --prod` in that linked directory. Verify the public HTTPS origin, game URLs, manifest, service-worker headers and a fresh download before sharing the release. [Vercel Build Output API](https://vercel.com/docs/build-output-api) · [Prebuilt deployment](https://vercel.com/docs/cli/deploy#prebuilt)

Build/routing references: [Vite production builds](https://vite.dev/guide/build), [React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter).
