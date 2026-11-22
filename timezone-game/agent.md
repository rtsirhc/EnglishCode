# Antigravity Agent Instructions: "Time Zone Travelers" (ESL A1 App)

**Role:** You are a Senior Frontend Architect and Educational Game Designer.
**Objective:** Build a polished, bug-free, interactive React application for ESL students (Level A1) to learn about Time Zones.
**Target Audience:** 5th/6th Grade students (Kids). Visual style must be engaging, bright, and simple.

---

## 🛠 GLOBAL CONSTRAINTS & STANDARDS
1.  **Tech Stack:** React (Vite) + Tailwind CSS + Lucide React (Icons).
2.  **State Management:** Use `Zustand` for robust game state management (score, turn, timer).
3.  **Responsiveness:** Fixed landscape layout (Tablet/Desktop focus). No scrolling allowed. "PowerPoint" style slides.
4.  **Reporting:** After completing EACH phase, you MUST write a brief entry in `progress.md` summarizing what was achieved.
5.  **Quality Control:** No placeholders in final code. All logic must handle edge cases (e.g., timer reaching 0).

---

## 🟢 PHASE 1: Project Initialization & Configuration

**Goal:** Set up the foundation and install dependencies.

1.  **Initialize Vite Project:** Create a React + JavaScript project.
2.  **Install Dependencies:**
    * `tailwindcss`, `postcss`, `autoprefixer`
    * `zustand` (State management)
    * `clsx`, `tailwind-merge` (Class handling)
    * `framer-motion` (For smooth animations/transitions)
    * `use-sound` (For audio effects)
    * `lucide-react` (Icons)
3.  **Configure Tailwind:**
    * Set up a "Kids Theme" in `tailwind.config.js`.
    * **Colors:** Use friendly palette: `primary: '#FF6B6B'` (Coral Red), `secondary: '#4ECDC4'` (Teal), `accent: '#FFE66D'` (Yellow), `background: '#F7FFF7'` (Mint White).
    * **Fonts:** Use a rounded, readable sans-serif font (e.g., 'Nunito' or System Rounded).
4.  **File Structure:**
    * `/src/components` (UI elements)
    * `/src/store` (Zustand logic)
    * `/src/data` (Questions list)
    * `/src/assets` (Images/Sounds)

**ACTION:** Run the setup. Create `progress.md` and log Phase 1 completion.

---

## 🟢 PHASE 2: Asset Generation & Resources

**Goal:** Create visual and audio assets.

1.  **Image Generation (Nano Banana Tool):**
    * **Prompt:** "A colorful, simplified, flat-illustration style world map showing continents and time zones. Designed for children, friendly, vector-style, no text labels on the map itself. High resolution, suitable for a background."
    * **Save as:** `/src/assets/timezone-map.png`
2.  **Audio Setup:**
    * Create a utility file `src/utils/sounds.js`.
    * Since we cannot generate audio files directly, create mock hooks or placeholders that log to console, BUT implement the code expecting:
        * `correct.mp3` (Ding)
        * `wrong.mp3` (Buzz)
        * `timer.mp3` (Ticking)
        * `win.mp3` (Fanfare)
    * *Instruction:* Add a comment in `README.md` for the user to drop these mp3 files into `/public/sounds/`.

**ACTION:** Generate the map image. Log Phase 2 completion in `progress.md`.

---

## 🟢 PHASE 3: Data & Game Logic (The Engine)

**Goal:** Implement the "Brain" of the game. strict rules applied.

1.  **Data Creation (`/src/data/questions.js`):**
    * Create a constant array of exactly 30 objects.
    * Structure: `{ id: 1, cityA: "London", cityB: "New York", hours: 5, answer: "ahead of" }` (Note: Logic must be accurate. London is ahead of NY).
    * Ensure mix of "ahead of" and "behind" answers.
2.  **Store Implementation (`/src/store/gameStore.js`):**
    * **State:**
        * `teams`: `['Team 1', 'Team 2', 'Team 3', 'Team 4']`
        * `scores`: `[0, 0, 0, 0]`
        * `currentTurn`: `0` (Index of current team)
        * `currentQuestionIndex`: `0`
        * `attemptCount`: `0` (Tracks how many times the *current question* has been tried)
        * `timer`: `10`
        * `gameState`: `'intro' | 'playing' | 'winner'`
    * **Actions:**
        * `submitAnswer(answer)`:
            * **IF Correct:**
                * Calculate points: If `attemptCount === 0` return 5, else return 1.
                * Add points to `scores[currentTurn]`.
                * Increment `currentQuestionIndex`.
                * Reset `attemptCount` to 0.
                * Reset `timer` to 10.
                * Move `currentTurn` to next team: `(currentTurn + 1) % 4`.
                * Check if `currentQuestionIndex` reached 30 -> Set `gameState` to `'winner'`.
            * **IF Incorrect:**
                * Increment `attemptCount`.
                * Move `currentTurn` to next team.
                * Reset `timer` to 10.
                * **CRITICAL:** Do NOT change question index.
        * `handleTimeout()`:
            * Same logic as Incorrect answer. (Next team, same question, reset timer).

**ACTION:** Implement the store and data. Verify logic matches rules exactly. Log Phase 3 completion.

---

## 🟢 PHASE 4: UI Components (The Shell)

**Goal:** Build the visual components.

1.  **LayoutContainer:**
    * A full-screen wrapper (100vh, 100vw, overflow-hidden).
    * Background color: `bg-background`.
    * "PowerPoint" style navigation buttons (Previous/Next) only visible during the "Intro" phase.
2.  **Scoreboard:**
    * Fixed at the top or side.
    * Display 4 cards for Team 1-4.
    * Highlight the **Active Team** clearly (e.g., scale up, bold border, glowing effect).
3.  **MapDisplay:**
    * Fixed position (e.g., bottom half or background overlay with opacity).
    * Displays `/src/assets/timezone-map.png`.
    * Must NOT shift layout when questions change.
4.  **QuestionCard:**
    * Central component.
    * Big text: "New York is 5 hours ________ London."
    * Two large buttons: [AHEAD OF] and [BEHIND].
    * Visual feedback on click (shake for wrong, confetti for right).
5.  **TimerBar:**
    * A visual progress bar or circle countdown (10s to 0s).
    * Changes color (Green -> Red) as time runs out.

**ACTION:** Build these components in isolation. Log Phase 4 completion.

---

## 🟢 PHASE 5: Integration & Orchestration

**Goal:** Stitch components into Views.

1.  **IntroView:**
    * Simple Slide 1: "Welcome to Time Zone Travelers!"
    * Simple Slide 2: "The world is big! When it is morning in Mexico, it might be night in Japan."
    * Simple Slide 3: "We call these Time Zones. Let's play!"
    * "Start Game" button on the last slide.
2.  **GameView:**
    * Mounts the `Scoreboard`, `MapDisplay`, `QuestionCard`, and `Timer`.
    * **Auto-Logic:**
        * Use `useEffect` to drive the countdown.
        * When `timer === 0`, trigger `handleTimeout()` automatically.
3.  **WinnerView:**
    * Calculates the highest score from the store.
    * "Pop-up" overlay styling.
    * Confetti animation.
    * Big text: "TEAM X WINS!".
    * "Play Again" button.

**ACTION:** Assemble `App.jsx` to switch between these views based on `gameState`. Log Phase 5 completion.

---

## 🟢 PHASE 6: Polish & Styling

**Goal:** Make it "Professional, Modern, and Prettty".

1.  **Animations:**
    * Add `framer-motion` to the `QuestionCard` entrance (slide in).
    * Animate score updates (numbers counting up).
    * Smooth transition between teams on the scoreboard.
2.  **Typography:**
    * Ensure font sizes are huge (Kids/Classroom setting).
    * High contrast text.
3.  **Final Review:**
    * Check: Does the timer reset correctly when Team A fails and Team B starts?
    * Check: Does the question stay the same if Team A fails?
    * Check: Is the scoring 5 pts (1st try) vs 1 pt (Retry)?

**ACTION:** Apply final styles. Write `COMPLETION_REPORT.md` with instructions on how to run (`npm run dev`).