import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3003;

// ─── Sentence Database (duplicated server-side for grading) ───
const listeningTraps = [
    "I wanted to go to the center.",
    "She bought a lot of water.",
    "Did you tell him about it?",
    "What are you going to do today?",
    "I left it on the internet.",
    "He painted the house for her.",
    "Could you put it on the table?",
    "I don't know what he wanted.",
    "They have twenty bottles of juice.",
    "Is it a little bit better?",
    "Can't you see the winter snow?",
    "I met him at the city bank.",
    "What did you do with his car?",
    "I thought about it a lot.",
    "Why won't you let him in?",
    "Did you write it down?",
    "She won't let him do it.",
    "Don't you want to meet her?",
    "I bought a lot of food for him.",
    "Would you put it in a bottle?",
    "Are you going to invite him?",
    "Did you get out of the house?",
    "I didn't want to hurt him.",
    "Is it his or is it hers?",
    "Tell him I love her.",
    "What is he doing at the hospital?",
    "We have an interview tomorrow.",
    "Did you tell the dentist about it?",
    "I wanted to ask him a question.",
    "The printer is broken again.",
    "Put it in the center of the room.",
    "Nice to meet you at the party.",
    "I told you about the meeting.",
    "Get out of here right now.",
    "It is a very big city.",
    "I found a lot of money.",
    "He is a little bit tired.",
    "Would you like a glass of water?",
    "Did you see the international flight?",
    "I need to print twenty pages.",
    "She wanted a new computer.",
    "Did you find his lost keys?",
    "I will tell her the truth.",
    "Can't you wait a little longer?",
    "It is better to go home.",
    "She put it on the bed.",
    "I want to travel the world.",
    "What did you say to him?",
    "Do you want to eat dinner?",
    "I need a little more time.",
];

const speakingTraps = [
    "Please speak Spanish to the smart student.",
    "I want a yellow jello for dessert.",
    "The best vest is very big.",
    "She chose to buy cheap shoes.",
    "I think there are three trees.",
    "Just stop stepping on the small spider.",
    "He got a job this year.",
    "Vote for the very best boat.",
    "Watch her wash the wooden chair.",
    "The thief took thirty thick things.",
    "Let's start the school story.",
    "Yes, I want juice with my jam.",
    "A very big van drove by.",
    "The shop sells cheap potato chips.",
    "My brother thinks about math.",
    "The snake is in a small space.",
    "Do you want yam or jam?",
    "The brave boys bought a base.",
    "Share the cherry with the child.",
    "That father breathes through his mouth.",
    "Stop starting bad jokes.",
    "Jack and you are just young.",
    "Seven smart students jumped up.",
    "She is chewing on a cheap shoe.",
    "There are thirty thick trees.",
    "A small mistake stopped the game.",
    "Jenny yelled at you yesterday.",
    "Buy the very best yellow vase.",
    "Catch the cash at the shop.",
    "Think about the smooth weather.",
    "We stayed at the school.",
    "I have not flown on the jet yet.",
    "The berry is very sweet.",
    "Watch the witch wash the ship.",
    "The mother gathered three feathers.",
    "A famous statue stands there.",
    "Did you yell at the jello?",
    "I vote for the big vowel.",
    "He chopped the fish at the shop.",
    "They walked through the thick path.",
    "It looks scary in the space.",
    "He told a joke about an egg yolk.",
    "Stop the van in the village.",
    "Choose to share the cheese.",
    "Those brothers are smarter than them.",
    "Nice smile on the smart student.",
    "I want my yellow jacket.",
    "The brave bat flew very fast.",
    "The child crushed the chalk.",
    "Nothing is better than healthy teeth.",
];

// ─── Room State ───
const rooms = {};
const roomTimers = {}; // Server-authoritative listening timers

const LISTENING_TIMER_SECONDS = 30;

function generateRoomCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function normalize(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function pickRandomSentence(room, type) {
    const pool = type === 'listening' ? listeningTraps : speakingTraps;
    const usedKey = type === 'listening' ? 'usedListening' : 'usedSpeaking';
    const available = pool
        .map((s, i) => i)
        .filter(i => !room[usedKey].includes(i));

    if (available.length === 0) {
        room[usedKey] = [];
        return pickRandomSentence(room, type);
    }

    const idx = available[Math.floor(Math.random() * available.length)];
    room[usedKey].push(idx);
    return { sentence: pool[idx], index: idx };
}

function checkWinCondition(room) {
    const p1 = room.players.p1;
    const p2 = room.players.p2;
    if (!p1 || !p2) return null;

    if (p1.balance >= 100000) return 'p1';
    if (p2.balance >= 100000) return 'p2';
    if (p1.balance <= 0) return 'p2';
    if (p2.balance <= 0) return 'p1';
    return null;
}

function clearListeningTimer(roomCode) {
    if (roomTimers[roomCode]) {
        clearTimeout(roomTimers[roomCode]);
        delete roomTimers[roomCode];
    }
}

function startListeningTimer(roomCode) {
    clearListeningTimer(roomCode);
    const room = rooms[roomCode];
    if (!room) return;

    room.listeningTimerStart = Date.now();
    room.listeningTimerSeconds = LISTENING_TIMER_SECONDS;

    roomTimers[roomCode] = setTimeout(() => {
        const r = rooms[roomCode];
        if (!r || r.phase !== 'listening_active') return;

        // Time's up — active player (loser) pays out the winner's bet from their fund
        const loser = r.activePlayer;
        const winner = loser === 'p1' ? 'p2' : 'p1';
        const bet = r.bets[winner];

        r.players[loser].balance -= bet;
        r.players[winner].balance += bet;

        if (r.players[loser].balance < 0) {
            r.players[winner].balance -= r.players[loser].balance;
            r.players[loser].balance = 0;
        }

        const winCheck = checkWinCondition(r);
        if (winCheck) {
            r.winner = winCheck;
            r.lastResult = { winner, loser, amount: bet, correct: false, timedOut: true };
            r.phase = 'game_over';
        } else {
            // Switch turn to opponent
            r.activePlayer = winner;
            r.lastResult = { winner, loser, amount: bet, correct: false, timedOut: true, turnSwitch: true };
            r.submittedAnswer = null;
            // Restart timer for the new player
            startListeningTimer(roomCode);
        }

        broadcastState(roomCode);
        console.log(`⏰ Timer expired for ${loser} in room ${roomCode}`);
    }, LISTENING_TIMER_SECONDS * 1000);
}

function broadcastState(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    // Send full state to host
    if (room.hostId) {
        io.to(room.hostId).emit('game_state', room);
    }

    // Send filtered state to players
    ['p1', 'p2'].forEach(pKey => {
        const player = room.players[pKey];
        if (player && player.socketId) {
            const opponentKey = pKey === 'p1' ? 'p2' : 'p1';
            const opponent = room.players[opponentKey];
            io.to(player.socketId).emit('game_state', {
                ...room,
                playerKey: pKey,
                myBalance: player.balance,
                myBet: room.bets[pKey],
                opponentBalance: opponent ? opponent.balance : 0,
                opponentName: opponent ? opponent.name : 'Waiting...',
                myBetLocked: room.bets[pKey] !== null,
                opponentBetLocked: room.bets[opponentKey] !== null,
                isActivePlayer: room.activePlayer === pKey,
                // Don't send the correct answer to players during listening
                correctAnswer: undefined,
            });
        }
    });
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// ─── Socket Events ───
io.on('connection', (socket) => {
    console.log(`✦ Connected: ${socket.id}`);

    // HOST: Create room
    socket.on('create_room', (callback) => {
        let code = generateRoomCode();
        while (rooms[code]) code = generateRoomCode();

        rooms[code] = {
            roomCode: code,
            phase: 'lobby',
            hostId: socket.id,
            players: { p1: null, p2: null },
            bets: { p1: null, p2: null },
            currentQuestion: null,
            questionType: null,
            activePlayer: null,
            buzzerReleased: false,
            buzzerWinner: null,
            stealRequest: null,
            usedListening: [],
            usedSpeaking: [],
            winner: null,
            lastResult: null,
            submittedAnswer: null,
            buzzerTimestamps: {},
        };

        socket.join(code);
        const localIP = getLocalIP();
        callback({ success: true, roomCode: code, localIP });
        console.log(`🏠 Room ${code} created by host ${socket.id}`);
    });

    // PLAYER: Join room
    socket.on('join_room', ({ roomCode, playerName }, callback) => {
        const room = rooms[roomCode];
        if (!room) return callback({ success: false, error: 'Room not found' });

        let playerKey = null;
        if (!room.players.p1) {
            playerKey = 'p1';
        } else if (!room.players.p2) {
            playerKey = 'p2';
        } else {
            return callback({ success: false, error: 'Room is full' });
        }

        room.players[playerKey] = {
            socketId: socket.id,
            name: playerName,
            balance: 1000,
        };

        socket.join(roomCode);
        socket.playerKey = playerKey;
        socket.roomCode = roomCode;

        callback({ success: true, playerKey });
        broadcastState(roomCode);
        console.log(`🎮 ${playerName} joined room ${roomCode} as ${playerKey}`);
    });

    // HOST: Start game (both players must be connected)
    socket.on('start_game', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room) return callback?.({ success: false });
        if (!room.players.p1 || !room.players.p2) {
            return callback?.({ success: false, error: 'Need 2 players' });
        }
        room.phase = 'select_question';
        broadcastState(roomCode);
        callback?.({ success: true });
    });

    // HOST: Select question type
    socket.on('select_question_type', ({ roomCode, type }, callback) => {
        const room = rooms[roomCode];
        if (!room) return;

        const picked = pickRandomSentence(room, type);
        room.questionType = type;
        room.currentQuestion = picked;
        room.phase = 'betting';
        room.bets = { p1: null, p2: null };
        room.activePlayer = null;
        room.buzzerReleased = false;
        room.buzzerWinner = null;
        room.stealRequest = null;
        room.lastResult = null;
        room.submittedAnswer = null;
        room.buzzerTimestamps = {};

        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`📝 Room ${roomCode}: ${type} question selected`);
    });

    // PLAYER: Place bet
    socket.on('place_bet', ({ roomCode, playerKey, amount }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'betting') return;

        const player = room.players[playerKey];
        if (!player) return;

        const betAmount = Math.min(Math.max(1, Math.floor(amount)), player.balance);
        room.bets[playerKey] = betAmount;

        broadcastState(roomCode);
        callback?.({ success: true });

        // Check if both bets are in
        if (room.bets.p1 !== null && room.bets.p2 !== null) {
            room.phase = 'buzzer_ready';
            broadcastState(roomCode);
        }
    });

    // HOST: Release buzzer
    socket.on('release_buzzer', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'buzzer_ready') return;

        room.phase = 'buzzer_active';
        room.buzzerReleased = true;
        room.buzzerTimestamps = {};

        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`🔴 Buzzer released in room ${roomCode}`);
    });

    // PLAYER: Tap buzzer
    socket.on('buzzer_tap', ({ roomCode, playerKey }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'buzzer_active') return;

        // Record timestamp — first one wins
        if (!room.buzzerTimestamps[playerKey]) {
            room.buzzerTimestamps[playerKey] = Date.now();
        }

        // Check if we have a winner
        const keys = Object.keys(room.buzzerTimestamps);
        if (keys.length >= 1 && !room.buzzerWinner) {
            // First tap wins
            room.buzzerWinner = playerKey;
            room.activePlayer = playerKey;

            if (room.questionType === 'listening') {
                room.phase = 'listening_active';
                startListeningTimer(roomCode);
            } else {
                room.phase = 'speaking_active';
            }

            broadcastState(roomCode);
            callback?.({ success: true, won: true });
            console.log(`⚡ ${playerKey} buzzed first in room ${roomCode}`);
        } else {
            callback?.({ success: true, won: false });
        }
    });

    // PLAYER: Submit answer (listening)
    socket.on('submit_answer', ({ roomCode, playerKey, answer }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'listening_active') return;
        if (room.activePlayer !== playerKey) return;

        const correctAnswer = room.currentQuestion.sentence;
        const normalizedSubmission = normalize(answer);
        const normalizedCorrect = normalize(correctAnswer);
        const isCorrect = normalizedSubmission === normalizedCorrect;

        room.submittedAnswer = answer;

        if (isCorrect) {
            clearListeningTimer(roomCode);
            // Active player wins — gets their bet added to balance
            const winner = playerKey;
            const loser = winner === 'p1' ? 'p2' : 'p1';
            const bet = room.bets[winner];

            room.players[winner].balance += bet;

            room.lastResult = {
                winner,
                loser,
                amount: bet,
                correct: true,
                submittedAnswer: answer,
            };

            room.winner = checkWinCondition(room);
            room.phase = room.winner ? 'game_over' : 'round_result';
        } else {
            clearListeningTimer(roomCode);
            // Wrong answer — pay winner's bet out of loser's fund, opponent gets a turn
            const loser = playerKey;
            const winner = loser === 'p1' ? 'p2' : 'p1';
            const bet = room.bets[winner];

            room.players[loser].balance -= bet;
            room.players[winner].balance += bet;

            if (room.players[loser].balance < 0) {
                room.players[winner].balance -= room.players[loser].balance;
                room.players[loser].balance = 0;
            }

            // Check for win after failed answer transfer
            const winCheck = checkWinCondition(room);
            if (winCheck) {
                room.winner = winCheck;
                room.lastResult = {
                    winner,
                    loser,
                    amount: bet,
                    correct: false,
                    submittedAnswer: answer,
                };
                room.phase = 'game_over';
            } else {
                // Switch turn to opponent
                room.activePlayer = winner;
                room.lastResult = {
                    winner,
                    loser,
                    amount: bet,
                    correct: false,
                    submittedAnswer: answer,
                    turnSwitch: true,
                };
                room.submittedAnswer = null;
                // Restart timer for the new player
                startListeningTimer(roomCode);
            }
        }

        broadcastState(roomCode);
        callback?.({ success: true, isCorrect });
    });

    // HOST: Override mark correct (listening)
    socket.on('host_override', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room) return;

        clearListeningTimer(roomCode);

        const winner = room.activePlayer;
        const loser = winner === 'p1' ? 'p2' : 'p1';
        const bet = room.bets[winner];

        room.players[winner].balance += bet;

        room.lastResult = {
            winner,
            loser,
            amount: bet,
            correct: true,
            override: true,
        };

        room.winner = checkWinCondition(room);
        room.phase = room.winner ? 'game_over' : 'round_result';

        broadcastState(roomCode);
        callback?.({ success: true });
    });

    // HOST: Skip question (no money transfer, just move on)
    socket.on('skip_question', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room) return;

        clearListeningTimer(roomCode);

        room.lastResult = { skipped: true };
        room.phase = 'round_result';

        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`⏭️ Question skipped in room ${roomCode}`);
    });

    // HOST: Skip timer (force timer expiration immediately for active player)
    socket.on('skip_timer', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'listening_active') return;

        clearListeningTimer(roomCode);

        // Force timer expiration logic: active player times out, pays winner's bet to opponent
        const loser = room.activePlayer;
        const winner = loser === 'p1' ? 'p2' : 'p1';
        const bet = Number(room.bets[winner] || room.bets[loser]) || 0;

        if (loser && room.players[loser]) {
            room.players[loser].balance = Math.max(0, room.players[loser].balance - bet);
        }
        if (winner && room.players[winner]) {
            room.players[winner].balance += bet;
        }

        const winCheck = checkWinCondition(room);
        if (winCheck) {
            room.winner = winCheck;
            room.lastResult = { winner, loser, amount: bet, correct: false, timedOut: true };
            room.phase = 'game_over';
        } else {
            // Switch turn to opponent
            room.activePlayer = winner;
            room.lastResult = { winner, loser, amount: bet, correct: false, timedOut: true, turnSwitch: true };
            room.submittedAnswer = null;
            // Restart timer for the new player
            startListeningTimer(roomCode);
        }

        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`⏱️ Host skipped timer for ${loser} in room ${roomCode}`);
    });

    // HOST: Mark ALL players correct (add bet to every player who bet)
    socket.on('mark_all_correct', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room) return;

        clearListeningTimer(roomCode);

        ['p1', 'p2'].forEach(pKey => {
            const player = room.players[pKey];
            const bet = Number(room.bets[pKey]) || 0;
            if (player && bet > 0) {
                player.balance += bet;
            }
        });

        room.lastResult = {
            allCorrect: true,
            correct: true,
        };

        room.winner = checkWinCondition(room);
        room.phase = room.winner ? 'game_over' : 'round_result';

        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`🎉 Host marked ALL players correct in room ${roomCode}`);
    });

    // PLAYER: Request steal (speaking)
    socket.on('request_steal', ({ roomCode, playerKey }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'speaking_active') return;
        if (room.activePlayer === playerKey) return; // Can't steal your own turn

        room.stealRequest = { from: playerKey, pending: true };
        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`🏴‍☠️ ${playerKey} requests steal in room ${roomCode}`);
    });

    // HOST: Approve steal
    socket.on('approve_steal', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room || !room.stealRequest) return;

        const stealer = room.stealRequest.from;
        room.activePlayer = stealer;
        room.stealRequest = null;

        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`✅ Steal approved, turn goes to ${stealer}`);
    });

    // HOST: Deny steal
    socket.on('deny_steal', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room || !room.stealRequest) return;

        room.stealRequest = null;
        broadcastState(roomCode);
        callback?.({ success: true });
        console.log(`❌ Steal denied`);
    });

    // HOST: Mark correct (speaking)
    socket.on('mark_correct_speaking', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room || room.phase !== 'speaking_active') return;

        const winner = room.activePlayer;
        const loser = winner === 'p1' ? 'p2' : 'p1';
        const bet = room.bets[winner];

        room.players[winner].balance += bet;

        room.lastResult = {
            winner,
            loser,
            amount: bet,
            correct: true,
        };

        room.winner = checkWinCondition(room);
        room.phase = room.winner ? 'game_over' : 'round_result';

        broadcastState(roomCode);
        callback?.({ success: true });
    });

    // HOST: Next round
    socket.on('next_round', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room) return;

        room.phase = 'select_question';
        room.bets = { p1: null, p2: null };
        room.currentQuestion = null;
        room.questionType = null;
        room.activePlayer = null;
        room.buzzerReleased = false;
        room.buzzerWinner = null;
        room.stealRequest = null;
        room.lastResult = null;
        room.submittedAnswer = null;
        room.buzzerTimestamps = {};

        broadcastState(roomCode);
        callback?.({ success: true });
    });

    // HOST: New game (reset everything)
    socket.on('new_game', ({ roomCode }, callback) => {
        const room = rooms[roomCode];
        if (!room) return;

        if (room.players.p1) room.players.p1.balance = 1000;
        if (room.players.p2) room.players.p2.balance = 1000;

        room.phase = 'select_question';
        room.bets = { p1: null, p2: null };
        room.currentQuestion = null;
        room.questionType = null;
        room.activePlayer = null;
        room.buzzerReleased = false;
        room.buzzerWinner = null;
        room.stealRequest = null;
        room.usedListening = [];
        room.usedSpeaking = [];
        room.winner = null;
        room.lastResult = null;
        room.submittedAnswer = null;
        room.buzzerTimestamps = {};

        broadcastState(roomCode);
        callback?.({ success: true });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`✦ Disconnected: ${socket.id}`);
        for (const code in rooms) {
            const room = rooms[code];
            if (room.hostId === socket.id) {
                // Host disconnected — notify players
                io.to(code).emit('host_disconnected');
                delete rooms[code];
                console.log(`🏠 Room ${code} destroyed (host left)`);
            } else {
                ['p1', 'p2'].forEach(pKey => {
                    if (room.players[pKey] && room.players[pKey].socketId === socket.id) {
                        const name = room.players[pKey].name;
                        room.players[pKey] = null;
                        broadcastState(code);
                        console.log(`🎮 ${name} left room ${code}`);
                    }
                });
            }
        }
    });
});

// ─── Start Server ───
httpServer.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n  ⚡ Sentence Showdown Server`);
    console.log(`  ✦ Local:   http://localhost:${PORT}`);
    console.log(`  ✦ Network: http://${localIP}:${PORT}\n`);
});
