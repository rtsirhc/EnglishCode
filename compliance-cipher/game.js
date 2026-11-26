import { gameRuntime } from '../gallery/shared/runtime.js';
import { read, write } from '../gallery/shared/storage.js';
import { roomTransport } from '../gallery/shared/room-transport.js';
import { CipherGame } from './engine.js';
import { challenges as authored } from './challenges.js';
const $ = selector => document.querySelector(selector);
const runtime = gameRuntime('compliance-cipher', 'words', {
    confirm: () => { if (!$('#play').hidden && !busy) $('#answer-form').requestSubmit(); },
    hint: () => { if (!$('#play').hidden && !busy) $('#hint').click(); }
});
const challenges = runtime.pack ? runtime.pack.items.map(item => ({
    word: item.word, clue: item.clue,
    hints: [item.translation || 'The key begins with ' + [...item.word][0] + '.', 'Key pattern: ' + [...item.word].map((letter, index) => index % 2 === 0 || !/[a-z0-9]/i.test(letter) ? letter : '_').join('')]
})) : authored;
const fingerprint = JSON.stringify(challenges);
const lessonTitle = runtime.pack?.title || 'Industrial sustainability escape room';
$('#lesson-title').textContent = lessonTitle;
let authority, transport, player, role, solo = false, busy = false;
let baselineTime = 0, ticker, hostTicker, qrScript, session = 0;
const requests = new Map();
function time(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    return Math.floor(total / 60) + 'm ' + String(total % 60).padStart(2, '0') + 's';
}
function notice(value) { $('#notice').textContent = value; }
function show(section) {
    for (const id of ['setup', 'teacher', 'play', 'victory']) $('#' + id).hidden = id !== section;
}
function persist() {
    if (solo && player && !write('progress:compliance-cipher', { fingerprint, state: authority.snapshot('solo') })) {
        $('#privacy').textContent = 'Storage is unavailable. You can play, but this session will not be saved.';
    }
}
function paintClock() {
    if (!player || player.finished || $('#play').hidden) return;
    $('#timer').textContent = time(player.elapsedSeconds + (performance.now() - baselineTime) / 1000 + player.penaltySeconds);
}
function render(result) {
    const previousLevel = player?.level;
    player = result.state;
    $('#lesson-title').textContent = result.lessonTitle || lessonTitle;
    baselineTime = performance.now();
    busy = false;
    $('#answer-form button').disabled = false; $('#hint').disabled = false;
    if (player.finished) {
        show('victory');
        $('#final-stats').textContent = player.name + ' completed ' + player.total + ' stages in ' + time(player.elapsedSeconds + player.penaltySeconds) + ', including ' + time(player.penaltySeconds) + ' in hint penalties.';
    } else {
        show('play');
        $('#team-display').textContent = player.name;
        $('#stage').textContent = 'Stage ' + (player.level + 1) + ' / ' + player.total;
        $('#progress').value = player.progress;
        $('#clue').textContent = player.clue;
        $('#hint-status').textContent = 'Hints used: ' + player.hintsUsed + ' / 2';
        $('#hint-text').textContent = player.hint;
        $('#feedback').textContent = result.error || '';
        if (previousLevel !== player.level) $('#passcode').value = '';
        paintClock();
    }
    persist();
}
function leaderboard() {
    const rows = authority.leaderboard();
    $('#leaderboard').replaceChildren();
    if (!rows.length) $('#leaderboard').textContent = 'Waiting for teams to join.';
    for (const team of rows) {
        const card = document.createElement('article'); card.className = 'panel';
        const name = document.createElement('h3'); name.className = 'font-bold text-emerald-300'; name.textContent = team.name;
        const score = document.createElement('p');
        score.textContent = team.progress + '% completed · ' + time(team.elapsedSeconds + team.penaltySeconds) + ' · ' + (team.finished ? 'Finished' : team.connected ? 'Playing' : 'Disconnected');
        const bar = document.createElement('progress'); bar.max = 100; bar.value = team.progress; bar.className = 'mt-3 w-full'; bar.setAttribute('aria-label', team.name + ' progress');
        card.append(name, score, bar); $('#leaderboard').append(card);
    }
}
function receive(message, sender) {
    if (role === 'teacher') {
        if (message.type === 'participant-left') { authority.disconnect(sender); leaderboard(); return; }
        if (message.type !== 'command' || typeof message.requestId !== 'string') return;
        try {
            const result = message.action === 'join'
                ? { state: authority.join(sender, typeof message.name === 'string' && message.name.trim() ? message.name : 'Team') }
                : authority.command(sender, message.action, message.payload);
            transport.send({ type: 'result', requestId: message.requestId, ...result, lessonTitle }, sender);
            leaderboard();
        } catch (error) { transport.send({ type: 'failure', requestId: message.requestId, error: error.message }, sender); }
    } else {
        const request = requests.get(message.requestId);
        if (!request) return;
        clearTimeout(request.timer); requests.delete(message.requestId);
        message.type === 'failure' ? request.reject(new Error(message.error)) : request.resolve(message);
    }
}
function qrLibrary() {
    if (typeof window.QRCode === 'function') return Promise.resolve();
    if (qrScript) return qrScript;
    qrScript = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL('./qrcode.js', location.href).href;
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => {
            qrScript = null;
            script.remove();
            reject(new Error('QR library could not load.'));
        }, { once: true });
        document.head.append(script);
    });
    return qrScript;
}
function request(action, payload = {}) {
    return new Promise((resolve, reject) => {
        const requestId = crypto.randomUUID();
        const timer = setTimeout(() => { requests.delete(requestId); reject(new Error('The host did not respond. Check your room code and connection.')); }, 12000);
        requests.set(requestId, { resolve, reject, timer });
        transport.send({ type: 'command', requestId, action, payload, name: $('#team-name').value });
    });
}
async function command(action) {
    if (busy || !player) return;
    const currentSession = session;
    busy = true; $('#answer-form button').disabled = true; $('#hint').disabled = true;
    try {
        const payload = { level: player.level, passcode: $('#passcode').value };
        const result = solo ? authority.command('solo', action, payload) : await request(action, payload);
        if (currentSession === session) render(result);
    } catch (error) { if (currentSession !== session) return; busy = false; $('#answer-form button').disabled = false; $('#hint').disabled = false; notice(error.message); }
}
function leave() {
    persist();
    session++;
    transport?.close(); transport = null;
    clearInterval(ticker); clearInterval(hostTicker);
    for (const request of requests.values()) { clearTimeout(request.timer); request.reject(new Error('Room closed.')); }
    requests.clear();
    authority = null; player = null; busy = false;
    $('#leave').hidden = true; $('#start').disabled = false; show('setup');
}
function roleChanged() {
    const selected = $('#role').value;
    $('#room-options').hidden = selected === 'solo';
    $('#resume-note').hidden = selected !== 'solo';
    $('#room-label').hidden = selected !== 'team';
    $('#name-label').hidden = selected === 'teacher';
    $('#mode-help').textContent = $('#mode').value === 'local' ? 'Open all team screens in tabs of this browser. This mode works offline after download.' : 'The host and each team need internet. Keep the host screen open.';
}
$('#role').addEventListener('change', roleChanged);
$('#mode').addEventListener('change', roleChanged);
$('#start').addEventListener('click', async () => {
    const currentSession = session;
    $('#start').disabled = true; notice('');
    role = $('#role').value; solo = role === 'solo';
    try {
        const name = $('#team-name').value.trim();
        if (role !== 'teacher' && !name) throw new Error('Enter a team name or alias.');
        if (solo) {
            authority = new CipherGame(challenges);
            const previous = read('progress:compliance-cipher', null);
            render({ state: authority.join('solo', name, previous?.fingerprint === fingerprint ? previous.state : null) });
        } else {
            const code = role === 'teacher' ? crypto.randomUUID().slice(0, 8).toUpperCase() : $('#room-code').value.trim().toUpperCase();
            if (!/^[A-Z0-9]{8}$/.test(code)) throw new Error('Enter the eight-character room code.');
            let id;
            if (role === 'team') {
                try { id = sessionStorage.getItem('englishcode:cipher:' + code) || crypto.randomUUID(); sessionStorage.setItem('englishcode:cipher:' + code, id); } catch {}
            }
            if (role === 'teacher') authority = new CipherGame(challenges);
            const connection = await roomTransport({
                namespace: 'cipher', code, host: role === 'teacher', mode: $('#mode').value, id,
                receive: (message, sender) => { if (currentSession === session) receive(message, sender); },
                disconnected: () => {
                    if (currentSession !== session) return;
                    leave();
                    notice('The host connection closed. You can start a solo game or join another room.');
                }
            });
            if (currentSession !== session) { connection.close(); return; }
            transport = connection;
            if (role === 'team') {
                try { sessionStorage.setItem('englishcode:cipher:' + code, transport.id); sessionStorage.setItem('englishcode:cipher-name:' + code, name); } catch {}
            }
            if (role === 'teacher') {
                show('teacher'); $('#share-code').textContent = code;
                const link = new URL(location.href); link.search = new URLSearchParams({ room: code, mode: $('#mode').value }).toString();
                $('#join-link').href = link; $('#join-link').textContent = link;
                $('#share-help').textContent = $('#mode').value === 'local' ? 'Open this link in another tab of this browser.' : 'Share this link or QR code with each team.';
                $('#qrcode').replaceChildren();
                try { await qrLibrary(); new window.QRCode($('#qrcode'), { text: String(link), width: 144, height: 144 }); } catch { $('#qrcode').textContent = 'Use the join link.'; }
                leaderboard(); hostTicker = setInterval(leaderboard, 1000);
            } else {
                const result = await request('join');
                if (currentSession !== session) return;
                render(result);
            }
        }
        if (currentSession !== session) return;
        $('#leave').hidden = false;
        ticker = setInterval(paintClock, 250);
    } catch (error) { if (currentSession === session) { leave(); notice(error.message); } }
    finally { if (currentSession === session) $('#start').disabled = false; }
});
$('#answer-form').addEventListener('submit', event => { event.preventDefault(); command('submit'); });
$('#hint').addEventListener('click', () => command('hint'));
$('#replay').addEventListener('click', () => command('restart'));
$('#leave').addEventListener('click', leave);
$('#copy-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#join-link').href); notice('Join link copied.'); }
    catch { notice('Select the join link and copy it with your browser.'); }
});
window.addEventListener('pagehide', persist);
window.addEventListener('pageshow', event => {
    if (event.persisted) {
        solo = false;
        leave();
        notice('Choose Start to reopen this screen after navigation.');
    }
});
const parameters = new URLSearchParams(location.search);
if (parameters.has('room')) {
    $('#role').value = 'team';
    $('#room-code').value = parameters.get('room');
    $('#mode').value = parameters.get('mode') === 'online' ? 'online' : 'local';
    try {
        const previousName = sessionStorage.getItem('englishcode:cipher-name:' + parameters.get('room'));
        if (previousName) $('#team-name').value = previousName;
    } catch {}
}
const saved = read('progress:compliance-cipher', null);
if (saved?.fingerprint === fingerprint) {
    $('#resume-note').textContent = 'Your last solo mission will resume in this browser.';
    if ($('#role').value === 'solo' && typeof saved.state?.name === 'string') $('#team-name').value = saved.state.name;
}
roleChanged();
