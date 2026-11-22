import { io } from 'socket.io-client';

// Use the current window's hostname so that iPads connect back to the Mac
const host = window.location.hostname;
const PROTOCOL = window.location.protocol;
const URL = import.meta.env.PROD ? undefined : `${PROTOCOL}//${host}:3001`;

export const socket = io(URL, {
    autoConnect: false, // We will connect when needed
});
