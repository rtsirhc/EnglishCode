import { REVIEW_CARDS, VISUALS, CHALLENGES } from './bank.js';

const STORAGE_KEY = 'englishcode:optician-sprint:v1';
const $ = (id) => document.getElementById(id);

let audioCtx = null;
function beep(freq = 520, dur = 0.11, type = 'sine') {
  if (!state.sound) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch { /* ignore audio errors */ }
}

const defaultState = () => ({
  screen: 'setup',
  level: 'A2',
  teamCount: 5,
  speakersPerTeam: 5,
  huddleSeconds: 15,
  sound: true,
  teams: [],
  activeTeam: 0,
  speakerTurn: 1,
  round: 1,
  phase: 'bet',
  currentStake: 200,
  currentCard: null,
  usedIndices: [],
  revealed: false
});

let state = defaultState();
let timerId = null;
let timeLeft = 15;

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.teams) && parsed.teams.length >= 2) return parsed;
  } catch { /* ignore */ }
  return null;
}

function stopTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
}

function pickCard() {
  const pool = CHALLENGES[state.level] || CHALLENGES.A2;
  let available = pool.map((_, idx) => idx).filter((idx) => !state.usedIndices.includes(idx));
  if (!available.length) {
    state.usedIndices = [];
    available = pool.map((_, idx) => idx);
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  state.usedIndices.push(idx);
  return pool[idx];
}

function startNewGame() {
  stopTimer();
  const level = $('opt-level').value;
  const teamCount = Number($('opt-teams').value);
  const speakersPerTeam = Number($('opt-speakers').value);
  const huddleSeconds = Number($('opt-timer').value);

  state = {
    ...defaultState(),
    screen: 'play',
    level,
    teamCount,
    speakersPerTeam,
    huddleSeconds,
    sound: state.sound,
    teams: Array.from({ length: teamCount }, (_, i) => ({
      name: `Team ${i + 1}`,
      score: 500,
      spoken: []
    })),
    activeTeam: 0,
    speakerTurn: 1,
    round: 1,
    phase: 'bet',
    currentCard: null
  };
  prepareBetPhase();
  saveState();
  render();
}

function prepareBetPhase() {
  stopTimer();
  state.phase = 'bet';
  state.revealed = false;
  state.currentCard = pickCard();
  timeLeft = state.huddleSeconds;
}

function chooseBet(raw) {
  const team = state.teams[state.activeTeam];
  let stake = 200;
  if (raw === 'all') {
    stake = Math.max(200, team.score);
  } else {
    stake = Number(raw);
  }
  state.currentStake = stake;
  state.phase = 'challenge';
  state.revealed = false;
  timeLeft = state.huddleSeconds;
  beep(640, 0.09);
  saveState();
  render();
}

function applyVerdict(kind) {
  stopTimer();
  const team = state.teams[state.activeTeam];
  const sp = state.speakerTurn;

  if (kind === 'clean') {
    team.score += state.currentStake;
    if (!team.spoken.includes(sp)) team.spoken.push(sp);
    beep(780, 0.14);
  } else if (kind === 'echo') {
    team.score += Math.round(state.currentStake * 0.5);
    if (!team.spoken.includes(sp)) team.spoken.push(sp);
    beep(560, 0.12);
  } else {
    team.score = Math.max(0, team.score - Math.round(state.currentStake * 0.5));
    beep(240, 0.2, 'sawtooth');
  }

  if (team.spoken.length >= state.speakersPerTeam) {
    team.score += 300;
    team.spoken = [];
  }

  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  if (state.activeTeam === 0) {
    state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1;
  }
  state.round += 1;
  prepareBetPhase();
  saveState();
  render();
}

function toggleTimer() {
  const btn = $('btn-timer-toggle');
  if (timerId) {
    stopTimer();
    btn.textContent = 'Resume Huddle';
    return;
  }
  if (timeLeft <= 0) timeLeft = state.huddleSeconds;
  btn.textContent = 'Pause';
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerUI();
    if (timeLeft <= 3 && timeLeft > 0) beep(500, 0.06);
    if (timeLeft <= 0) {
      stopTimer();
      beep(880, 0.25, 'triangle');
      btn.textContent = 'Speak Now!';
    }
  }, 1000);
}

function updateTimerUI() {
  const display = $('timer-display');
  const box = display.parentElement;
  display.textContent = `${Math.max(0, timeLeft)}s`;
  box.classList.toggle('urgent', timeLeft <= 3);
}

function renderScoreboard() {
  const board = $('scoreboard');
  board.innerHTML = '';
  state.teams.forEach((team, idx) => {
    const card = document.createElement('div');
    card.className = 'team-card' + (idx === state.activeTeam ? ' active' : '');
    card.title = 'Click to select this team';
    card.addEventListener('click', () => {
      if (state.phase === 'bet') {
        state.activeTeam = idx;
        saveState();
        render();
      }
    });

    const top = document.createElement('div');
    top.className = 'team-top';
    const nameEl = document.createElement('span');
    nameEl.className = 'team-name';
    nameEl.textContent = team.name;
    const scoreEl = document.createElement('span');
    scoreEl.className = 'team-score';
    scoreEl.textContent = `${team.score}`;
    top.append(nameEl, scoreEl);

    const dots = document.createElement('div');
    dots.className = 'speaker-dots';
    for (let s = 1; s <= state.speakersPerTeam; s += 1) {
      const dot = document.createElement('span');
      dot.className = 's-dot';
      if (team.spoken.includes(s)) dot.classList.add('done');
      if (idx === state.activeTeam && s === state.speakerTurn) dot.classList.add('now');
      dot.textContent = `${s}`;
      dots.append(dot);
    }

    const meta = document.createElement('div');
    meta.className = 'team-meta';
    meta.textContent = `Crew: ${team.spoken.length}/${state.speakersPerTeam} (+300 bonus)`;

    card.append(top, dots, meta);
    board.append(card);
  });
}

function renderPodium() {
  const sorted = [...state.teams].sort((a, b) => b.score - a.score);
  $('podium-summary').textContent = `Completed ${state.round - 1} speaking rounds at level ${state.level}.`;
  const list = $('podium-list');
  list.innerHTML = '';
  sorted.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = 'podium-row' + (idx === 0 ? ' first' : '');
    const left = document.createElement('span');
    left.textContent = `#${idx + 1} · ${t.name}`;
    const right = document.createElement('span');
    right.textContent = `${t.score} pts`;
    li.append(left, right);
    list.append(li);
  });
}

function render() {
  $('screen-setup').hidden = state.screen !== 'setup';
  $('screen-play').hidden = state.screen !== 'play';
  $('screen-podium').hidden = state.screen !== 'podium';
  $('btn-finish').hidden = state.screen !== 'play';
  $('btn-reset').hidden = state.screen === 'setup';
  $('btn-sound').textContent = `Sound: ${state.sound ? 'ON' : 'OFF'}`;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));

  if (state.screen === 'setup') {
    const saved = loadState();
    $('btn-resume').hidden = !saved || saved.screen !== 'play';
    return;
  }

  if (state.screen === 'podium') {
    renderPodium();
    return;
  }

  renderScoreboard();
  const team = state.teams[state.activeTeam];
  $('active-team-name').textContent = team.name;
  $('active-speaker-num').textContent = `SPEAKER #${state.speakerTurn}`;
  $('round-counter').textContent = `${state.round} (${state.level})`;

  $('phase-bet').hidden = state.phase !== 'bet';
  $('phase-challenge').hidden = state.phase !== 'challenge';

  const card = state.currentCard || pickCard();
  if (state.phase === 'bet') {
    $('bet-category').textContent = `NEXT CATEGORY: ${card.cat}`;
    $('bet-teaser').textContent = `${team.name} — How much do you bet on Speaker #${state.speakerTurn}?`;
  } else {
    $('ch-category').textContent = card.cat;
    $('ch-stake').textContent = `STAKE: ${state.currentStake} PTS`;
    $('ch-prompt').textContent = card.prompt;

    const vis = $('ch-visual');
    if (card.visual && VISUALS[card.visual]) {
      vis.hidden = false;
      vis.innerHTML = VISUALS[card.visual];
    } else {
      vis.hidden = true;
      vis.innerHTML = '';
    }

    const frame = $('ch-frame');
    if (card.frame) {
      frame.hidden = false;
      frame.textContent = `Frame: ${card.frame}`;
    } else {
      frame.hidden = true;
    }

    $('ch-answer-box').hidden = !state.revealed;
    $('ch-answer').textContent = card.answer;
    $('ch-tip').textContent = card.tip || '';
    $('btn-reveal').textContent = state.revealed ? 'Hide Model (R)' : 'Reveal Model (R)';
    $('btn-timer-toggle').textContent = timerId ? 'Pause' : 'Start Huddle';
    updateTimerUI();
  }
}

function buildReviewModal() {
  const grid = $('review-grid');
  grid.innerHTML = '';
  REVIEW_CARDS.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'review-card';
    const w = document.createElement('strong');
    w.textContent = item.word;
    const sub = document.createElement('span');
    sub.textContent = `${item.es} — tap for sentence`;
    btn.append(w, sub);
    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('revealed');
      sub.textContent = open ? `"${item.phrase}"` : `${item.es} — tap for sentence`;
    });
    grid.append(btn);
  });
}

$('btn-start').addEventListener('click', startNewGame);
$('btn-resume').addEventListener('click', () => {
  const saved = loadState();
  if (saved) { state = saved; timeLeft = state.huddleSeconds; render(); }
});
$('btn-play-again').addEventListener('click', () => { state.screen = 'setup'; saveState(); render(); });
$('btn-reset').addEventListener('click', () => { stopTimer(); state.screen = 'setup'; saveState(); render(); });
$('btn-finish').addEventListener('click', () => { stopTimer(); state.screen = 'podium'; saveState(); render(); });
$('btn-sound').addEventListener('click', () => { state.sound = !state.sound; saveState(); render(); });
$('btn-full').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
});
$('btn-next-speaker').addEventListener('click', () => {
  state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1;
  saveState();
  render();
});

$('bet-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-bet]');
  if (btn) chooseBet(btn.dataset.bet);
});

$('btn-timer-toggle').addEventListener('click', toggleTimer);
$('btn-reveal').addEventListener('click', () => { state.revealed = !state.revealed; render(); });
$('btn-clean').addEventListener('click', () => applyVerdict('clean'));
$('btn-echo').addEventListener('click', () => applyVerdict('echo'));
$('btn-miss').addEventListener('click', () => applyVerdict('miss'));

$('btn-review').addEventListener('click', () => { buildReviewModal(); $('review-dialog').showModal(); });
$('btn-close-review').addEventListener('click', () => $('review-dialog').close());

document.addEventListener('keydown', (e) => {
  if ($('review-dialog').open || state.screen !== 'play' || state.phase !== 'challenge') return;
  if (e.key.toLowerCase() === 'r') $('btn-reveal').click();
  if (e.key === '1') $('btn-clean').click();
  if (e.key === '2') $('btn-echo').click();
  if (e.key === '3') $('btn-miss').click();
  if (e.key === ' ') { e.preventDefault(); toggleTimer(); }
});

render();
