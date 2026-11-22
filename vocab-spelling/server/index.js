import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ───────── leaderboard persistence ───────── */
const LB_PATH = path.join(__dirname, 'leaderboard.json');

function loadLeaderboard() {
  try {
    if (fs.existsSync(LB_PATH)) {
      return JSON.parse(fs.readFileSync(LB_PATH, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function saveLeaderboard(lb) {
  fs.writeFileSync(LB_PATH, JSON.stringify(lb, null, 2));
}

let leaderboard = loadLeaderboard();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3003;

/* ───────── word list (115 words) ───────── */
const WORDS = [
  'accurate','achieve','adaptation','advertisement','agriculture',
  'alliance','analyze','apparently','apply','approximately',
  'argue','artifact','astronomer','automated','available',
  'basic','biodegradable','biodiversity','biotechnology','brainstorm',
  'camouflage','catastrophic','categorize','cell membrane','centimeter',
  'chronology','circumstances','civilization','colonization','collection',
  'commemorate','compare','complex','conclusion','conquest',
  'consider','constitution','contrast','create','creative',
  'culture','define','democracy','develop','drought',
  'dynasty','dwindled','ecosystem','effective','empire',
  'enzyme','evaluate','evolution','everywhere','experiment',
  'exploration','experience','fossil fuels','foreshadowing','generation',
  'genetics','habitat','heritage','hyperbole','hydroelectric',
  'identify','imagine','independent','indisputable','individual',
  'influence','interdependent','jurisdictional','laboratory','manage',
  'mechanical','metamorphosis','microorganism','microscope','millimeter',
  'mysterious','nanotechnology','necessary','negative','organize',
  'parliament','particular','persuade','philosopher','photosphere',
  'photosynthesis','phototherapy','phytoplankton','predict','profession',
  'reality show','reconnaissance','repetition','restaurant','scaffolding',
  'sophomore','sovereignty','strawberry','streaming','sunglasses',
  'suspension','technology','understand','underwater','unconstitutional',
  'unprecedented','urbanization','vocabulary','wavelength','zigzagged',
];

/* ───────── sudden death indices (every 15th word) ───────── */
const SUDDEN_DEATH_INDICES = new Set([14, 29, 44, 59, 74, 89, 104]);

/* ───────── utility ───────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ───────── rooms ───────── */
const rooms = {};

function freshState() {
  return {
    gameMode: 'spelling',

    // ── Spelling state ──
    wordList: shuffle(WORDS),
    currentWordIndex: 0,
    money: 1,
    currentBet: 0,
    betPlaced: false,
    streak: 0,
    reviewList: [],
    phase: 'betting',

    resultType: null,
    doubleAvailable: false,
    doubleAccepted: false,
    teacherConnected: false,
    studentConnected: false,
    typedText: '',
    wordsCompleted: 0,

    // ── Timer & sudden death ──
    gameStartTime: null,     // set when first word typing begins
    suddenDeath: SUDDEN_DEATH_INDICES.has(0),
    lastTypedAnswer: '',     // what teacher typed (shown on result)
  };
}

function createRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = { ...freshState(), players: {} };
  }
}

function broadcast(roomId) {
  const room = rooms[roomId];
  if (room) {
    for (const [sid, info] of Object.entries(room.players)) {
      const s = io.sockets.sockets.get(sid);
      if (!s) continue;

      const base = {
        gameMode: 'spelling',
        currentWordIndex: room.currentWordIndex,
        totalWords: room.wordList.length,
        money: room.money,
        currentBet: room.currentBet,
        betPlaced: room.betPlaced,
        streak: room.streak,
        reviewList: room.reviewList,
        phase: room.phase,
        resultType: room.resultType,
        doubleAvailable: room.doubleAvailable,
        doubleAccepted: room.doubleAccepted,
        teacherConnected: room.teacherConnected,
        studentConnected: room.studentConnected,
        wordsCompleted: room.wordsCompleted,
        gameStartTime: room.gameStartTime,
        suddenDeath: room.suddenDeath,
        elapsedTime: room.elapsedTime || null,
        timePenalty: room.timePenalty || 0,
        finalTime: room.finalTime || null,
      };

      if (info.role === 'Teacher') {
        s.emit('game_state_update', {
          ...base,
          currentWord: room.wordList[room.currentWordIndex],
          typedText: room.typedText,
          lastTypedAnswer: room.lastTypedAnswer,
        });
      } else {
        // Student: NO live typedText, only result info
        s.emit('game_state_update', {
          ...base,
          currentWord: (room.phase === 'result' || room.phase === 'finished')
            ? room.wordList[room.currentWordIndex]
            : undefined,
          lastTypedAnswer: (room.phase === 'result')
            ? room.lastTypedAnswer
            : undefined,
        });
      }
    }
  }
}



/* ───────── connections ───────── */
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);
  let currentRoom = null;

  socket.on('join_room', ({ roomId, role }, callback) => {
    createRoom(roomId);
    const room = rooms[roomId];
    currentRoom = roomId;

    room.players[socket.id] = { role };
    socket.join(roomId);

    if (role === 'Teacher') room.teacherConnected = true;
    if (role === 'Student') room.studentConnected = true;

    callback({ success: true });
    broadcast(roomId);
  });

  /* ═══════════════════════════════
     SPELLING PHASE EVENTS
     ═══════════════════════════════ */

  /* ── Student: place bet ── */
  socket.on('place_bet', ({ roomId, amount }) => {
    const room = rooms[roomId];
    if (!room || room.phase !== 'betting') return;
    const maxAllowed = room.money > 0 ? room.money : Math.abs(room.money) + 1;
    let bet = Math.max(1, Math.min(amount, maxAllowed));

    room.currentBet = bet;
    room.betPlaced = true;
    room.phase = 'typing';
    room.typedText = '';
    room.lastTypedAnswer = '';

    // Start the global timer on the very first bet
    if (!room.gameStartTime) {
      room.gameStartTime = Date.now();
    }

    broadcast(roomId);
  });



  /* ── Teacher: live typing updates ── */
  socket.on('typing_update', ({ roomId, text }) => {
    const room = rooms[roomId];
    if (!room || room.phase !== 'typing') return;
    room.typedText = text;
    broadcast(roomId);
  });

  /* ── Teacher: submit answer ── */
  socket.on('submit_answer', ({ roomId, answer }) => {
    const room = rooms[roomId];
    if (!room || room.phase !== 'typing') return;

    const correctWord = room.wordList[room.currentWordIndex];
    const isCorrect = answer.trim().toLowerCase() === correctWord.toLowerCase();

    const multiplier = room.doubleAccepted ? 2 : 1;

    room.lastTypedAnswer = answer.trim();
    room.phase = 'result';
    if (isCorrect) {
      room.resultType = 'correct';
      room.money += room.currentBet * multiplier;
      room.streak++;
    } else {
      room.resultType = 'wrong';
      // 2× LOSS PENALTY applied to actual bet (and doubled if double mode)
      room.money -= room.currentBet * 2 * multiplier;
      room.streak = 0;
      room.doubleAvailable = false;
      if (!room.reviewList.includes(correctWord)) {
        room.reviewList.push(correctWord);
      }
    }
    room.wordsCompleted++;
    broadcast(roomId);
  });

  /* ── Teacher: override correct ── */
  socket.on('override_correct', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (room.resultType === 'wrong') {
      const correctWord = room.wordList[room.currentWordIndex];
      room.resultType = 'correct';
      
      const multiplier = room.doubleAccepted ? 2 : 1;
      const penaltyApplied = room.currentBet * 2 * multiplier;
      const winAmount = room.currentBet * multiplier;
      
      // Undo the penalty, then add the win
      room.money += penaltyApplied + winAmount;
      room.streak++;
      room.reviewList = room.reviewList.filter(w => w !== correctWord);
    }
    broadcast(roomId);
  });



  /* ── Teacher: manually set money ── */
  socket.on('set_money', ({ roomId, amount }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.money = Math.round(amount); // can be negative
    broadcast(roomId);
  });

  /* ── Teacher: next round ── */
  socket.on('next_round', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const nextIndex = room.currentWordIndex + 1;

    if (nextIndex >= room.wordList.length) {
      room.phase = 'finished';
      // Save to leaderboard with time penalty for negative balance
      if (room.gameStartTime) {
        const rawElapsed = Math.round((Date.now() - room.gameStartTime) / 1000);
        // Every -$100 = +60 seconds penalty
        const penaltyMinutes = room.money < 0 ? Math.floor(Math.abs(room.money) / 100) : 0;
        const penaltySeconds = penaltyMinutes * 60;
        const finalTime = rawElapsed + penaltySeconds;
        const correctCount = room.wordsCompleted - room.reviewList.length;
        leaderboard.push({
          room: roomId,
          time: finalTime,
          rawTime: rawElapsed,
          penalty: penaltySeconds,
          accuracy: room.wordsCompleted > 0
            ? Math.round((correctCount / room.wordsCompleted) * 100)
            : 0,
          money: room.money,
          date: new Date().toISOString(),
        });
        leaderboard.sort((a, b) => a.time - b.time);
        leaderboard = leaderboard.slice(0, 20); // keep top 20
        saveLeaderboard(leaderboard);
        room.elapsedTime = rawElapsed;
        room.timePenalty = penaltySeconds;
        room.finalTime = finalTime;
      }
      broadcast(roomId);
      return;
    }

    room.currentWordIndex = nextIndex;
    room.currentBet = 0;
    room.betPlaced = false;
    room.resultType = null;
    room.typedText = '';
    room.lastTypedAnswer = '';
    room.doubleAccepted = false;
    room.doubleAvailable = false;
    room.suddenDeath = SUDDEN_DEATH_INDICES.has(nextIndex);

    // Sudden Death: auto ALL-IN, skip betting
    if (room.suddenDeath) {
      room.currentBet = room.money > 0 ? room.money : Math.abs(room.money) + 1;
      room.betPlaced = true;
      room.phase = 'typing';
      // Start timer if this is the very first round
      if (!room.gameStartTime) {
        room.gameStartTime = Date.now();
      }
    } else if (room.streak > 0 && room.streak % 3 === 0) {
      room.doubleAvailable = true;
      room.phase = 'doublePrompt';
    } else {
      room.doubleAvailable = false;
      room.phase = 'betting';
    }
    broadcast(roomId);
  });

  /* ── Student: double bet response ── */
  socket.on('double_bet_response', ({ roomId, accepted }) => {
    const room = rooms[roomId];
    if (!room || room.phase !== 'doublePrompt') return;

    if (accepted) {
      room.doubleAvailable = false;
      room.phase = 'betting';
      room.doubleAccepted = true;
    } else {
      room.doubleAvailable = false;
      room.streak = 0;
      room.phase = 'betting';
      room.doubleAccepted = false;
    }
    broadcast(roomId);
  });

  /* ── Teacher: restart game ── */
  socket.on('restart_game', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    const players = room.players;
    const teacherConnected = room.teacherConnected;
    const studentConnected = room.studentConnected;
    rooms[roomId] = { ...freshState(), players, teacherConnected, studentConnected };
    broadcast(roomId);
  });

  /* ── Leaderboard request ── */
  socket.on('get_leaderboard', (callback) => {
    if (typeof callback === 'function') {
      callback(leaderboard);
    }
  });

  /* ── disconnect ── */
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];
      const info = room.players[socket.id];
      if (info) {
        if (info.role === 'Teacher') room.teacherConnected = false;
        if (info.role === 'Student') room.studentConnected = false;
        delete room.players[socket.id];
      }
      broadcast(currentRoom);
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Vocab Spelling server running on port ${PORT}`);
});
