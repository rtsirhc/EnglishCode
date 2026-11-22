# 🌍 Time Zone Travelers — Completion Report

## How to Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Application Overview

**Time Zone Travelers** is an interactive ESL game (Level A1) for 5th/6th grade students. 4 teams take turns answering timezone questions. The app uses a "PowerPoint" full-screen layout — no scrolling.

### Game Flow
1. **Intro** — 3 slides introducing time zones, ending with a "START GAME!" button
2. **Gameplay** — 30 questions: _"London is 5 hours ______ New York."_ → `AHEAD OF` or `BEHIND`
3. **Winner** — Confetti celebration revealing the winning team + PLAY AGAIN button

### Scoring
- **First correct answer** → 5 points
- **Retry (another team tried it first)** → 1 point
- **Wrong / Timeout** → 0 points, same question passes to the next team

### Timer
- 10-second countdown per turn
- Color changes: 🟢 green → 🟡 yellow → 🔴 red
- Pulses in danger zone (≤3 seconds)

---

## Tech Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| React (Vite) | 7.3.1 | Build tool + dev server |
| Tailwind CSS | 4.x | Styling with @theme |
| Zustand | Latest | State management |
| Framer Motion | Latest | Animations |
| Lucide React | Latest | Icons |
| Google Fonts (Nunito) | — | Kid-friendly typography |

---

## File Structure

```
src/
├── assets/
│   └── timezone-map.png       # UTC-labeled world map
├── components/
│   ├── LayoutContainer.jsx    # Full-screen wrapper
│   ├── MapDisplay.jsx         # Background map (25% opacity)
│   ├── QuestionCard.jsx       # Question + answer buttons
│   ├── Scoreboard.jsx         # 4 team cards with animated scores
│   └── TimerBar.jsx           # Countdown progress bar
├── data/
│   └── questions.js           # 30 timezone questions
├── store/
│   └── gameStore.js           # Zustand state management
├── utils/
│   ├── cn.js                  # clsx + tailwind-merge
│   └── sounds.js              # Sound effects utility
├── views/
│   ├── IntroView.jsx          # 3-slide intro
│   ├── GameView.jsx           # Main gameplay screen
│   └── WinnerView.jsx         # Winner celebration
├── App.jsx                    # Root view switcher
├── main.jsx                   # Entry point
└── index.css                  # Theme + animations
```

---

## QA Verification

| Check | Result |
|-------|--------|
| Timer resets when turn changes | ✅ `timer: 10` set on wrong, timeout, and correct |
| Same question stays on wrong answer | ✅ `currentQuestionIndex` unchanged on wrong |
| First-try scoring = 5pts | ✅ `attemptCount === 0 ? 5 : 1` |
| Retry scoring = 1pt | ✅ Verified in browser |
| Game ends after 30 questions | ✅ `nextQuestionIndex >= questions.length` triggers winner |
| Play Again resets everything | ✅ `resetGame()` spreads `INITIAL_STATE` |
| Build succeeds (0 errors) | ✅ 2124 modules, production build clean |

---

## Sound Effects (Optional)

Place MP3 files in `/public/sounds/`:
- `correct.mp3` — Ding on correct answer
- `wrong.mp3` — Buzz on wrong answer
- `timer.mp3` — Ticking during countdown
- `win.mp3` — Fanfare on winner screen

Sounds fail gracefully — the app works perfectly without them.
