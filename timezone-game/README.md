# 🌍 Time Zone Travelers

An interactive ESL (Level A1) game for 5th/6th grade students to learn about world time zones!

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (installed via nvm)

### Installation
```bash
# Load nvm (if not already in your shell)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔊 Adding Sound Effects

The game expects 4 audio files in the `/public/sounds/` directory. Drop your own `.mp3` files here:

| File | Purpose | Suggestion |
|------|---------|------------|
| `correct.mp3` | Plays on correct answer | Short "ding" or chime |
| `wrong.mp3` | Plays on incorrect answer | Short "buzz" or error tone |
| `timer.mp3` | Ticking during countdown | Clock tick loop |
| `win.mp3` | Plays on winner reveal | Fanfare or celebration |

> **Note:** The game works perfectly without these files — sounds will gracefully fall back to console logging. Add them when ready for the full classroom experience!

---

## 🎮 How to Play
1. 4 teams take turns answering time zone questions
2. Each question asks if City A is **ahead of** or **behind** City B
3. **Scoring:** 5 points for first correct attempt, 1 point if another team answers after a miss
4. 10-second timer per turn — timeout passes to the next team (same question)
5. First to complete all 30 questions → highest score wins!

## 🛠 Tech Stack
- **React** (Vite) + **Tailwind CSS v4**
- **Zustand** — State management
- **Framer Motion** — Animations
- **Lucide React** — Icons
