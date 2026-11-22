import { io } from 'socket.io-client';

// In dev, Vite proxies /socket.io to localhost:3001
// In prod, the Express server serves both static files and socket.io
const URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

const socket = io(URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

export default socket;
