import { roomTransport } from '../../gallery/shared/room-transport.js';
import { gameRuntime } from '../../gallery/shared/runtime.js';
import { createSession } from './session.js';

function click(ids) {
  for (const id of ids) {
    const button = document.getElementById(id);
    if (button && !button.disabled) { button.click(); return; }
  }
}
const { pack } = gameRuntime('transformation-taboo', 'sentences', {
  next: () => click(['student-next-btn','student-next-after-incorrect-btn','student-next-card-btn','student-next-card-after-success-btn','student-next-card-after-timeout-btn','teacher-next-btn','teacher-continue-btn','teacher-advance-game2-btn']),
  confirm: () => click(['student-reveal-btn','teacher-guess-btn','teacher-start-game1-btn']),
  answer1: () => click(['teacher-correct-btn']), answer2: () => click(['teacher-incorrect-btn'])
});
let link, session, latest, handshake;
const listeners = new Map();
function publish(name, value) {
  if (name === 'state_update') latest = value;
  for (const fn of listeners.get(name) ?? []) fn(value);
}
const socket = {
  pack, connected: false,
  on(name, fn) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(fn);
    if (name === 'state_update' && latest) fn(latest);
  },
  off(name, fn) { if (fn) listeners.get(name)?.delete(fn); else listeners.delete(name); },
  emit(event, data) {
    if (session) session.command('teacher', event, data);
    else link?.send({ type: 'command', event, data });
  },
  close() {
    clearTimeout(handshake);
    session?.close();
    session = null;
    link?.close();
    link = null;
    latest = null;
    this.connected = false;
  },
  async open(as, code, mode) {
    this.close();
    const host = as === 'teacher';
    function changed() {
      publish('state_update', session.snapshot('teacher'));
      link.send({ type: 'snapshot', state: session.snapshot('student') });
    }
    let acknowledge, fail;
    const ready = new Promise((resolve, reject) => { acknowledge = resolve; fail = reject; });
    try {
      link = await roomTransport({ namespace: 'taboo', code, mode, host,
        receive(message, sender) {
          if (host && session && message.type === 'join') {
            link.send({ type: 'snapshot', state: session.snapshot('student') }, sender);
          } else if (host && session && message.type === 'command') {
            session.command('student', message.event, message.data ?? {});
          } else if (!host && message.type === 'snapshot') {
            publish('state_update', message.state);
            acknowledge();
          }
        },
        disconnected() {
          socket.connected = false;
          publish('disconnect');
          fail(new Error('The teacher closed this room.'));
        }
      });
      if (host) {
        session = createSession(changed, pack);
        changed();
      } else {
        handshake = setTimeout(() => fail(new Error('Room not found. Check the code and connection mode.')), 5000);
        link.send({ type: 'join' });
        await ready;
        clearTimeout(handshake);
      }
      this.connected = true;
    } catch (error) { this.close(); throw error; }
  }
};
export default socket;
