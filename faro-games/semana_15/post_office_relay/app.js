import { MAIL_REVIEW, MAIL_CHALLENGES } from './bank.js';

const STORAGE_KEY = 'englishcode:post-office-relay:v1';
const $ = (id) => document.getElementById(id);

let audioCtx = null;
function beep(freq = 540, dur = 0.12, type = 'sine') {
  if (!state.sound) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = 0.12;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch {}
}

const fresh = () => ({
  screen: 'setup', level: 'A2', teamCount: 5, speakersPerTeam: 5, goal: 12,
  huddleSeconds: 15, sound: true, teams: [], activeTeam: 0, speakerTurn: 1,
  round: 1, currentCard: null, usedIndices: [], revealed: false
});

let state = fresh();
let timerId = null;
let timeLeft = 15;

const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} };
const load = () => { try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return d?.teams?.length >= 2 ? d : null; } catch { return null; } };
const stopTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

function pickCard() {
  const pool = MAIL_CHALLENGES[state.level] || MAIL_CHALLENGES.A2;
  let avail = pool.map((_, i) => i).filter((i) => !state.usedIndices.includes(i));
  if (!avail.length) { state.usedIndices = []; avail = pool.map((_, i) => i); }
  const idx = avail[Math.floor(Math.random() * avail.length)];
  state.usedIndices.push(idx);
  return pool[idx];
}

function startRace() {
  stopTimer();
  state = {
    ...fresh(),
    screen: 'play',
    level: $('opt-level').value,
    teamCount: Number($('opt-teams').value),
    speakersPerTeam: Number($('opt-speakers').value),
    goal: Number($('opt-goal').value),
    sound: state.sound,
    teams: Array.from({ length: Number($('opt-teams').value) }, (_, i) => ({ name: `Truck ${i + 1}`, miles: 0, driven: [] }))
  };
  state.currentCard = pickCard();
  timeLeft = state.huddleSeconds;
  save();
  render();
}

function verdict(kind) {
  stopTimer();
  const t = state.teams[state.activeTeam];
  const sp = state.speakerTurn;
  if (kind === 'clean') {
    t.miles += 2;
    if (!t.driven.includes(sp)) t.driven.push(sp);
    beep(820, 0.14);
  } else if (kind === 'echo') {
    t.miles += 1;
    if (!t.driven.includes(sp)) t.driven.push(sp);
    beep(580, 0.12);
  } else {
    beep(230, 0.2, 'sawtooth');
  }

  // Full crew lap bonus: +2 extra miles when all drivers have spoken!
  if (t.driven.length >= state.speakersPerTeam) {
    t.miles += 2;
    t.driven = [];
    beep(980, 0.25, 'triangle');
  }

  if (t.miles >= state.goal) {
    state.screen = 'podium';
    save();
    render();
    return;
  }

  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  if (state.activeTeam === 0) state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1;
  state.round += 1;
  state.revealed = false;
  state.currentCard = pickCard();
  timeLeft = state.huddleSeconds;
  save();
  render();
}

function toggleTimer() {
  const btn = $('btn-timer');
  if (timerId) { stopTimer(); btn.textContent = 'Resume'; return; }
  if (timeLeft <= 0) timeLeft = state.huddleSeconds;
  btn.textContent = 'Pause';
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimer();
    if (timeLeft <= 3 && timeLeft > 0) beep(520, 0.06);
    if (timeLeft <= 0) { stopTimer(); beep(880, 0.25, 'triangle'); btn.textContent = 'Speak Now!'; }
  }, 1000);
}

function updateTimer() {
  $('timer-display').textContent = `${Math.max(0, timeLeft)}s`;
  $('timer-display').parentElement.classList.toggle('urgent', timeLeft <= 3);
}

const VAN_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0d9488'];
function vanSVG(color, num) {
  return `<svg class="van-svg" viewBox="0 0 68 40" aria-hidden="true">
    <rect x="4" y="6" width="38" height="24" rx="4" fill="${color}" stroke="#fff" stroke-width="2"/>
    <path d="M42 13 H56 L64 22 V30 H42 Z" fill="#f8fafc" stroke="#111827" stroke-width="2"/>
    <path d="M45 16 H54 L59 22 H45 Z" fill="#38bdf8"/>
    <circle cx="17" cy="31" r="6" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="53" cy="31" r="6" fill="#0f172a" stroke="#e2e8f0" stroke-width="2"/>
    <text x="23" y="23" fill="#fff" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">${num}</text>
  </svg>`;
}

function renderTrack() {
  const el = $('track'); el.innerHTML = '';
  state.teams.forEach((t, idx) => {
    const lane = document.createElement('div');
    lane.className = 'lane' + (idx === state.activeTeam ? ' active' : '');
    lane.addEventListener('click', () => { state.activeTeam = idx; save(); render(); });

    const info = document.createElement('div'); info.className = 'lane-info';
    const name = document.createElement('span'); name.className = 'lane-name'; name.textContent = t.name;
    const dots = document.createElement('div'); dots.className = 'crew-dots';
    for (let s = 1; s <= state.speakersPerTeam; s += 1) {
      const d = document.createElement('span');
      d.className = 'c-dot' + (t.driven.includes(s) ? ' done' : '') + (idx === state.activeTeam && s === state.speakerTurn ? ' now' : '');
      d.textContent = `${s}`;
      dots.append(d);
    }
    info.append(name, dots);

    const road = document.createElement('div'); road.className = 'road';
    const fill = document.createElement('div'); fill.className = 'road-fill';
    const pct = Math.min(97, Math.max(14, Math.round((t.miles / state.goal) * 97)));
    fill.style.width = `${pct}%`;
    fill.innerHTML = vanSVG(VAN_COLORS[idx % VAN_COLORS.length], idx + 1);
    road.append(fill);

    const miles = document.createElement('div'); miles.className = 'lane-miles';
    miles.textContent = `${t.miles}/${state.goal} mi`;

    lane.append(info, road, miles);
    el.append(lane);
  });
}

function render() {
  $('screen-setup').hidden = state.screen !== 'setup';
  $('screen-play').hidden = state.screen !== 'play';
  $('screen-podium').hidden = state.screen !== 'podium';
  $('btn-finish').hidden = state.screen !== 'play';
  $('btn-reset').hidden = state.screen === 'setup';
  $('btn-sound').textContent = `Sound: ${state.sound ? 'ON' : 'OFF'}`;

  if (state.screen === 'setup') {
    const s = load();
    $('btn-resume').hidden = !s || s.screen !== 'play';
    return;
  }
  if (state.screen === 'podium') {
    const sorted = [...state.teams].sort((a, b) => b.miles - a.miles);
    $('podium-summary').textContent = `Race finished after ${state.round} stops at level ${state.level}.`;
    const ul = $('podium-list'); ul.innerHTML = '';
    sorted.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'podium-row' + (i === 0 ? ' first' : '');
      const a = document.createElement('span'); a.textContent = `#${i + 1} · ${t.name}`;
      const b = document.createElement('span'); b.textContent = `${t.miles} miles`;
      li.append(a, b); ul.append(li);
    });
    return;
  }

  renderTrack();
  const t = state.teams[state.activeTeam];
  const c = state.currentCard || pickCard();
  $('active-team').textContent = t.name;
  $('active-speaker').textContent = `DRIVER #${state.speakerTurn}`;
  $('round-num').textContent = `${state.round} (${state.level})`;
  $('ch-cat').textContent = c.cat;
  $('ch-prompt').textContent = c.prompt;
  $('ch-frame').hidden = !c.frame;
  $('ch-frame').textContent = c.frame ? `Frame: ${c.frame}` : '';
  $('ch-answer-box').hidden = !state.revealed;
  $('ch-answer').textContent = c.answer;
  $('ch-tip').textContent = c.tip || '';
  $('btn-reveal').textContent = state.revealed ? 'Hide Model (R)' : 'Reveal Model (R)';
  $('btn-timer').textContent = timerId ? 'Pause' : 'Start Huddle';
  updateTimer();
}

$('btn-start').addEventListener('click', startRace);
$('btn-resume').addEventListener('click', () => { const s = load(); if (s) { state = s; timeLeft = state.huddleSeconds; render(); } });
$('btn-again').addEventListener('click', () => { state.screen = 'setup'; save(); render(); });
$('btn-reset').addEventListener('click', () => { stopTimer(); state.screen = 'setup'; save(); render(); });
$('btn-finish').addEventListener('click', () => { stopTimer(); state.screen = 'podium'; save(); render(); });
$('btn-sound').addEventListener('click', () => { state.sound = !state.sound; save(); render(); });
$('btn-full').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}));
$('btn-switch-speaker').addEventListener('click', () => { state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1; save(); render(); });
$('btn-timer').addEventListener('click', toggleTimer);
$('btn-reveal').addEventListener('click', () => { state.revealed = !state.revealed; render(); });
$('btn-clean').addEventListener('click', () => verdict('clean'));
$('btn-echo').addEventListener('click', () => verdict('echo'));
$('btn-miss').addEventListener('click', () => verdict('miss'));

$('btn-review').addEventListener('click', () => {
  const g = $('review-grid'); g.innerHTML = '';
  MAIL_REVIEW.forEach((item) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'review-card';
    const w = document.createElement('strong'); w.textContent = item.word;
    const s = document.createElement('span'); s.textContent = `${item.es} — tap for phrase`;
    b.append(w, s);
    b.addEventListener('click', () => { const o = b.classList.toggle('revealed'); s.textContent = o ? `"${item.phrase}"` : `${item.es} — tap for phrase`; });
    g.append(b);
  });
  $('review-dialog').showModal();
});
$('btn-close-review').addEventListener('click', () => $('review-dialog').close());

document.addEventListener('keydown', (e) => {
  if ($('review-dialog').open || state.screen !== 'play') return;
  if (e.key.toLowerCase() === 'r') $('btn-reveal').click();
  if (e.key === '1') $('btn-clean').click();
  if (e.key === '2') $('btn-echo').click();
  if (e.key === '3') $('btn-miss').click();
  if (e.key === ' ') { e.preventDefault(); toggleTimer(); }
});

render();
