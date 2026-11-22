const express = require('http');
const expressApp = require('express');
const { Server } = require('socket.io');
const path = require('path');

const app = expressApp();
const server = express.createServer(app);
const io = new Server(server);

app.use(expressApp.static(path.join(__dirname, 'public')));

// Track active teams and their states
let teams = {};

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Student joins a team
    socket.on('join_game', ({ teamName }) => {
        teams[socket.id] = {
            id: socket.id,
            name: teamName,
            level: 1,
            progress: 0, // 0 to 100
            timeElapsed: 0, // in seconds
            hintsUsed: 0,
            penaltySeconds: 0,
            finished: false
        };
        io.emit('update_leaderboard', Object.values(teams));
    });

    // Student requests a hint
    socket.on('request_hint', () => {
        let team = teams[socket.id];
        if (!team || team.finished) return;

        if (team.hintsUsed === 0) {
            team.hintsUsed = 1;
            team.penaltySeconds += 60; // Adds 1 minute
            socket.emit('hint_response', { hintLevel: 1, penalty: '+1 Minute added', text: getHint(team.level, 1) });
        } else if (team.hintsUsed === 1) {
            team.hintsUsed = 2;
            team.penaltySeconds += 300; // Adds 5 minutes
            socket.emit('hint_response', { hintLevel: 2, penalty: '+5 Minutes added', text: getHint(team.level, 2) });
        } else {
            socket.emit('hint_response', { hintLevel: 3, penalty: 'No hints left!', text: 'You have exhausted all hints for this round!' });
        }
        io.emit('update_leaderboard', Object.values(teams));
    });

    // Student submits passcode for current level
    socket.on('submit_passcode', ({ level, passcode }) => {
        let team = teams[socket.id];
        if (!team || team.finished) return;

        let isValid = validatePasscode(level, passcode);

        if (isValid) {
            if (team.level < 4) {
                team.level += 1;
                team.progress = (team.level - 1) * 25;
                socket.emit('level_passed', { nextLevel: team.level });
            } else {
                team.level = 4;
                team.progress = 100;
                team.finished = true;
                socket.emit('game_won', { finalTime: team.timeElapsed + team.penaltySeconds });
            }
            io.emit('update_leaderboard', Object.values(teams));
        } else {
            socket.emit('wrong_passcode', { message: 'Incorrect cryptographic key! The system rejected your input.' });
        }
    });

    // Sync timer tick from client
    socket.on('sync_timer', ({ totalSeconds }) => {
        if (teams[socket.id] && !teams[socket.id].finished) {
            teams[socket.id].timeElapsed = totalSeconds;
            io.emit('update_leaderboard', Object.values(teams));
        }
    });

    socket.on('disconnect', () => {
        delete teams[socket.id];
        io.emit('update_leaderboard', Object.values(teams));
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Helper validation logic for cryptic passcodes
function validatePasscode(level, code) {
    const cleanCode = code.trim().toUpperCase();
    switch(level) {
        case 1: return cleanCode === "PLAN-3"; // Triple P & Resource Leak cipher
        case 2: return cleanCode === "CO2-LOOP"; // Climate feedback loop cipher
        case 3: return cleanCode === "3RS-RECYCLE"; // Circular economy cipher
        case 4: return cleanCode === "FINE-BAN"; // Final policy enforcement cipher
        default: return false;
    }
}

function helperGetHostUrl(req) {
    return req.protocol + '://' + req.get('host');
}

// Helper hints generator
function getHint(level, hintNum) {
    const hints = {
        1: { 1: "Look closely at the most severely depleted natural resource in the audit report.", 2: "The pillar affected is 'Planet', and the leak index is 3." },
        2: { 1: "Trace the greenhouse gas emission chain backward from agricultural collapse.", 2: "The target sequence starts with C-O-2." },
        3: { 1: "You need to insert a circular loop step right between manufacturing and disposal.", 2: "The required strategy uses the second of the 3 Rs." },
        4: { 1: "Severe toxic dumping requires a punitive financial or legal block.", 2: "Tools required: First a monetary punishment, second a legal prohibition." }
    };
    return hints[level] ? hints[level][hintNum] : "No hint available.";
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
