# Detective Case Files

## Project Definition
An interactive ESL reading-comprehension and deduction web game built from 11 murder mystery cases written by university English students (UPRA "Project 2 – A Murder Mystery"). Students pick a case file from the Detective Board, read the story while clicking sentences to collect clues in their Evidence Notebook, answer 5 deduction questions (with optional hints), fill out a printable Investigator's Report, and reveal the official solution with key clues highlighted in the story.

## Decisions Made
- **Target**: Teen / adult university ESL learners (B1–B2). Includes a content warning for crime & mature themes.
- **Privacy**: Student author names were removed from all cases.
- **Theme/Colors**: Noir detective desk — dark desk background, manila case-file folders, typewriter headings (`Special Elite` with monospace fallback), red/green/amber case stamps.
- **Scoring**: 100 pts per correct question (5 questions per case), -25 pts per hint used, +20 pts bonus per key evidence phrase collected (up to +100 pts). Detective rank progresses from Rookie → Detective → Inspector → Chief Inspector.
- **Data Storage**: `localStorage` (`detectiveCaseFiles_v1`) stores solved status, scores, collected evidence, team name, sound mute preference, and Investigator's Report drafts.
- **Sound**: Subtle Web Audio API effects (click and stamp thud) with a Mute toggle. No external audio files.
- **Device Support**: Fully responsive for classroom projectors, laptops, tablets, and phones. Includes a clean print stylesheet for the Investigator's Report.
- **Deployment**: Self-contained static files inside the `EnglishCode` repository — works by simply double-clicking `index.html` with no server or build step required.

## Technology Stack
- Vanilla HTML5, CSS3, and JavaScript (no build step, no `fetch()` of local JSON so `file://` works directly).
- Optional Google Font (`Special Elite`) with system monospace fallback.

## File Structure
- `index.html` — Main app layout (Case Board + 4-step Case Workspace).
- `style.css` — Noir detective theme, responsive layout, and print styles.
- `cases.js` — All 11 cases (`window.CASES`): story paragraphs, suspects, key evidence phrases, 5 multiple-choice questions with hints, official solution, and Investigator's Report prompts.
- `app.js` — Game state, interactive sentence highlighting, quiz scoring, Investigator's Report copy/print, and Web Audio effects.
- `agent.md` — This documentation file.

## How to Add a New Case
Open `cases.js` and append a new object to `window.CASES` following the template at the top of the file.

## Phase Completion Log

### Phase 1–4 — Full Build & Verification ✅
**Date**: 2026-11-21
**What was done:**
- Extracted and cleaned all 11 cases (including transcribing *Murder at the Comfort Inn* from rendered PNG images).
- Built `cases.js`, `index.html`, `style.css`, and `app.js`.
- Verified JS syntax, data integrity across all 11 cases (including key-evidence substring matches), and full UI play-through.
