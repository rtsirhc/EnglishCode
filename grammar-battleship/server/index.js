import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3001;
const gameManager = new GameManager();

const broadcastGameState = (roomId) => {
    const room = gameManager.getRoom(roomId);
    if (!room) return;

    Object.keys(room.players).forEach(socketId => {
        const stateForPlayer = gameManager.hideOpponentState(room, socketId);
        io.to(socketId).emit('game_state_update', stateForPlayer);
    });
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_room', ({ vocabLists }, callback) => {
        const roomId = gameManager.createRoom(vocabLists);
        socket.join(roomId);

        const result = gameManager.joinRoom(roomId, 'Teacher/Player 1', socket.id);
        if (result.success) {
            callback({ success: true, roomId, state: result.state });
            broadcastGameState(roomId);
        } else {
            callback({ success: false, message: result.message });
        }
    });

    socket.on('join_room', ({ roomId, playerName }, callback) => {
        socket.join(roomId);
        const result = gameManager.joinRoom(roomId, playerName, socket.id);

        if (result.success) {
            callback({ success: true, state: result.state });
            broadcastGameState(roomId);
        } else {
            callback({ success: false, message: result.message });
            socket.leave(roomId);
        }
    });

    socket.on('place_ships', ({ roomId, ships }, callback) => {
        const result = gameManager.placeShips(roomId, socket.id, ships);
        if (result.success) {
            callback({ success: true });
            broadcastGameState(roomId);
        } else {
            callback({ success: false, message: result.message });
        }
    });

    socket.on('attack_target', ({ roomId, x, y }, callback) => {
        const result = gameManager.attackTarget(roomId, socket.id, x, y);
        if (result.success) {
            callback({ success: true });
            io.to(roomId).emit('pending_validation', result.pendingValidation);
            broadcastGameState(roomId);
        } else {
            callback({ success: false, message: result.message });
        }
    });

    socket.on('validate_attack', ({ roomId, correct }, callback) => {
        const result = gameManager.validateAttack(roomId, socket.id, correct);
        if (result.success) {
            callback({ success: true });
            broadcastGameState(roomId);
        } else {
            callback({ success: false, message: result.message });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const roomId = gameManager.handleDisconnect(socket.id);
        if (roomId) {
            broadcastGameState(roomId);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
