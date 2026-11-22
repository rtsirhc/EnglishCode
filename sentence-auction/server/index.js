import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3002;

// room logic
const rooms = {};

const createRoom = (roomId) => {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            players: {},
            bankroll: 1000,
            dealerId: null,
            bidderId: null,
            currentQuestionIndex: null,
            isRevealed: false,
        };
    }
};

const broadcastState = (roomId) => {
    const room = rooms[roomId];
    if (room) {
        io.to(roomId).emit('game_state_update', room);
    }
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', ({ roomId, role }, callback) => {
        createRoom(roomId);
        const room = rooms[roomId];

        if (role === 'Dealer') {
            room.dealerId = socket.id;
        } else if (role === 'Bidder') {
            room.bidderId = socket.id;
        }

        room.players[socket.id] = { role };
        socket.join(roomId);

        callback({ success: true, state: room });
        broadcastState(roomId);
    });

    socket.on('update_state', ({ roomId, newState }, callback) => {
        if (rooms[roomId]) {
            rooms[roomId] = { ...rooms[roomId], ...newState };
            broadcastState(roomId);
            if (callback) callback({ success: true });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players[socket.id]) {
                delete room.players[socket.id];
                if (room.dealerId === socket.id) room.dealerId = null;
                if (room.bidderId === socket.id) room.bidderId = null;
                broadcastState(roomId);
            }
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
