# Flags & Nationalities Game

## Project Definition
A web-based, presenter-style educational game designed for kids to learn about countries and nationalities. The teacher shows it on a big screen and kids shout out answers orally. No clicking on answers, no scorekeeping — just fun, timed, visual questions with flags.

## Decisions Made
- **Target**: Kids (ESL students, all levels)
- **Theme/Colors**: Colorful, bold, kid-friendly typography
- **Scoring**: None — kids answer orally
- **Timer**: 15-second countdown per question, no early reveal
- **Images**: Country flags from REST Countries API (SVG)
- **AI Features**: No
- **Data Storage**: None
- **Deployment**: Local for now
- **Device Support**: Optimized for big screen / projector

## Technology Stack
- Single HTML file with vanilla JS and CSS
- REST Countries API (https://restcountries.com/v3.1/all)
- No frameworks, no build tools

## Game Flow
1. Start screen → "Start Game" button
2. Fetch country data from API, categorize by difficulty (population)
3. Select 20 questions, ordered easy → medium → hard
4. For each question:
   - Show flag + 4 text options (A, B, C, D) — NOT clickable
   - Randomly alternate between "What country?" and "What nationality?"
   - 15-second countdown timer
   - At 0: highlight correct answer in green
   - Show "Next Question" button
5. After question 20 → End screen with "Play Again" button

## Project Phases

### Phase 2: Build Everything
- Single HTML file with all CSS + JS inline
- Fetch API data, difficulty heuristic, question generation
- Full game loop with timer
- All UI screens (start, game, end)
- Polished design with animations

### Phase 3: Testing & Verification
- Verify API works
- Test all 20 questions cycle
- Check timer accuracy
- Verify answer reveal logic
- Test responsive display

---

## Phase Completion Log

### Phase 2 — Build Everything ✅
**Completed by**: Antigravity
**Date**: 2026-06-01

**What was done:**
- Created single HTML file with all CSS + JS inline
- Fetches country data from REST Countries API (v3.1)
- Filters for countries with valid flag SVG, name, and English demonym
- Sorts by population and assigns difficulty tiers (Easy/Medium/Hard)
- Generates 20 questions with progressive difficulty (7 easy → 7 medium → 6 hard)
- Randomly alternates between "country" and "nationality" question types
- 15-second countdown timer with animated bar and color states
- Answer reveal at 0 seconds with green highlight animation
- Non-clickable answer cards (presenter mode)
- Start screen, loading screen, game screen, end screen, error screen
- Floating emoji background decoration
- Responsive design for mobile and desktop
- Google Fonts (Outfit) for kid-friendly bold typography

**Files created/modified:**
- `index.html` — Complete game (single file, ~600 lines)
- `agent.md` — Project documentation

**Current state:**
- Fully functional game ready to play
- Opens directly in browser, no build tools or server needed
