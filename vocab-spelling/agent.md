# Vocab Spelling Bet

## Project Definition
A real-time, two-player vocabulary spelling game for ESL classrooms. The Teacher reads a word aloud and types the spelling while a Student bets money on whether the Teacher will spell it correctly within 10 seconds. Uses Socket.IO for real-time synchronization across devices on the same network.

## Decisions Made
- **Target**: ESL students, B1+ level
- **Theme/Colors**: Dark premium theme with gold accents
- **Scoring**: Start with $1,000, win/lose bets on spelling
- **Timer**: 10 seconds per word
- **Images**: No (not needed)
- **AI Features**: No
- **Data Storage**: Server-side in-memory (no persistence needed)
- **Deployment**: Local network via `--host 0.0.0.0`
- **Device Support**: All devices on same network

## Technology Stack
- Vite 8 + React 19
- Tailwind CSS v4
- Socket.IO 4.8 (client + server)
- Express 5
- concurrently (for running both server and client)

## How to Start
```bash
cd /Users/christine/EnglishCode/vocab-spelling
npm start
```

This starts both the game server (port 3003) and the web app (port 5173).
- Teacher: open `http://localhost:5173/` on your computer
- Student: open `http://<your-computer-ip>:5173/` on any device on the same WiFi

## Project Structure
- `server/index.js` — Socket.IO game server
- `src/App.jsx` — Root component
- `src/views/Lobby.jsx` — Role selection
- `src/views/TeacherScreen.jsx` — Teacher UI
- `src/views/StudentScreen.jsx` — Student UI
- `src/views/ResultsScreen.jsx` — Final results
- `src/lib/socket.js` — Socket.IO client
- `src/data/words.js` — 60-word vocabulary list
- `src/index.css` — Design system & animations
