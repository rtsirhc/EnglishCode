import { roomTransport } from '../../gallery/shared/room-transport.js';
import { bindGameControls } from '../../gallery/shared/runtime.js';
import { GAME_DATA } from './game-data.js';
import { SoundManager } from './sound.js';

const $ = id => document.getElementById(id);
const main = $('main-container');
const params = new URLSearchParams(location.search);
let link, host, team, receivedAt, pending, clock, disposeControls, selectedMode = params.get('mode') === 'online' ? 'online' : 'local';
const time = ms => Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0');

function button(text, event, classes = 'btn btn--large btn--full', attributes = '') {
  return `<button type="button" class="${classes}" data-event="${event}" ${attributes}>${text}</button>`;
}
function letters(values, total) {
  const scrambled = [...values];
  for (let i = scrambled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
  }
  return `<div class="collected-letters">${Array.from({ length: total }, (_, i) =>
    `<div class="letter-slot">${scrambled[i] ?? '·'}</div>`).join('')}</div>`;
}
function controls(actions) {
  disposeControls?.();
  disposeControls = bindGameControls('escape-planet-earth', Object.fromEntries(Object.entries(actions).map(([key, event]) => [
    key, () => main.querySelector(event)?.click()
  ])));
}
function command(event, value) {
  if (!link || !team || pending) return;
  pending = setTimeout(() => {
    pending = null;
    $('connection-status').textContent = 'The teacher did not respond. Check the room connection and try again.';
  }, 6000);
  link.send({ type: 'command', event, data: { value, revision: team.revision } });
}
function renderJoin(error = '') {
  clearTimeout(pending); pending = null;
  clearInterval(clock); clock = null;
  $('timer-bar').classList.add('hidden');
  $('connection-status').textContent = '';
  main.innerHTML = `<form class="join-screen fade-in" id="join-form">
    <h2>🌍 Join the Escape Room</h2>
    <div class="form-group"><label for="room-code-input">Room code</label><input id="room-code-input" class="input-field" maxlength="8" required autocomplete="off"></div>
    <div class="form-group"><label for="team-name-input">Team name</label><input id="team-name-input" class="input-field" maxlength="20" required></div>
    <div class="form-group"><label for="mode">Connection</label><select id="mode" class="input-field"><option value="local">Same browser · multiple tabs</option><option value="online">Separate devices · internet</option></select></div>
    <button class="btn btn--full btn--large" id="join-btn">Join Game</button>
    <p id="join-error" class="join-error" role="status"></p>
  </form>`;
  $('room-code-input').value = params.get('code') ?? '';
  $('mode').value = selectedMode;
  $('join-error').textContent = error;
  $('join-form').onsubmit = event => { event.preventDefault(); join(); };
  controls({ confirm: '#join-btn' });
}

async function join() {
  const code = $('room-code-input').value.trim().toUpperCase();
  const name = $('team-name-input').value.trim();
  if (!/^[0-9A-F]{8}$/.test(code) || !name) {
    $('join-error').textContent = 'Enter an eight-character room code and a team name.';
    return;
  }
  selectedMode = $('mode').value;
  $('join-btn').disabled = true;
  $('join-error').textContent = 'Joining…';
  try {
    link = await roomTransport({
      namespace: 'escape-earth', code, mode: selectedMode, host: false,
      receive(message, sender) {
        if (host && sender !== host) return;
        if (message.type === 'state') {
          host = sender;
          clearTimeout(pending); pending = null;
          $('connection-status').textContent = '';
          const first = team?.phase !== message.state.phase;
          team = message.state;
          receivedAt = Date.now();
          render();
          if (first && team.phase === 'finished') play('celebrate');
        } else if (message.type === 'join-error' && !team) close(message.error);
      },
      disconnected() { close('The teacher closed this room.'); }
    });
    pending = setTimeout(() => close('Room unavailable. Check the room code and connection mode.'), 5000);
    link.send({ type: 'join', name });
  } catch (error) { close(error.message); }
}
function close(error) {
  link?.close();
  host = link = team = null;
  renderJoin(error);
}
function play(effect) {
  try { SoundManager[effect](); } catch { /* Audio is optional. */ }
}
function timer() {
  const current = team.elapsed + (team.finishedAt === null ? Math.max(0, Date.now() - receivedAt) : 0);
  $('timer-time').textContent = time(current + team.penalty);
  $('timer-penalty').classList.toggle('hidden', !team.penalty);
  $('timer-penalty').textContent = '+' + time(team.penalty) + ' penalty';
}
function hintPanel() {
  const count = team.hints[team.room];
  return `<div class="hint-section">
    ${button(count === 0 ? 'Hint · +1 min' : count === 1 ? 'Hint · +5 min' : 'No hints left', 'hint', 'btn btn--hint', count >= 2 ? 'disabled' : '')}
    ${team.hint ? `<p class="hint-text" role="status">${team.hint}</p>` : ''}
  </div>`;
}
function codeForm(final) {
  return `<form id="code-form" class="code-entry mt-3">
    <label for="code-input">${final ? 'Final escape code' : 'Door code'}</label>
    <input id="code-input" class="code-input" maxlength="${final ? 6 : 5}" autocomplete="off" required>
    <button class="btn btn--large btn--full mt-2" id="unlock-btn">${final ? 'Escape! 🚀' : 'Unlock Door'}</button>
    ${team.feedback?.correct === false ? '<p class="join-error" role="status">Incorrect code. Check your letters and try again.</p>' : ''}
  </form>`;
}
function render() {
  const { phase, room: index } = team;
  const room = GAME_DATA.rooms[index];
  const actions = {};
  $('timer-bar').classList.toggle('hidden', phase === 'waiting' || phase === 'finished');
  if (phase !== 'waiting' && phase !== 'finished') {
    $('timer-room').textContent = phase === 'final' ? 'Final Escape' : `Room ${index + 1}/5`;
    timer();
    clock ??= setInterval(timer, 1000);
  } else {
    clearInterval(clock); clock = null;
  }
  if (phase === 'waiting') {
    main.innerHTML = '<section class="waiting-screen"><h2>Waiting for Teacher</h2><p class="waiting-team-name"></p></section>';
    main.querySelector('.waiting-team-name').textContent = team.name;
  } else if (phase === 'story') {
    main.innerHTML = `<section class="story-screen"><h1>${GAME_DATA.title}</h1><p class="story-text">${GAME_DATA.story}</p>${button('Start Room 1', 'begin')}</section>`;
    actions.next = '[data-event=begin]';
  } else if (phase === 'question') {
    const q = room.questions[team.question];
    const display = q.type === 'multiple-choice' ? q.options : ['True', 'False'];
    main.innerHTML = `<header class="room-header"><span class="room-icon">${room.icon}</span><h2>${room.name}</h2><p>${room.topic}</p></header>
      <div class="card question-card"><p class="question-number">Question ${team.question + 1} of ${room.questions.length}</p><p class="question-text">${q.text}</p>
      <div class="options-list">${display.map((option, i) => button(option, 'answer', 'option-item', `data-choice="${i}"`)).join('')}</div></div>
      ${letters(team.letters, 5)}${hintPanel()}${button('Restart from Room 1', 'restart', 'btn btn--danger')}`;
    display.forEach((_, i) => { actions['answer' + (i + 1)] = `[data-choice="${i}"]`; });
    if (team.hints[index] < 2) actions.hint = '[data-event=hint]';
  } else if (phase === 'letter') {
    main.innerHTML = `<div class="letter-reveal"><span class="letter-char">${team.feedback.letter}</span><p class="explanation">${team.feedback.text}</p></div>
      ${letters(team.letters, 5)}${button('Continue →', 'continue')}`;
    actions.next = '[data-event=continue]';
  } else if (phase === 'code') {
    main.innerHTML = `<header class="room-header"><h2>Unlock the Door</h2><p>Unscramble your collected letters.</p></header>
      ${letters(team.letters, 5)}${codeForm(false)}${hintPanel()}${button('Retry This Room', 'retry', 'btn mt-2')}`;
    actions.confirm = '#unlock-btn';
    if (team.hints[index] < 2) actions.hint = '[data-event=hint]';
  } else if (phase === 'unlocked') {
    main.innerHTML = `<div class="room-complete"><h2>Door Unlocked! 🔓</h2><p class="code-word">${room.codeWord}</p>
      <p>${room.finalLetterInstruction}</p>${letters(team.finalLetters, team.finalLetters.length)}
      ${button(index < 4 ? 'Next Room →' : 'Final Escape 🚀', 'continue')}</div>`;
    actions.next = '[data-event=continue]';
  } else if (phase === 'final') {
    main.innerHTML = `<div class="final-escape"><h2>${GAME_DATA.finalEscape.title}</h2><p>${GAME_DATA.finalEscape.instructions}</p>
      ${letters(team.finalLetters, 6)}${codeForm(true)}${button('Restart from Room 1', 'restart', 'btn btn--danger mt-2')}</div>`;
    actions.confirm = '#unlock-btn';
  } else {
    main.innerHTML = `<div class="celebration-screen"><span class="trophy">🏆</span><h1>ESCAPED!</h1><p>${GAME_DATA.finalEscape.celebration}</p>
      <div class="final-time">${time(team.elapsed + team.penalty)}</div><p>Hint penalty: ${time(team.penalty)}</p></div>`;
  }
  main.onclick = event => {
    const clicked = event.target.closest('[data-event]');
    if (!clicked) return;
    const action = clicked.dataset.event;
    if (action === 'restart' && !confirm('Return to Room 1? The timer and penalties keep running.')) return;
    const value = Number(clicked.dataset.choice);
    const q = room.questions[team.question];
    command(action, q?.type === 'true-false' ? value === 0 : value);
  };
  if ($('code-form')) $('code-form').onsubmit = event => {
    event.preventDefault();
    command(phase === 'final' ? 'escape' : 'unlock', $('code-input').value);
  };
  controls(actions);
}
$('sound-toggle').onclick = () => {
  const enabled = SoundManager.toggle();
  $('sound-toggle').textContent = enabled ? '🔊' : '🔇';
  $('sound-toggle').setAttribute('aria-pressed', String(enabled));
};
window.addEventListener('pagehide', () => { clearInterval(clock); clearTimeout(pending); });
renderJoin();
