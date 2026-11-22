import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

let state = {
  students: [],       // active players still in the game
  eliminated: [],     // in order of elimination (first = out first)
  wordList: [],
  spinQueue: [],
  currentStudent: null,
  liveText: '',
  currentWord: null,
  phase: 'setup',     // 'setup' | 'playing' | 'result' | 'champion'
  lastResult: null,
  podium: [],         // [1st, 2nd, 3rd]
};

function broadcast() { io.emit('state', state); }

function buildPodium() {
  // Champion = last student standing
  const champion = state.students[0];
  const podium = [champion];
  // 2nd and 3rd = last two eliminated (in reverse order)
  for (let i = state.eliminated.length - 1; i >= 0 && podium.length < 3; i--) {
    podium.push(state.eliminated[i]);
  }
  return podium;
}

io.on('connection', (socket) => {
  socket.emit('state', state);

  socket.on('setup:complete', ({ students, wordList }) => {
    state = {
      ...state,
      students,
      eliminated: [],
      wordList,
      spinQueue: shuffle([...students]),
      currentStudent: null,
      liveText: '',
      currentWord: null,
      phase: 'playing',
      lastResult: null,
      podium: [],
    };
    broadcast();
  });

  socket.on('wheel:spin', () => {
    if (state.students.length === 0) return;
    state.spinQueue = state.spinQueue.filter(s => state.students.includes(s));
    if (state.spinQueue.length === 0) state.spinQueue = shuffle([...state.students]);
    const targetStudent = state.spinQueue.shift();
    const targetIndex = state.students.indexOf(targetStudent);
    state.currentStudent = targetStudent;
    state.currentWord = null;
    state.liveText = '';
    io.emit('wheel:spin', { targetIndex });
    broadcast();
  });

  socket.on('word:reveal', () => {
    if (!state.wordList.length) return;
    state.currentWord = state.wordList[Math.floor(Math.random() * state.wordList.length)];
    state.liveText = '';
    broadcast();
  });

  socket.on('live:update', ({ text }) => {
    state.liveText = text;
    broadcast();
  });

  // Teacher types what they heard the student spell → Enter → auto-check
  socket.on('answer:check', ({ answer }) => {
    if (!state.currentWord) return;
    const correct = answer.trim().toLowerCase() === state.currentWord.trim().toLowerCase();

    if (!correct) {
      // Eliminate the student immediately
      state.eliminated.push(state.currentStudent);
      state.students = state.students.filter(s => s !== state.currentStudent);
      state.spinQueue = state.spinQueue.filter(s => s !== state.currentStudent);
    }

    state.lastResult = {
      correct,
      answer: answer.trim(),
      word: state.currentWord,
      eliminatedName: !correct ? state.currentStudent : null,
      remaining: state.students.length,
    };
    state.liveText = '';
    state.phase = 'result';
    broadcast();
  });

  // "Next Round" — if only 1 player left, trigger champion screen
  socket.on('game:next', () => {
    if (state.students.length <= 1) {
      state.podium = buildPodium();
      state.phase = 'champion';
    } else {
      state.currentStudent = null;  // clear so eliminated name doesn't linger
      state.currentWord = null;
      state.liveText = '';
      state.lastResult = null;
      state.phase = 'playing';
    }
    broadcast();
  });

  // Override: add word to word list during game
  socket.on('vocab:add', ({ word }) => {
    const t = word.trim();
    if (t && !state.wordList.includes(t)) { state.wordList.push(t); broadcast(); }
  });

  // Override: add/remove student names during game
  socket.on('student:add', ({ name }) => {
    const t = name.trim();
    if (t && !state.students.includes(t)) { state.students.push(t); broadcast(); }
  });
  socket.on('student:remove', ({ name }) => {
    state.students = state.students.filter(s => s !== name);
    state.spinQueue = state.spinQueue.filter(s => s !== name);
    if (state.currentStudent === name) state.currentStudent = null;
    broadcast();
  });

  socket.on('game:reset', () => {
    state = { students: [], eliminated: [], wordList: [], spinQueue: [],
              currentStudent: null, liveText: '', currentWord: null,
              phase: 'setup', lastResult: null, podium: [] };
    broadcast();
  });
});

httpServer.listen(3004, () => console.log('🐝 Spelling Bee server running on http://localhost:3004'));
