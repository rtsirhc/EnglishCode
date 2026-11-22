import { io } from 'socket.io-client';

const host = window.location.hostname;
const PROTOCOL = window.location.protocol;
const URL = import.meta.env.PROD ? undefined : `${PROTOCOL}//${host}:3002`;

export const socket = io(URL, {
    autoConnect: false,
});
