import { roomTransport } from '../../../gallery/shared/room-transport.js';
import { gameRuntime } from '../../../gallery/shared/runtime.js';
import { createSession } from './session.js';

function click(id) {
    const button = document.getElementById(id);
    if (button && !button.disabled) button.click();
}
const { pack } = gameRuntime('sentence-showdown', 'sentences', {
    buzzer: () => click('showdown-buzzer'),
    confirm: () => click('showdown-confirm'),
    next: () => click('showdown-next')
});
const listeners = new Map();
const pending = new Map();
let link, session, state, hostId;
const publish = snapshot => {
    state = snapshot;
    listeners.get('game_state')?.(snapshot);
};
function broadcast() {
    publish(session.snapshot());
    for (const [id, key] of session.members) link.send({ type: 'state', state: session.snapshot(key) }, id);
}
function close() {
    session?.close();
    link?.close();
    link = session = state = hostId = null;
    for (const finish of pending.values()) finish({ success: false, error: 'Connection closed.' });
}
function request(message, callback) {
    const id = crypto.randomUUID();
    const finish = result => {
        clearTimeout(timer);
        pending.delete(id);
        callback(result);
    };
    const timer = setTimeout(() => finish({ success: false, error: 'Room did not respond. Check the room code and connection mode.' }), 6000);
    pending.set(id, finish);
    link.send({ ...message, id });
}
async function create({ mode, custom }, callback) {
    const roomCode = crypto.randomUUID().slice(0, 8).toUpperCase();
    try {
        link = await roomTransport({
            namespace: 'showdown', code: roomCode, mode, host: true,
            receive(message, sender) {
                let result;
                if (message.type === 'join') result = session.join(sender, message.name);
                if (message.type === 'command' && session.members.has(sender)) {
                    result = session.command(session.members.get(sender), message.event, message.data ?? {});
                }
                if (message.type === 'participant-left') session.leave(sender);
                if (!result) return;
                if (message.id) link.send({ type: 'reply', id: message.id, result }, sender);
                if (result.success) broadcast();
            }
        });
        session = createSession(roomCode, broadcast, custom ? pack : null);
        callback({ success: true, roomCode });
        broadcast();
    } catch (error) {
        close();
        callback({ success: false, error: error.message });
    }
}
async function join({ roomCode, mode, playerName }, callback) {
    if (!/^[0-9A-F]{8}$/.test(roomCode)) {
        callback({ success: false, error: 'Enter the eight-character room code.' });
        return;
    }
    try {
        link = await roomTransport({
            namespace: 'showdown', code: roomCode, mode, host: false,
            receive(message, sender) {
                if (hostId && hostId !== sender) return;
                if (message.type === 'reply' && pending.has(message.id)) {
                    if (message.result?.success) hostId = sender;
                    pending.get(message.id)(message.result);
                } else if (message.type === 'state' && hostId === sender) publish(message.state);
            },
            disconnected() {
                const joined = Boolean(hostId);
                close();
                if (joined) listeners.get('host_disconnected')?.();
            }
        });
        request({ type: 'join', name: playerName }, result => {
            if (!result.success) close();
            callback(result);
        });
    } catch (error) {
        close();
        callback({ success: false, error: error.message });
    }
}
export default {
    pack, close,
    on(event, listener) { listeners.set(event, listener); },
    off(event) { listeners.delete(event); },
    emit(event, data, callback) {
        if (event === 'create_room') return create(data, callback);
        if (event === 'join_room') return join(data, callback);
        if (session) {
            const result = session.command(null, event, data);
            if (result.success) broadcast();
            callback?.(result);
        } else if (link && state) {
            const command = { type: 'command', event, data: { ...data, turn: state.turn } };
            if (callback) request(command, callback);
            else link.send(command);
        }
    }
};
