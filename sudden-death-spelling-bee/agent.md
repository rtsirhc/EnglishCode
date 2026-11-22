# Sudden Death Spelling Bee

## Project Definition
A real-time, dual-window web application for a "sudden-death" classroom spelling bee. The app has a Teacher Control Panel and a Student Display that are synced perfectly over a Local Network/Browser environment. It includes 5th and 6th-grade vocabulary. A round-robin "Wheel of Names" randomly picks students, and they are eliminated upon a misspelled word (timeout or incorrect entry). The final player standing wins.

## Decisions Made
- **Target**: 5th and 6th grade ESL students
- **Theme/Colors**: Bright, cute, highly engaging, highly legible fonts
- **Scoring**: Sudden-death eliminations, top 3 placements are remembered and displayed on podium
- **Timer**: 1-minute visual countdown with a pause button
- **Images**: Not needed originally, but canvas-confetti used for Victory Screen.
- **AI Features**: None needed.
- **Data Storage**: BroadcastChannel for real-time synchronization between two tabs on the same device. No persistent database required beyond a gameplay session.
- **Deployment**: Vercel
- **Device Support**: Dual-window (one on Laptop display, one projected on Screen)

## Technology Stack
- React 18 (Vite)
- Vanilla CSS
- react-router-dom
- lucide-react (icons)
- canvas-confetti (celebrations)

## Project Phases

### Phase 2: Base UI & Styling
- Configure `index.css` with color palettes and `Outfit` font.
- Add `react-router-dom` setup in `App.jsx` for `/`, `/teacher`, `/student`.

### Phase 3: Game Data & Hooks
- Create `src/constants/words.js`.
- Create `src/hooks/useGameState.js` and `src/hooks/useSync.js` using `BroadcastChannel`.

### Phase 4: Views
- `SetupScreen.jsx`: Select grade, input students.
- `TeacherPanel.jsx`: Controls (pause, spin, reveal, correct/wrong), hidden word, transcribing input.
- `StudentDisplay.jsx`: Wheel of Names, timer, target word container.
- `VictoryScreen.jsx`: Podium component for 1st, 2nd, 3rd.

### Phase 5: Polish & Testing
- CSS animations for eliminations, wheel spin.
- Verify BroadcastChannel works locally.

---

## Phase Completion Log

### Phase 1 — Project Setup ✅
**Completed by**: Antigravity
**Date**: 2026-04-17

**What was done:**
- Scaffolded Vite React application
- Installed necessary dependencies (react-router-dom, lucide-react, canvas-confetti, clsx)
- Created agent.md

**Files created/modified:**
- `package.json`
- `agent.md`

**Technical notes:**
- Will use vanilla CSS to manage animations and variables.
- Using `BroadcastChannel` in the `useSync` hook for instant updates.

**Current state:**
- Empty boilerplate Vite app, ready for development.
