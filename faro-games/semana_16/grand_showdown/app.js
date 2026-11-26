import { SHOWDOWN_BANK } from './bank.js';

const STORAGE_KEY = 'englishcode:faro-grand-showdown:v1';
const $ = (id) => document.getElementById(id);

let audioCtx = null;
function beep(freq = 540, dur = 0.11, type = 'sine') {
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
  screen: 'setup', level: 'A2', teamCount: 5, speakersPerTeam: 5, huddleSeconds: 15,
  sound: true, teams: [], activeTeam: 0, speakerTurn: 1, round: 1,
  phase: 'spin', spun: false, currentStake: 250, currentCard: null, usedIndices: [], revealed: false
});

let state = fresh();
let timerId = null;
let timeLeft = 15;
let spinning = false;

const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} };
const load = () => { try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return d?.teams?.length >= 2 ? d : null; } catch { return null; } };
const stopTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

function pickCard() {
  const pool = SHOWDOWN_BANK[state.level] || SHOWDOWN_BANK.A2;
  let avail = pool.map((_, i) => i).filter((i) => !state.usedIndices.includes(i));
  if (!avail.length) { state.usedIndices = []; avail = pool.map((_, i) => i); }
  const idx = avail[Math.floor(Math.random() * avail.length)];
  state.usedIndices.push(idx);
  return pool[idx];
}

function startCup() {
  stopTimer();
  state = {
    ...fresh(),
    screen: 'play',
    level: $('opt-level').value,
    teamCount: Number($('opt-teams').value),
    speakersPerTeam: Number($('opt-speakers').value),
    huddleSeconds: Number($('opt-timer').value),
    sound: state.sound,
    teams: Array.from({ length: Number($('opt-teams').value) }, (_, i) => ({ name: `Team ${i + 1}`, score: 300, spoken: [] }))
  };
  save();
  render();
}

let wheelAngle = 0;
function spinWheel() {
  if (spinning) return;
  spinning = true;
  const pool = SHOWDOWN_BANK[state.level] || SHOWDOWN_BANK.A2;
  const chosen = pickCard();
  wheelAngle += 1080 + Math.floor(Math.random() * 360);
  const svg = $('wheel-svg');
  if (svg) svg.style.transform = `rotate(${wheelAngle}deg)`;
  let ticks = 0;
  const spinTimer = setInterval(() => {
    const sample = pool[ticks % pool.length];
    $('wheel-place').textContent = sample.place.toUpperCase();
    beep(400 + (ticks * 30), 0.04);
    ticks += 1;
    if (ticks >= 14) {
      clearInterval(spinTimer);
      spinning = false;
      state.currentCard = chosen;
      state.spun = true;
      beep(880, 0.16, 'triangle');
      save();
      render();
    }
  }, 105);
}

function chooseBet(raw) {
  state.currentStake = Number(raw);
  state.phase = 'play';
  state.revealed = false;
  timeLeft = state.huddleSeconds;
  beep(640, 0.1);
  save();
  render();
}

function verdict(kind) {
  stopTimer();
  const t = state.teams[state.activeTeam];
  const sp = state.speakerTurn;
  if (kind === 'clean') {
    t.score += state.currentStake;
    if (!t.spoken.includes(sp)) t.spoken.push(sp);
    beep(840, 0.15);
  } else if (kind === 'echo') {
    t.score += Math.round(state.currentStake * 0.5);
    if (!t.spoken.includes(sp)) t.spoken.push(sp);
    beep(580, 0.12);
  } else {
    t.score = Math.max(0, t.score - Math.round(state.currentStake * 0.5));
    beep(230, 0.2, 'sawtooth');
  }

  if (t.spoken.length >= state.speakersPerTeam) {
    t.score += 400;
    t.spoken = [];
    beep(980, 0.25, 'triangle');
  }

  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  if (state.activeTeam === 0) state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1;
  state.round += 1;
  state.phase = 'spin';
  state.spun = false;
  state.currentCard = null;
  state.revealed = false;
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

function renderBoard() {
  const el = $('scoreboard'); el.innerHTML = '';
  state.teams.forEach((t, idx) => {
    const card = document.createElement('div');
    card.className = 'team-card' + (idx === state.activeTeam ? ' active' : '');
    card.addEventListener('click', () => { if (state.phase === 'spin') { state.activeTeam = idx; save(); render(); } });
    const top = document.createElement('div'); top.className = 'team-top';
    const n = document.createElement('span'); n.className = 'team-name'; n.textContent = t.name;
    const sc = document.createElement('span'); sc.className = 'team-score'; sc.textContent = `${t.score}`;
    top.append(n, sc);

    const dots = document.createElement('div'); dots.className = 'dots';
    for (let s = 1; s <= state.speakersPerTeam; s += 1) {
      const d = document.createElement('span');
      d.className = 'dot' + (t.spoken.includes(s) ? ' done' : '') + (idx === state.activeTeam && s === state.speakerTurn ? ' now' : '');
      d.textContent = `${s}`;
      dots.append(d);
    }
    const sub = document.createElement('div'); sub.className = 'team-sub';
    sub.textContent = `Crew: ${t.spoken.length}/${state.speakersPerTeam} (+400 bonus)`;
    card.append(top, dots, sub);
    el.append(card);
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
    const sorted = [...state.teams].sort((a, b) => b.score - a.score);
    $('podium-summary').textContent = `Semester Finale completed (${state.round - 1} rounds, level ${state.level}).`;
    const ul = $('podium-list'); ul.innerHTML = '';
    sorted.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'podium-row' + (i === 0 ? ' first' : '');
      const a = document.createElement('span'); a.textContent = `#${i + 1} · ${t.name}`;
      const b = document.createElement('span'); b.textContent = `${t.score} pts`;
      li.append(a, b); ul.append(li);
    });
    return;
  }

  renderBoard();
  const t = state.teams[state.activeTeam];
  $('active-team').textContent = t.name;
  $('active-speaker').textContent = `SPEAKER #${state.speakerTurn}`;
  $('round-num').textContent = `${state.round} (${state.level})`;

  $('phase-spin').hidden = state.phase !== 'spin';
  $('phase-play').hidden = state.phase !== 'play';

  if (state.phase === 'spin') {
    $('wheel-place').textContent = state.spun && state.currentCard ? state.currentCard.place.toUpperCase() : 'PRESS SPIN!';
    $('btn-spin').hidden = state.spun;
    $('bet-row').hidden = !state.spun;
    $('bet-who').textContent = `${t.name} · Speaker #${state.speakerTurn}`;
  } else {
    const c = state.currentCard || pickCard();
    $('ch-place').textContent = c.place;
    $('ch-stake').textContent = `${state.currentStake} PTS`;
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
}

$('btn-start').addEventListener('click', startCup);
$('btn-resume').addEventListener('click', () => { const s = load(); if (s) { state = s; timeLeft = state.huddleSeconds; render(); } });
$('btn-again').addEventListener('click', () => { state.screen = 'setup'; save(); render(); });
$('btn-reset').addEventListener('click', () => { stopTimer(); state.screen = 'setup'; save(); render(); });
$('btn-finish').addEventListener('click', () => { stopTimer(); state.screen = 'podium'; save(); render(); });
$('btn-sound').addEventListener('click', () => { state.sound = !state.sound; save(); render(); });
$('btn-full').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}));
$('btn-switch-speaker').addEventListener('click', () => { state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1; save(); render(); });
$('btn-spin').addEventListener('click', spinWheel);
$('bet-buttons').addEventListener('click', (e) => { const b = e.target.closest('[data-bet]'); if (b) chooseBet(b.dataset.bet); });
$('btn-timer').addEventListener('click', toggleTimer);
$('btn-reveal').addEventListener('click', () => { state.revealed = !state.revealed; render(); });
$('btn-clean').addEventListener('click', () => verdict('clean'));
$('btn-echo').addEventListener('click', () => verdict('echo'));
$('btn-miss').addEventListener('click', () => verdict('miss'));

document.addEventListener('keydown', (e) => {
  if (state.screen !== 'play' || state.phase !== 'play') return;
  if (e.key.toLowerCase() === 'r') $('btn-reveal').click();
  if (e.key === '1') $('btn-clean').click();
  if (e.key === '2') $('btn-echo').click();
  if (e.key === '3') $('btn-miss').click();
  if (e.key === ' ') { e.preventDefault(); toggleTimer(); }
});

render();
