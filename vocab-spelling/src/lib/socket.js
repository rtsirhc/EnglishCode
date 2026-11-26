import { roomTransport } from '../../../gallery/shared/room-transport.js';
import { gameRuntime } from '../../../gallery/shared/runtime.js';
import { read, write } from '../../../gallery/shared/storage.js';
import { createSession } from './session.js';

function click(id) {
  const button = document.getElementById(id);
  if (button && !button.disabled) button.click();
}
const { pack } = gameRuntime('vocab-spelling', 'words', {
  confirm: () => click('spelling-confirm'),
  next: () => click('spelling-next'),
  answer1: () => click('double-accept'),
  answer2: () => click('double-decline')
});
const listeners = new Map();
let link, session, student, host, timer;
function dispatch(event, value) { listeners.get(event)?.(value); }
function records(total) {
  const entries = read('scores:vocab-spelling', []);
  if (!Array.isArray(entries)) return [];
  return entries.filter(row => row?.total === total && Number.isFinite(row.time) &&
    Number.isFinite(row.money) && Number.isFinite(row.accuracy) && typeof row.date === 'string');
}
function broadcast() {
  dispatch('game_state_update', session.snapshot('Teacher'));
  if (student) link.send({ type: 'state', state: session.snapshot('Student') }, student);
}

export const socket = {
  pack,
  on(event, listener) { listeners.set(event, listener); },
  off(event, listener) { if (listeners.get(event) === listener) listeners.delete(event); },
  disconnect() {
    clearTimeout(timer);
    link?.close();
    link = session = student = host = null;
    dispatch('disconnect');
  },
  async join(code, role, mode, custom, onJoined) {
    const isHost = role === 'Teacher';
    let accept, reject;
    const joined = new Promise((resolve, fail) => { accept = resolve; reject = fail; });
    let initial;
    try {
      link = await roomTransport({
        namespace: 'spelling-bet', code, mode, host: isHost,
        receive(message, sender) {
          if (isHost) {
            if (message.type === 'join') {
              if (!student || student === sender) {
                student = sender;
                session.setStudent(true);
                broadcast();
              } else link.send({ type: 'full' }, sender);
            } else if (sender === student && message.type === 'participant-left') {
              student = null;
              session.setStudent(false);
              broadcast();
            } else if (sender === student && message.type === 'command' &&
                session.command('Student', message.event, message.data ?? {})) broadcast();
          } else if (message.type === 'state' && (!host || host === sender)) {
            if (host) dispatch('game_state_update', message.state);
            else {
              host = sender;
              initial = message.state;
              accept();
            }
          } else if (message.type === 'full' && !host) reject(new Error('This room already has a student screen.'));
        },
        disconnected() {
          if (!host) reject(new Error('The teacher closed this room.'));
          socket.disconnect();
        }
      });
      if (isHost) {
        session = createSession(custom ? pack : null, (state, total) => {
          const key = 'scores:vocab-spelling';
          const saved = read(key, []);
          const entry = {
            room: code, total, time: state.finalTime, rawTime: state.elapsedTime,
            penalty: state.timePenalty, money: state.money, date: new Date().toISOString(),
            accuracy: Math.round((state.wordsCompleted - state.reviewList.length) * 100 / state.wordsCompleted)
          };
          write(key, [...(Array.isArray(saved) ? saved : []), entry].slice(-100));
        });
        initial = session.snapshot('Teacher');
      } else {
        timer = setTimeout(() => reject(new Error('Room not found. Check the code and connection mode.')), 5000);
        link.send({ type: 'join' });
        await joined;
        clearTimeout(timer);
      }
      onJoined(code, role);
      dispatch('connect');
      dispatch('game_state_update', initial);
    } catch (error) {
      socket.disconnect();
      throw error;
    }
  },
  emit(event, data) {
    if (event === 'get_leaderboard') {
      data(records(session?.snapshot('Teacher').totalWords).sort((a, b) => a.time - b.time).slice(0, 20));
    } else if (session) {
      if (session.command('Teacher', event, data)) broadcast();
    } else link?.send({ type: 'command', event, data });
  }
};
