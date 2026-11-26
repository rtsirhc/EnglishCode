import { BANK_REVIEW, BANK_CHALLENGES } from './bank.js';

const STORAGE_KEY = 'englishcode:bank-vault-heist:v1';
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
  } catch { /* ignore */ }
}

const fresh = () => ({
  screen: 'setup', level: 'A2', teamCount: 5, speakersPerTeam: 5, huddleSeconds: 15,
  sound: true, teams: [], activeTeam: 0, speakerTurn: 1, round: 1,
  phase: 'bid', currentStake: 400, currentCard: null, usedIndices: [], revealed: false
});

let state = fresh();
let timerId = null;
let timeLeft = 15;

const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} };
const load = () => { try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return d?.teams?.length >= 2 ? d : null; } catch { return null; } };
const stopTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

function pickCard() {
  const pool = BANK_CHALLENGES[state.level] || BANK_CHALLENGES.A2;
  let avail = pool.map((_, i) => i).filter((i) => !state.usedIndices.includes(i));
  if (!avail.length) { state.usedIndices = []; avail = pool.map((_, i) => i); }
  const idx = avail[Math.floor(Math.random() * avail.length)];
  state.usedIndices.push(idx);
  return pool[idx];
}

function startGame() {
  stopTimer();
  state = {
    ...fresh(),
    screen: 'play',
    level: $('opt-level').value,
    teamCount: Number($('opt-teams').value),
    speakersPerTeam: Number($('opt-speakers').value),
    huddleSeconds: Number($('opt-timer').value),
    sound: state.sound,
    teams: Array.from({ length: Number($('opt-teams').value) }, (_, i) => ({ name: `Team ${i + 1}`, money: 1000, locks: [] }))
  };
  nextBid();
  save();
  render();
}

function nextBid() {
  stopTimer();
  state.phase = 'bid';
  state.revealed = false;
  state.currentCard = pickCard();
  timeLeft = state.huddleSeconds;
}

function chooseBid(raw) {
  const t = state.teams[state.activeTeam];
  state.currentStake = raw === 'all' ? Math.max(200, Math.round(t.money * 0.5)) : Number(raw);
  state.phase = 'play';
  state.revealed = false;
  timeLeft = state.huddleSeconds;
  beep(620, 0.09);
  save();
  render();
}

function verdict(kind) {
  stopTimer();
  const t = state.teams[state.activeTeam];
  const sp = state.speakerTurn;
  if (kind === 'clean') {
    t.money += state.currentStake;
    if (!t.locks.includes(sp)) t.locks.push(sp);
    beep(820, 0.14);
  } else if (kind === 'echo') {
    t.money += Math.round(state.currentStake * 0.5);
    if (!t.locks.includes(sp)) t.locks.push(sp);
    beep(580, 0.12);
  } else {
    t.money = Math.max(0, t.money - Math.round(state.currentStake * 0.5));
    beep(230, 0.2, 'sawtooth');
  }

  if (t.locks.length >= state.speakersPerTeam) {
    t.money += 1000;
    t.locks = [];
    beep(980, 0.25, 'triangle');
  }

  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  if (state.activeTeam === 0) state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1;
  state.round += 1;
  nextBid();
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
  const el = $('scoreboard');
  el.innerHTML = '';
  state.teams.forEach((t, idx) => {
    const card = document.createElement('div');
    card.className = 'team-card' + (idx === state.activeTeam ? ' active' : '');
    card.addEventListener('click', () => { if (state.phase === 'bid') { state.activeTeam = idx; save(); render(); } });
    const top = document.createElement('div'); top.className = 'team-top';
    const n = document.createElement('span'); n.className = 'team-name'; n.textContent = t.name;
    const m = document.createElement('span'); m.className = 'team-money'; m.textContent = `$${t.money}`;
    top.append(n, m);

    const locks = document.createElement('div'); locks.className = 'locks';
    for (let s = 1; s <= state.speakersPerTeam; s += 1) {
      const l = document.createElement('span');
      l.className = 'lock' + (t.locks.includes(s) ? ' open' : '') + (idx === state.activeTeam && s === state.speakerTurn ? ' now' : '');
      l.textContent = t.locks.includes(s) ? '✓' : `${s}`;
      locks.append(l);
    }
    const sub = document.createElement('div'); sub.className = 'team-sub';
    sub.textContent = `Locks: ${t.locks.length}/${state.speakersPerTeam} (+$1,000 Jackpot)`;
    card.append(top, locks, sub);
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
    const sorted = [...state.teams].sort((a, b) => b.money - a.money);
    $('podium-summary').textContent = `Completed ${state.round - 1} bank rounds at level ${state.level}.`;
    const ul = $('podium-list'); ul.innerHTML = '';
    sorted.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'podium-row' + (i === 0 ? ' first' : '');
      const a = document.createElement('span'); a.textContent = `#${i + 1} · ${t.name}`;
      const b = document.createElement('span'); b.textContent = `$${t.money}`;
      li.append(a, b); ul.append(li);
    });
    return;
  }

  renderBoard();
  const t = state.teams[state.activeTeam];
  $('active-team').textContent = t.name;
  $('active-speaker').textContent = `SPEAKER #${state.speakerTurn}`;
  $('round-num').textContent = `${state.round} (${state.level})`;

  $('phase-bid').hidden = state.phase !== 'bid';
  $('phase-play').hidden = state.phase !== 'play';

  const c = state.currentCard || pickCard();
  if (state.phase === 'bid') {
    $('bid-cat').textContent = `VAULT: ${c.cat}`;
    $('bid-title').textContent = `${t.name} — Bid for Speaker #${state.speakerTurn}!`;
    $('bid-lock-num').textContent = `${state.speakerTurn}`;
  } else {
    $('ch-cat').textContent = c.cat;
    $('ch-stake').textContent = `$${state.currentStake}`;
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

$('btn-start').addEventListener('click', startGame);
$('btn-resume').addEventListener('click', () => { const s = load(); if (s) { state = s; timeLeft = state.huddleSeconds; render(); } });
$('btn-again').addEventListener('click', () => { state.screen = 'setup'; save(); render(); });
$('btn-reset').addEventListener('click', () => { stopTimer(); state.screen = 'setup'; save(); render(); });
$('btn-finish').addEventListener('click', () => { stopTimer(); state.screen = 'podium'; save(); render(); });
$('btn-sound').addEventListener('click', () => { state.sound = !state.sound; save(); render(); });
$('btn-full').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}));
$('btn-switch-speaker').addEventListener('click', () => { state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1; save(); render(); });
$('bid-buttons').addEventListener('click', (e) => { const b = e.target.closest('[data-bid]'); if (b) chooseBid(b.dataset.bid); });
$('btn-timer').addEventListener('click', toggleTimer);
$('btn-reveal').addEventListener('click', () => { state.revealed = !state.revealed; render(); });
$('btn-clean').addEventListener('click', () => verdict('clean'));
$('btn-echo').addEventListener('click', () => verdict('echo'));
$('btn-miss').addEventListener('click', () => verdict('miss'));

$('btn-review').addEventListener('click', () => {
  const g = $('review-grid'); g.innerHTML = '';
  BANK_REVIEW.forEach((item) => {
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
  if ($('review-dialog').open || state.screen !== 'play' || state.phase !== 'play') return;
  if (e.key.toLowerCase() === 'r') $('btn-reveal').click();
  if (e.key === '1') $('btn-clean').click();
  if (e.key === '2') $('btn-echo').click();
  if (e.key === '3') $('btn-miss').click();
  if (e.key === ' ') { e.preventDefault(); toggleTimer(); }
});

render();
