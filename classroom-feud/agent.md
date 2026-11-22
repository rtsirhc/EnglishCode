# Classroom Feud

## Project Definition
Classroom Feud is a web-based educational game for A1 proficiency ESL students. It operates locally using a dual-screen setup (Teacher and Projector) synced via the `BroadcastChannel` API. The game features a sudden-death mechanic where teams are eliminated instantly upon an incorrect answer, with the last team standing winning the round.

## Decisions Made
- **Target**: 11-12 year old ESL students, barely A1 proficiency level.
- **Theme/Colors**: 3 Day Themes (Sports, Cowboys, Heroes). Bright, colorful, TV Game Show aesthetic.
- **Scoring**: Survival / Sudden death. No points, just "alive" or "eliminated". Last team standing wins.
- **Timer**: No specific timer, sequential turns.
- **Images**: Not requested/needed for this MVP beyond the core high-contrast UI.
- **AI Features**: No real-time AI in the app. The agent is proactively generating 55 questions during codebase construction.
- **Data Storage**: None needed (game state broadcasts in real-time, no persistence across reloads needed as it's a fast-paced classroom game).
- **Deployment**: Local only.
- **Device Support**: Teacher Desktop (2 screens/tabs).

## Technology Stack
- React 19 / Vite
- Tailwind CSS via `@tailwindcss/vite`
- `BroadcastChannel` API (`window.BroadcastChannel`)
- Lucide React for simple icons.

## Project Phases

### Phase 2: App Architecture
Implement Setup Screen and dual-tab routing in `App.jsx`. Setup Tailwind.

### Phase 3: Data Bank
Generate the 100 questions representing Day 1, Day 2, and Day 3 content into `src/data/questions.js`.

### Phase 4: Teacher Control Panel
Build the Teacher Panel component with state control for current question, team turns, strikes, overrides, and `BroadcastChannel` emission.

### Phase 5: Projector UI
Build the responsive, game-show aesthetic projector panel that listens to the `BroadcastChannel` and automatically visualizes state, CSS 3D transitions, and plays buzzer audio.

---

## Phase Completion Log

### Phase 1 — Research & Setup ✅
**Completed by**: Antigravity
**Date**: 2026-04-27

**What was done:**
- Scaffolded Vite React project `classroom-feud`.
- Installed Tailwind CSS and Lucide React.
- Wrote basic `agent.md` outline.
