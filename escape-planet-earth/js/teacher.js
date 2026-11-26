import { roomTransport } from '../../gallery/shared/room-transport.js';
import { bindGameControls } from '../../gallery/shared/runtime.js';
import { createEscapeSession } from './session.js';

const $ = id => document.getElementById(id);
let link, game, clock;
const time = ms => Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0');

function render() {
  const teams = game.leaderboard();
  $('teams-count').textContent = String(teams.length);
  $('start-btn').disabled = !teams.length;
  $('waiting-teams-list').replaceChildren(...teams.map(team => {
    const row = document.createElement('p');
    row.className = 'team-row';
    row.textContent = team.name;
    return row;
  }));
  $('active-teams-count').textContent = String(teams.length);
  $('leaderboard').replaceChildren(...teams.map((team, index) => {
    const row = document.createElement('div');
    row.className = 'team-row ' + (team.finished ? 'finished' : 'active');
    row.innerHTML = `<div class="team-rank">#${index + 1}</div><div class="team-name"></div>
      <div class="team-progress-wrap"><progress max="100" value="${team.progress}"></progress> ${team.progress}%</div>
      <div class="team-room-badge">${team.finished ? 'ESCAPED!' : 'Room ' + team.room}</div>
      <div class="team-time">${time(team.elapsed + team.penalty)}</div>`;
    row.querySelector('.team-name').textContent = team.name;
    return row;
  }));
}

function sendState(id) {
  link.send({ type: 'state', state: game.snapshot(id) }, id);
}

$('create-room').onclick = async () => {
  const mode = $('mode').value;
  const code = crypto.randomUUID().slice(0, 8).toUpperCase();
  $('create-room').disabled = true;
  $('room-status').textContent = 'Opening room…';
  try {
    game = createEscapeSession();
    link = await roomTransport({
      namespace: 'escape-earth', code, mode, host: true,
      receive(message, sender) {
        if (message.type === 'join') {
          if (game.join(sender, message.name)) sendState(sender);
          else link.send({ type: 'join-error', error: 'Use a different team name or check whether the room is full.' }, sender);
        } else if (message.type === 'participant-left') {
          if (game.teams.get(sender)?.phase !== 'finished') game.leave(sender);
        } else if (message.type === 'command' && game.teams.has(sender)) {
          game.command(sender, message.event, message.data ?? {});
          sendState(sender);
        }
        render();
      }
    });
    const url = new URL('game.html', location.href);
    url.search = new URLSearchParams({ code, mode });
    $('room-code-display').textContent = code;
    const join = $('join-url');
    join.href = url.href;
    join.textContent = 'Open team screen';
    $('qr-container').replaceChildren();
    try { new window.QRCode($('qr-container'), { text: url.href, width: 164, height: 164 }); }
    catch { $('qr-container').textContent = 'Use the team link or room code to join.'; }
    $('join-guidance').textContent = mode === 'local' ? 'Open the team link in another tab in this browser.' : 'Scan the QR code or open the team link on each device.';
    $('room-create-panel').classList.add('hidden');
    $('setup-section').classList.remove('hidden');
    render();
  } catch (error) {
    link?.close();
    $('room-status').textContent = error.message;
    $('create-room').disabled = false;
  }
};

$('start-btn').onclick = () => {
  if (!game.start()) return;
  $('setup-section').classList.add('hidden');
  $('game-section').classList.remove('hidden');
  for (const id of game.teams.keys()) sendState(id);
  render();
  clock = setInterval(render, 1000);
};

$('new-game').onclick = () => {
  if (!confirm('Close this room and set up a new game?')) return;
  clearInterval(clock);
  link.close();
  $('game-section').classList.add('hidden');
  $('room-create-panel').classList.remove('hidden');
  $('create-room').disabled = false;
  $('room-status').textContent = '';
};
window.addEventListener('pagehide', () => clearInterval(clock));
bindGameControls('escape-planet-earth', { confirm: () => {
  if (!$('setup-section').classList.contains('hidden')) $('start-btn').click();
  else if (!$('room-create-panel').classList.contains('hidden')) $('create-room').click();
} });
