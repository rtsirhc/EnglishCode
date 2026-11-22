import { io } from 'socket.io-client';

const SERVER_PORT = 3003;
const SERVER_URL = `http://${window.location.hostname}:${SERVER_PORT}`;

const socket = io(SERVER_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});

export default socket;
