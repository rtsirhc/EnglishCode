export class GameManager {
    constructor() {
        this.rooms = new Map();
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    createRoom(vocabLists) {
        const roomId = this.generateRoomId();

        // Select 10 random subjects and 10 random past participles
        const maxSize = 10;
        const getRandomItems = (list, count) => {
            const shuffled = [...list].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        const subjects = getRandomItems(vocabLists.subjects.map(s => s.trim()).filter(s => s.length > 0), maxSize);
        const pastParticiples = getRandomItems(vocabLists.pastParticiples.map(p => p.trim()).filter(p => p.length > 0), maxSize);

        this.rooms.set(roomId, {
            id: roomId,
            status: 'lobby', // lobby, setup, playing, finished
            players: {},
            axes: {
                x: pastParticiples, // Columns (0-9) - Verbs
                y: subjects // Rows (0-9) - Nouns
            },
            boardSize: {
                width: pastParticiples.length,
                height: subjects.length
            },
            currentTurn: null, // socketId of the player whose turn it is
            pendingValidation: null,
            winner: null
        });

        return roomId;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    joinRoom(roomId, playerName, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) return { success: false, message: 'Room not found' };

        const playerIds = Object.keys(room.players);
        if (playerIds.length >= 2) return { success: false, message: 'Room is full' };

        room.players[socketId] = {
            id: socketId,
            name: playerName,
            ships: [],
            ready: false,
            boardStatus: Array(room.boardSize.height).fill(null).map(() => Array(room.boardSize.width).fill(0)), // 0: empty, 1: ship, 2: hit, 3: miss/dud
            connected: true
        };

        if (Object.keys(room.players).length === 2) {
            room.status = 'setup';
        }

        return { success: true, state: this.hideOpponentState(room, socketId) };
    }

    placeShips(roomId, socketId, ships) {
        const room = this.rooms.get(roomId);
        if (!room) return { success: false, message: 'Room not found' };
        if (room.status !== 'setup') return { success: false, message: 'Not in setup phase' };

        const player = room.players[socketId];
        if (!player) return { success: false, message: 'Player not found in room' };

        // Basic validation of ships here if needed. 
        // ships is an array of coordinates like [{x: 0, y: 0}, {x: 1, y: 0}]
        player.ships = ships;
        player.ready = true;

        // Apply ships to internal board status
        ships.forEach(ship => {
            if (ship.y < room.boardSize.height && ship.x < room.boardSize.width) {
                player.boardStatus[ship.y][ship.x] = 1; // 1 = ship
            }
        });

        const allReady = Object.values(room.players).every(p => p.ready);
        if (allReady && Object.keys(room.players).length === 2) {
            room.status = 'playing';
            room.currentTurn = Object.keys(room.players)[0]; // Player 1 goes first
        }

        return { success: true, state: this.hideOpponentState(room, socketId) };
    }

    attackTarget(roomId, socketId, x, y) {
        const room = this.rooms.get(roomId);
        if (!room) return { success: false, message: 'Room not found' };
        if (room.status !== 'playing') return { success: false, message: 'Not in playing phase' };
        if (room.currentTurn !== socketId) return { success: false, message: 'Not your turn' };
        if (room.pendingValidation) return { success: false, message: 'Wait for current attack validation' };

        const targetParticiple = room.axes.x[x];
        const targetSubject = room.axes.y[y];

        // Check if valid coordinates
        if (!targetSubject || !targetParticiple) return { success: false, message: 'Invalid coordinates' };

        room.pendingValidation = {
            attackerId: socketId,
            x,
            y,
            subject: targetSubject,
            pastParticiple: targetParticiple,
            sentence: `${targetSubject} + ${targetParticiple}`
        };

        return { success: true, state: this.hideOpponentState(room, socketId), pendingValidation: room.pendingValidation };
    }

    validateAttack(roomId, validatorSocketId, isCorrect) {
        const room = this.rooms.get(roomId);
        if (!room) return { success: false, message: 'Room not found' };
        if (!room.pendingValidation) return { success: false, message: 'No pending attack to validate' };
        if (room.pendingValidation.attackerId === validatorSocketId) return { success: false, message: 'Attacker cannot validate their own attack' };

        const { attackerId, x, y } = room.pendingValidation;
        const opponentId = validatorSocketId; // validator is the one being attacked
        const opponent = room.players[opponentId];
        const attacker = room.players[attackerId];

        if (!isCorrect) {
            // Grammar wrong -> Dud/Miss regardless of ship presence
            opponent.boardStatus[y][x] = 3; // 3 = Miss
        } else {
            // Grammar correct -> Check for hit
            if (opponent.boardStatus[y][x] === 1) {
                opponent.boardStatus[y][x] = 2; // 2 = Hit
            } else if (opponent.boardStatus[y][x] === 0) {
                opponent.boardStatus[y][x] = 3; // 3 = Miss
            }
        }

        room.pendingValidation = null;

        // Check win condition
        const hasShipsRemaining = opponent.boardStatus.some(row => row.includes(1));
        if (!hasShipsRemaining) {
            room.status = 'finished';
            room.winner = attackerId;
        } else {
            // Switch turn
            room.currentTurn = opponentId;
        }

        return { success: true, state: this.hideOpponentState(room, attackerId) }; // Next emit is sent to whole room anyway
    }

    handleDisconnect(socketId) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.players[socketId]) {
                // Option 1: Pause game, mark disconnected.
                // Option 2: Remove player and end game. Let's do simple end game for now if playing.
                room.players[socketId].connected = false;
                if (room.status === 'playing') {
                    room.status = 'finished';
                    room.winner = Object.keys(room.players).find(id => id !== socketId);
                }

                // Clean up empty rooms
                if (Object.values(room.players).every(p => !p.connected)) {
                    this.rooms.delete(roomId);
                    return null;
                }
                return roomId;
            }
        }
        return null;
    }

    // Utility to hide private opponent information before sending to a client
    hideOpponentState(room, requestorId) {
        const state = JSON.parse(JSON.stringify(room)); // deep copy

        for (const [playerId, player] of Object.entries(state.players)) {
            if (playerId !== requestorId && state.status !== 'finished') {
                player.ships = []; // Hide opponent's ships
                // Hide opponent's board status: map 1s (unhit ships) to 0s (empty)
                player.boardStatus = player.boardStatus.map(row =>
                    row.map(cell => cell === 1 ? 0 : cell)
                );
            }
        }

        return state;
    }
}
