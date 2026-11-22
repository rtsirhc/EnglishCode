# Grammar Arena — Dual-Panel Real-Time ESL Game

## Project Definition

A two-panel real-time classroom web application for ESL students. A Student device and a Teacher device connect via WebSockets (Socket.io) and stay perfectly synchronized. The app consists of two sequential games:

**Game 1 — Transformation Drill (Blue theme)**
The student sees a grammar task (e.g. "Change to Past Continuous"), clicks "Reveal Sentence" to see the original sentence, then has 5 seconds to answer orally. The teacher sees the full question + correct answer and clicks Correct or Incorrect. Incorrect/timeout questions shuffle back into the queue. Game 1 ends when all 35 questions are answered correctly.

**Game 2 — Taboo / Circumlocution (Purple theme)**
The student sees a keyword + 5 taboo words and describes the keyword without saying them. The teacher types guesses (hidden keyword) in real time. Student has 45 seconds to describe; teacher has 60 seconds total. 15 randomly selected rounds. Final score shown on both screens.

## Decisions Made
- **Target**: B1 English learners
- **Theme/Colors**: Dark mode; Blue (Game 1), Purple (Game 2)
- **Scoring**: Game 2: 1 point per correct guess in 60s
- **Timer**: 5s (Game 1), 45s student / 60s teacher (Game 2)
- **Images**: None
- **AI Features**: None
- **Data Storage**: In-memory server state (resets on server restart)
- **Deployment**: Local WiFi (runs on teacher's laptop)
- **Device Support**: Both desktop and mobile/tablet (touch-friendly)

## Technology Stack
- **Vite 5 + React 18** (SPA frontend)
- **Express 4 + Socket.io 4** (Node.js backend, port 3001)
- **Tailwind CSS 3** (utility-first styling)
- **concurrently** (runs both servers with one command in dev)
- **react-router-dom 6** (Landing → /student, /teacher)

## How to Start the App

### Development (recommended)
```bash
cd /Users/christine/EnglishCode/transformation-taboo
npm run dev
```
- Socket.io server: http://localhost:3001
- Vite dev server: http://localhost:5173

### Production (single server, e.g. for classroom WiFi sharing)
```bash
cd /Users/christine/EnglishCode/transformation-taboo
npm run build
npm start
```
Then open `http://<YOUR-IP>:3001` on both devices.
The server prints the Network IP when it starts (e.g. `http://192.168.100.22:3001`).

## File Structure
```
transformation-taboo/
├── server.js              # Express + Socket.io + game state machine
├── package.json
├── vite.config.js         # Proxy /socket.io → localhost:3001 in dev
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx            # BrowserRouter: /, /student, /teacher
│   ├── socket.js          # Singleton Socket.io client
│   ├── index.css          # Tailwind + custom animations
│   ├── data/
│   │   ├── game1Questions.js   # 35 transformation Qs
│   │   └── game2Cards.js       # 30 Taboo cards (15 selected per session)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── StudentView.jsx
│   │   └── TeacherView.jsx
│   └── components/
│       ├── Countdown.jsx      # SVG ring countdown timer
│       ├── Game1Student.jsx
│       ├── Game1Teacher.jsx
│       ├── Game2Student.jsx
│       ├── Game2Teacher.jsx
│       └── FinalScore.jsx
└── dist/                  # Production build output
```

## Socket.io Events

### Server → All Clients
| Event | Description |
|-------|-------------|
| `state_update` | Full session state after every change |
| `game2_student_timeout` | Fires at 45s mark in Game 2 (student time up) |

### Client → Server
| Event | Description |
|-------|-------------|
| `teacher_reset` | Reinitializes everything, starts Game 1 |
| `student_reveal` | Student clicks Reveal Sentence |
| `teacher_grade { correct }` | Teacher clicks Correct/Incorrect |
| `game1_next` | Advance to next question after result |
| `teacher_advance_game` | Teacher unlocks Game 2 after Game 1 win |
| `student_next_card` | Student triggers next Taboo card |
| `teacher_guess { guess }` | Teacher submits a guess in Game 2 |

## Phase Completion Log

### Phase 1 — Project Scaffold ✅
**Date**: 2026-05-28

**What was done:**
- Created all config files: package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html
- Installed 246 npm packages successfully
- Build passes (vite build: ✓ 73 modules transformed)

### Phase 2 — Data Files ✅
**Date**: 2026-05-28

**What was done:**
- Created 35 grammar transformation questions covering Simple Present, Simple Past, Present Continuous, Past Continuous
- Created 30 Taboo cards at B1 level

### Phase 3 — Server ✅
**Date**: 2026-05-28

**What was done:**
- Full Express + Socket.io server with state machine
- All game logic, timers (clearTimeout on every transition), shuffle-back mechanic
- Server prints Network IP for classroom sharing on startup

### Phase 4 — React Client ✅
**Date**: 2026-05-28

**What was done:**
- Full routing (/, /student, /teacher)
- Landing page with role selection
- StudentView and TeacherView (phase-aware routing)
- All 5 game components + Countdown (SVG ring)
- FinalScore with dynamic feedback message
- Success chime (Web Audio API) on Game 2 correct guess

### Phase 5 — Verified ✅
**Date**: 2026-05-28

- `node --check server.js` → OK
- `npm run build` → ✓ 73 modules, zero errors
- `npm run dev` → Server on :3001, Vite on :5173, both running
