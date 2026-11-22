# Tense Master: Sudden Death

## Project Definition

A dark-mode, neon esports-aesthetic grammar game for a 13-year-old B1 English learner who loves soccer (specifically playing Goalie), Science, History, and Geography. The game presents 30 randomly selected questions from a 100-question bank and tests all 6 tenses: Present Simple, Present Continuous, Present Perfect, Past Simple, Past Continuous, and Past Perfect.

The student has 3 lives. Answering incorrectly or letting the timer run out costs a life. Losing all 3 lives ends the game. Surviving all 30 questions triggers a Victory screen with the player's total time. Times are saved to a Leaderboard (top 5) stored in the browser's local memory.

## Decisions Made

- **Target**: Age 13, B1 English level
- **Themes**: ⚽ Soccer Goalie, 🔬 Science, 🏛 History, 🌍 Geography
- **Theme/Colors**: Dark mode — neon cyan, magenta, green, yellow on a deep dark navy background. Orbitron + Rajdhani fonts for esports feel.
- **Scoring**: Lives-based (3 ❤️). No points — speed is the score.
- **Timer**: Global timer (counts up, shows total time on Victory). Per-question timer (counts down, changes to red when < 5s).
- **Images**: None — design uses emoji and neon UI.
- **AI Features**: None
- **Data Storage**: localStorage (leaderboard top 10, shows top 5)
- **Deployment**: Local only (single HTML file)
- **Device Support**: Desktop primary (also works on tablet)

## Technology Stack

- Single HTML file
- React 18 (via CDN unpkg)
- Babel Standalone (JSX transpilation in-browser)
- Vanilla CSS with CSS custom properties
- Google Fonts: Orbitron, Rajdhani, Inter
- No build step needed — open directly in any browser

## File

`/Users/christine/EnglishCode/tense-master-sudden-death.html`

## Question Bank

100 questions total, evenly distributed:
- 25 × Recognition (multiple choice, 10-second timer)
- 25 × Fill-in-the-blank (text input, 20-second timer)
- 25 × Fix the Error (click wrong word + type correction, 30-second timer)
- 25 × Table Challenge (grammar rules table with 1 hidden cell, 30-second timer)

Each question group covers all 6 tenses and all 4 themes evenly.

## Game States

- `start` — Title screen with rules and leaderboard
- `playing` — Active game with question, timers, lives, progress bar
- `gameover` — Out of lives screen with Restart button
- `victory` — Completed all 30 questions screen with time and leaderboard

## Phase Completion Log

### Phase 1 — Build ✅
**Date**: 2026-05-28

**What was done:**
- Built complete single-file React game from scratch
- Implemented all 4 question types with full mechanics
- Created 100-question bank across 4 themes × 6 tenses × 4 types
- Built circular countdown timer SVG with danger animation
- Built leaderboard with localStorage persistence
- Fixed stale closure bugs using refs (globalTimerRef, livesRef, questionLockedRef, currentIndexRef)
- Fixed victory screen to capture timer at exact moment of completion
- Applied full neon dark-mode esports aesthetic with particle system, scanlines, grid background

**Files created:**
- `/Users/christine/EnglishCode/tense-master-sudden-death.html` — Complete game (single file, ~1550 lines)

**Technical notes:**
- Uses React.useState, useEffect, useRef, useMemo from CDN React 18
- Babel standalone handles JSX in `<script type="text/babel">`
- NO export/import keywords (not an ES module context)
- Refs are used to track mutable values across timer callbacks to avoid stale closures
- Question timer effect depends only on [currentIndex, gameState] — questionLockedRef handles the locked check
- The fix question has a two-step interaction: click wrong word → type correction → submit

**Current state:**
- Fully functional and playable
- All 4 question types working
- Timers, lives, leaderboard all operational
- Opens directly in any browser without a server
