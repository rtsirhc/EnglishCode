import { roomTransport } from '/gallery/shared/room-transport.js';

const namespace = 'clinic-rally';
let loadingPeer;
function loadPeer() {
  if (window.Peer) return Promise.resolve(window.Peer);
  loadingPeer ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/grammar-rush/local/vendor/peerjs.min.js';
    script.onload = () => window.Peer ? resolve(window.Peer) : reject(new Error('Could not load room networking.'));
    script.onerror = () => reject(new Error('Could not load room networking.'));
    document.head.append(script);
  }).catch(error => { loadingPeer = null; throw error; });
  return loadingPeer;
}

export async function hostRoom(game, engine, changed) {
  let room;
  function publish() {
    const state = engine.snapshot();
    changed(state);
    room?.send({ type: 'state', state });
  }
  room = await roomTransport({
    namespace, code: game.code, mode: game.connection, host: true, id: 'host', loadPeer,
    receive(message, sender) {
      if (message.type === 'participant-left') {
        if (engine.leave(sender)) publish();
        return;
      }
      if (message.type !== 'request' || typeof message.id !== 'string') return;
      if (engine.tick()) publish();
      const before = game.revision;
      try {
        const result = engine.request(message.route, message.body ?? {}, sender);
        room.send({ type: 'response', id: message.id, result }, sender);
      } catch (error) {
        room.send({ type: 'response', id: message.id, error: error.message, status: error.status }, sender);
      }
      if (before !== game.revision) publish();
    },
  });
  const interval = setInterval(() => { if (engine.tick()) publish(); }, 250);
  return {
    publish,
    close() {
      clearInterval(interval);
      room.close();
    },
  };
}

export async function joinRoom(code, mode, changed, disconnected) {
  const waiting = new Map();
  function rejectWaiting() {
    for (const { reject, timer } of waiting.values()) {
      clearTimeout(timer);
      reject(new Error('Room connection closed.'));
    }
    waiting.clear();
  }
  const room = await roomTransport({
    namespace, code, mode, host: false, loadPeer,
    disconnected: () => { rejectWaiting(); disconnected(); },
    receive(message, sender) {
      if (sender !== (mode === 'local' ? 'host' : `englishcode-${namespace}-${code}`)) return;
      if (message.type === 'state') changed(message.state);
      if (message.type !== 'response') return;
      const request = waiting.get(message.id);
      if (!request) return;
      waiting.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(Object.assign(new Error(message.error), { status: message.status }));
      else request.resolve(message.result);
    },
  });
  async function request(route, body) {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        waiting.delete(id);
        reject(new Error('Room did not respond. Check that the teacher screen is open.'));
      }, 5000);
      waiting.set(id, { resolve, reject, timer });
      room.send({ type: 'request', id, route, body });
    });
  }
  return { request, close() { rejectWaiting(); room.close(); } };
}
