import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import game1QuestionBank from './src/data/game1QuestionBank.js';
import game2Cards from './src/data/game2Cards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// ─── Utility ────────────────────────────────────────────────────────────────

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(array, n) {
  return shuffle(array).slice(0, n);
}

// ─── Session State ───────────────────────────────────────────────────────────

function makeInitialState() {
  return {
    phase: 'lobby',
    game1: {
      queue: [],
      current: null,
      status: 'idle',
      revealedAt: null,
      correctCount: 0,
      totalQuestions: 20,
    },
    game2: {
      deck: [],
      current: null,
      roundIndex: 0,
      score: 0,
      status: 'idle',
      startedAt: null,
      guesses: [],
    },
  };
}

let state = makeInitialState();
let game1Timer = null;
let game2StudentTimer = null;
let game2TeacherTimer = null;

function clearGame1Timer() {
  if (game1Timer) { clearTimeout(game1Timer); game1Timer = null; }
}

function clearGame2Timers() {
  if (game2StudentTimer) { clearTimeout(game2StudentTimer); game2StudentTimer = null; }
  if (game2TeacherTimer) { clearTimeout(game2TeacherTimer); game2TeacherTimer = null; }
}

function broadcast() {
  io.emit('state_update', state);
}

// ─── Game 1 Logic ───────────────────────────────────────────────────────────

function selectGame1Questions(selectedTenses) {
  const TOTAL = 20;
  const N = selectedTenses.length;
  const base = Math.floor(TOTAL / N);
  const remainder = TOTAL % N;
  const shuffledTenses = shuffle([...selectedTenses]);

  let selected = [];
  shuffledTenses.forEach((tense, idx) => {
    const count = base + (idx < remainder ? 1 : 0);
    const tenseQs = game1QuestionBank.filter(q => q.tense === tense);
    selected = [...selected, ...pickRandom(tenseQs, Math.min(count, tenseQs.length))];
  });

  return shuffle(selected);
}

function game1Reset(selectedTenses) {
  clearGame1Timer();
  state.phase = 'game1';
  state.game1 = {
    queue: selectGame1Questions(selectedTenses),
    current: null,
    status: 'idle',
    revealedAt: null,
    correctCount: 0,
    totalQuestions: 20,
  };
}

function game1NextQuestion() {
  clearGame1Timer();
  if (state.game1.queue.length === 0) {
    state.game1.status = 'win';
    state.game1.current = null;
    broadcast();
    return;
  }
  const [next, ...rest] = state.game1.queue;
  state.game1.current = next;
  state.game1.queue = rest;
  state.game1.status = 'idle';
  state.game1.revealedAt = null;
  broadcast();
}

function game1Reveal() {
  if (state.game1.status !== 'idle' || !state.game1.current) return;
  const now = Date.now();
  state.game1.status = 'revealed';
  state.game1.revealedAt = now;
  broadcast();

  clearGame1Timer();
  game1Timer = setTimeout(() => {
    if (state.game1.status === 'revealed') {
      game1MarkIncorrect();
    }
  }, 10000);
}

function game1MarkCorrect() {
  clearGame1Timer();
  state.game1.status = 'correct';
  state.game1.correctCount += 1;
  broadcast();
}

function game1MarkIncorrect() {
  clearGame1Timer();
  state.game1.status = 'incorrect';
  if (state.game1.current) {
    const q = state.game1.current;
    const newQueue = [...state.game1.queue];
    const insertAt = newQueue.length === 0 ? 0 : Math.floor(Math.random() * (newQueue.length - 1)) + 1;
    newQueue.splice(insertAt, 0, q);
    state.game1.queue = newQueue;
  }
  broadcast();
}

// ─── Game 2 Logic ───────────────────────────────────────────────────────────

function game2Reset() {
  clearGame2Timers();
  const selected = pickRandom(game2Cards, 15);
  state.phase = 'game2';
  state.game2 = {
    deck: selected,
    current: null,
    roundIndex: 0,
    score: 0,
    status: 'idle',
    startedAt: null,
    guesses: [],
  };
}

function game2NextCard() {
  clearGame2Timers();
  if (state.game2.roundIndex >= 15) {
    state.game2.status = 'finished';
    state.phase = 'finished';
    broadcast();
    return;
  }
  const card = state.game2.deck[state.game2.roundIndex];
  state.game2.current = card;
  state.game2.roundIndex += 1;
  state.game2.status = 'active';
  state.game2.startedAt = Date.now();
  state.game2.guesses = [];
  broadcast();

  game2StudentTimer = setTimeout(() => {
    if (state.game2.status === 'active') {
      io.emit('game2_student_timeout');
    }
  }, 45000);

  game2TeacherTimer = setTimeout(() => {
    if (state.game2.status === 'active') {
      game2Timeout();
    }
  }, 60000);
}

function game2CheckGuess(guess) {
  if (state.game2.status !== 'active' || !state.game2.current) return;
  const normalized = (s) => s.trim().toLowerCase();
  const guessEntry = { text: guess, timestamp: Date.now() };
  state.game2.guesses = [...state.game2.guesses, guessEntry];

  if (normalized(guess) === normalized(state.game2.current.keyword)) {
    clearGame2Timers();
    state.game2.status = 'success';
    state.game2.score += 1;
    broadcast();
  } else {
    broadcast();
  }
}

function game2Timeout() {
  clearGame2Timers();
  state.game2.status = 'timeout';
  broadcast();
}

// ─── Socket.io Event Handlers ───────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.emit('state_update', state);

  // ── Teacher: Reset to lobby
  socket.on('teacher_reset', () => {
    clearGame1Timer();
    clearGame2Timers();
    state = makeInitialState();
    broadcast();
  });

  // ── Teacher: Start Game 1 with selected tenses
  socket.on('teacher_start_game1', ({ tenses }) => {
    if (state.phase !== 'lobby') return;
    if (!tenses || tenses.length === 0) return;
    game1Reset(tenses);
    game1NextQuestion();
  });

  // ── Teacher: Start Game 2 directly from lobby
  socket.on('teacher_start_game2', () => {
    if (state.phase !== 'lobby') return;
    game2Reset();
    broadcast();
  });

  // ── Game 1: Student reveals sentence
  socket.on('student_reveal', () => {
    if (state.phase !== 'game1' || state.game1.status !== 'idle') return;
    game1Reveal();
  });

  // ── Game 1: Teacher grades
  socket.on('teacher_grade', ({ correct }) => {
    if (state.phase !== 'game1' || state.game1.status !== 'revealed') return;
    if (correct) {
      game1MarkCorrect();
    } else {
      game1MarkIncorrect();
    }
  });

  // ── Game 1: Student/Teacher advance to next question
  socket.on('game1_next', () => {
    if (state.phase !== 'game1') return;
    if (state.game1.status === 'correct' || state.game1.status === 'incorrect') {
      game1NextQuestion();
    }
  });

  // ── Game 1 → Game 2 transition
  socket.on('teacher_advance_game', () => {
    if (state.game1.status !== 'win') return;
    game2Reset();
    broadcast();
  });

  // ── Game 2: Student triggers next card
  socket.on('student_next_card', () => {
    if (state.phase !== 'game2') return;
    if (state.game2.status === 'idle' || state.game2.status === 'success' || state.game2.status === 'timeout') {
      game2NextCard();
    }
  });

  // ── Game 2: Teacher submits a guess
  socket.on('teacher_guess', ({ guess }) => {
    if (state.phase !== 'game2' || state.game2.status !== 'active') return;
    if (!guess || !guess.trim()) return;
    game2CheckGuess(guess);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ─── Static File Serving (production) ───────────────────────────────────────

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Grammar Arena server running!`);
  console.log(`   Local:    http://localhost:${PORT}`);
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`   Network:  http://${net.address}:${PORT}  ← Share this with students!`);
        }
      }
    }
  } catch {}
  console.log('');
});
