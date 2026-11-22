# Human Sentence Scramble Game

## Project Definition
An interactive classroom ESL game designed for an English teacher to project on a classroom screen. Students wear or carry physical word cards, walk around, and form sentences in teams. 

The app features:
1. 48 short, open-ended ESL prompts covering simple present, to be, have/has, do/does, yes/no and wh- questions, habits, daily routine, directions, prepositions of place and time, numbers, and word-count challenges.
2. Prompts shuffled randomly every game session.
3. Student Roster input: add/remove names, saved in `localStorage`, sorted alphabetically with a `+1 Point` button next to each name.
4. Live Top 5 Leaderboard updating automatically on screen.
5. 30-Second Countdown Clock per round:
   - Starts automatically when a prompt is loaded.
   - Built-in Web Audio API synthesized sound effects: Start cheer chime, 3-2-1 countdown tick sound, and Time's Up end buzzer sound.
   - "Next Round" button to advance to the next prompt, which restarts the 30-second timer.
6. Accessible on any browser/computer via Vercel online deployment link.

## Decisions Made
- **Target Audience**: A1-A2 ESL Students
- **Theme/Colors**: Vibrant, high-contrast, classroom-friendly design (indigo, amber, emerald, dark slate)
- **Scoring**: Manual +1 point button per student, alphabetical main list, real-time Top 5 Leaderboard card
- **Timer**: 30-second automatic countdown per round with Web Audio API sound effects
- **Images**: Crisp SVG icons & CSS animations
- **AI Features**: None required
- **Data Storage**: `localStorage` (persists roster and scores across sessions, reset option available)
- **Deployment**: GitHub + Vercel
- **Device Support**: Desktop & Classroom Projector Screen

## Technology Stack
- **Framework**: HTML5 Single-Page Web Application + Tailwind CSS (via CDN) + Lucide Icons + Web Audio API
- **Deployment**: Vercel

## Project Phases

### Phase 1: Foundation & agent.md ✅
- Initialized project structure and `agent.md`

### Phase 2: Core Architecture & UI Structure ✅
- Created single-page `index.html` with modular layout.
- Integrated Web Audio API sound generator (no external audio file dependencies).

### Phase 3: Features & Gameplay Logic ✅
- Implemented Roster Management (Add/Remove students, localStorage persistence, alphabetical sorting).
- Implemented scoring system with +1 points & confetti animation.
- Implemented Live Top 5 Leaderboard.
- Integrated 30s timer with automatic restart, pause, and tick audio effects.
- Added 48 open-ended A1-A2 prompts deck with shuffle functionality.

### Phase 4: Classroom Screen Optimization & Visual Polish ✅
- High-contrast typography and color schemes suitable for projectors.
- Mute/Unmute audio toggle.

### Phase 5: Verification & Testing ✅
- Verified build and URL deployment.

### Phase 6: Vercel Deployment & Verification ✅
- Created GitHub repository and pushed source.
- Deployed live on Vercel: https://human-sentence-scramble.vercel.app

---

## Phase Completion Log

### Phase 1 — Foundation & agent.md ✅
**Date**: 2026-09-22
**What was done:**
- Created `agent.md` with full project specification, design decisions, and phase breakdown.

### Phase 2-6 — App Build & Deployment ✅
**Date**: 2026-09-22
**What was done:**
- Built full single-page web app `index.html` with Tailwind CSS, Lucide icons, Canvas Confetti, Web Audio API synthesizers.
- Loaded 48 open-ended A1-A2 prompts with word-count challenges.
- Implemented alphabetical roster, +1 point buttons, live Top 5 Leaderboard, and auto 30-second timer.
- Pushed to GitHub repository `rtsirhc/human-sentence-scramble`.
- Deployed live to Vercel: https://human-sentence-scramble.vercel.app
