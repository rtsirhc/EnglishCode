import { GameManager } from '../../server/GameManager.js';

const listeners = new Map();
const pending = new Map();
let channel, peer, manager, code, host = false, releaseLock;
const connections = new Map();
let closing = false;
let mode = 'local';
const namespace = 'englishcode-battleship-';

function notify(event, value) {
    for (const handler of listeners.get(event) || []) handler(value);
}
function send(message, recipient) {
    if (channel) channel.postMessage({ ...message, from: socket.id, to: recipient });
    else if (host) connections.get(recipient)?.send(message);
    else connections.get('host')?.send(message);
}
function publish() {
    const room = manager?.getRoom(code);
    if (!room) return;
    for (const id of Object.keys(room.players)) {
        const state = manager.hideOpponentState(room, id);
        if (id === socket.id) notify('game_state_update', state);
        else send({ type: 'state', state }, id);
    }
}
function execute(event, payload, actor) {
    if (!payload || payload.roomId !== code) return { success: false, message: 'Invalid room.' };
    const { ships, x, y, correct, playerName } = payload;
    switch (event) {
        case 'join_room':
            return manager.joinRoom(code, typeof playerName === 'string' ? playerName.trim().slice(0, 60) : 'Player 2', actor);
        case 'place_ships': return manager.placeShips(code, actor, ships);
        case 'attack_target': return manager.attackTarget(code, actor, x, y);
        case 'validate_attack': return manager.validateAttack(code, actor, correct);
        default: return { success: false, message: 'Unknown game action.' };
    }
}
function receive(message, sender) {
    if (!message || (message.to && message.to !== socket.id)) return;
    if (host) {
        if (message.type === 'leave') { manager.handleDisconnect(sender); publish(); return; }
        if (message.type !== 'request' || typeof message.requestId !== 'string') return;
        let result;
        try { result = execute(message.event, message.payload, sender); }
        catch { result = { success: false, message: 'Invalid game action.' }; }
        send({ type: 'response', requestId: message.requestId, result }, sender);
        if (result.success) publish();
    } else if (message.type === 'response') {
        const request = pending.get(message.requestId);
        if (request) {
            clearTimeout(request.timeout); pending.delete(message.requestId);
            if (request.event === 'join_room' && !message.result?.success) closeRoom();
            request.callback(message.result);
        }
    } else if (message.type === 'state') notify('game_state_update', message.state);
    else if (message.type === 'end') {
        closeRoom();
        notify('room_closed', 'The host closed this room. Create or join a new game.');
    }
}
function closeRoom() {
    if (closing) return;
    closing = true;
    if (channel || peer) send({ type: host ? 'end' : 'leave' });
    channel?.close(); channel = null;
    const previousConnections = [...connections.values()];
    connections.clear();
    for (const connection of previousConnections) connection.close();
    peer?.destroy(); peer = null;
    releaseLock?.(); releaseLock = null;
    manager = null;
    for (const request of pending.values()) {
        clearTimeout(request.timeout);
        request.callback({ success: false, message: 'Room connection closed.' });
    }
    pending.clear();
    code = null; host = false; closing = false;
}
async function openTransport(roomCode, isHost) {
    code = roomCode; host = isHost;
    if (mode === 'local') {
        if (host) await new Promise((resolve, reject) => {
            navigator.locks.request(namespace + code, { ifAvailable: true }, lock => {
                if (!lock) { reject(new Error('Room code in use. Create another game.')); return; }
                resolve();
                return new Promise(release => { releaseLock = release; });
            }).catch(reject);
        });
        channel = new BroadcastChannel(namespace + code);
        channel.onmessage = ({ data }) => receive(data, data.from);
        return;
    }
    const { default: Peer } = await import('peerjs');
    const activePeer = new Peer(host ? namespace + code : socket.id);
    peer = activePeer;
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Could not connect. Check internet or choose Same browser on both screens.')), 15000);
        activePeer.on('open', () => { clearTimeout(timeout); resolve(); });
        activePeer.on('error', error => { clearTimeout(timeout); reject(new Error(error.type === 'unavailable-id' ? 'Room code in use.' : 'Room connection unavailable. Check the code and internet.')); });
    });
    function attach(connection, key) {
        connections.set(key, connection);
        connection.on('data', message => receive(message, connection.peer));
        connection.on('error', () => connection.close());
        connection.on('close', () => {
            if (connections.get(key) !== connection) return;
            connections.delete(key);
            if (host) { manager?.handleDisconnect(key); publish(); }
            else { closeRoom(); notify('room_closed', 'Connection to the host closed. Open a new room.'); }
        });
    }
    if (host) activePeer.on('connection', connection => attach(connection, connection.peer));
    else await new Promise((resolve, reject) => {
        const connection = activePeer.connect(namespace + code, { reliable: true });
        const timeout = setTimeout(() => reject(new Error('Room not found. Start the host first and check the room code.')), 15000);
        attach(connection, 'host');
        connection.on('open', () => { clearTimeout(timeout); resolve(); });
        connection.on('error', () => { clearTimeout(timeout); reject(new Error('Could not join this room.')); });
    });
}

export const socket = {
    id: crypto.randomUUID(),
    connected: false,
    setMode(value) { if (!code) mode = value === 'online' ? 'online' : 'local'; },
    on(event, handler) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
    },
    off(event, handler) { listeners.get(event)?.delete(handler); },
    connect() { this.connected = true; queueMicrotask(() => { if (this.connected) notify('connect'); }); },
    disconnect() { closeRoom(); this.connected = false; notify('disconnect'); },
    async emit(event, payload, callback = () => {}) {
        try {
            if (event === 'create_room') {
                closeRoom();
                const roomCode = crypto.randomUUID().slice(0, 8).toUpperCase();
                const authority = new GameManager();
                authority.createRoom(payload.vocabLists, roomCode);
                await openTransport(roomCode, true);
                manager = authority;
                const result = manager.joinRoom(code, 'Player 1', this.id);
                callback({ ...result, roomId: code }); publish(); return;
            }
            if (event === 'join_room') {
                closeRoom();
                if (!/^[A-Z0-9]{8}$/.test(payload.roomId)) throw new Error('Enter the eight-character room code.');
                await openTransport(payload.roomId, false);
            }
            if (!code) throw new Error('Create or join a room first.');
            if (host) { const result = execute(event, payload, this.id); callback(result); if (result.success) publish(); return; }
            const requestId = crypto.randomUUID();
            const timeout = setTimeout(() => {
                pending.delete(requestId);
                if (event === 'join_room') closeRoom();
                callback({ success: false, message: 'The host did not respond. Check the connection and room code.' });
            }, mode === 'local' ? 4000 : 12000);
            pending.set(requestId, { timeout, callback, event });
            send({ type: 'request', requestId, event, payload });
        } catch (error) {
            if (event === 'create_room' || event === 'join_room') closeRoom();
            callback({ success: false, message: error.message });
        }
    }
};
window.addEventListener('pagehide', () => socket.disconnect());

window.addEventListener('pageshow', () => { if (!socket.connected) socket.connect(); });
