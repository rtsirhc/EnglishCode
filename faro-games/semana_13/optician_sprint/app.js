import { REVIEW_CARDS, BLURRY_ROUNDS, AB_ROUNDS, SNELLEN_ROUNDS } from './bank.js';

const STORAGE_KEY = 'englishcode:focus-lab-2020:v2';
const $ = (id) => document.getElementById(id);

let audioCtx = null;
function beep(freq = 540, dur = 0.09, type = 'sine') {
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

const BLUR_STEPS = [
  { px: 16, pts: 500, diopter: 'FOCUS 1/4 · -4.00 D (500 PTS)' },
  { px: 9,  pts: 350, diopter: 'FOCUS 2/4 · -2.50 D (350 PTS)' },
  { px: 4,  pts: 200, diopter: 'FOCUS 3/4 · -1.00 D (200 PTS)' },
  { px: 0,  pts: 100, diopter: 'FOCUS 4/4 · 20/20 CLEAR (100 PTS)' }
];

const MODE_ORDER = ['blurry', 'ab', 'snellen'];

const fresh = () => ({
  screen: 'setup',
  level: 'A2',
  teamCount: 5,
  speakersPerTeam: 5,
  sound: true,
  teams: [],
  round: 1,
  speakerTurn: 1,
  mode: 'blurry',
  blurryIdx: 0,
  abIdx: 0,
  snellenIdx: 0,
  blurStep: 0,
  revealed: false,
  snellenVisible: 1,
  abSpotlight: 0,
  scoredThisRound: []
});

let state = fresh();
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} };
const load = () => { try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return d?.teams?.length >= 2 ? d : null; } catch { return null; } };

function startExam() {
  const n = Number($('opt-teams').value);
  state = {
    ...fresh(),
    screen: 'play',
    level: $('opt-level').value,
    teamCount: n,
    speakersPerTeam: Number($('opt-speakers').value),
    sound: state.sound,
    teams: Array.from({ length: n }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }))
  };
  save();
  render();
}

function awardTeam(idx, pts, allowBonus = false) {
  const t = state.teams[idx];
  if (!t) return;
  const already = state.scoredThisRound.includes(idx);
  if (already && !allowBonus) return;
  const add = already ? 150 : pts;
  t.score += add;
  if (!already) state.scoredThisRound.push(idx);
  beep(already ? 920 : 760, 0.12, 'triangle');
  save();
  render(idx);
}

function nextRound(forcedMode = null) {
  if (forcedMode) {
    state.mode = forcedMode;
  } else {
    // Advance index of previous mode
    if (state.mode === 'blurry') state.blurryIdx = (state.blurryIdx + 1) % BLURRY_ROUNDS.length;
    if (state.mode === 'ab') state.abIdx = (state.abIdx + 1) % AB_ROUNDS.length;
    if (state.mode === 'snellen') state.snellenIdx = (state.snellenIdx + 1) % SNELLEN_ROUNDS.length;
    const nextIdx = (MODE_ORDER.indexOf(state.mode) + 1) % MODE_ORDER.length;
    state.mode = MODE_ORDER[nextIdx];
    state.round += 1;
    state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1;
  }
  state.blurStep = 0;
  state.revealed = false;
  state.snellenVisible = 1;
  state.abSpotlight = 0;
  state.scoredThisRound = [];
  beep(520, 0.08);
  save();
  render();
}

function renderTeams(flashIdx = -1) {
  const strip = $('teams-strip');
  strip.innerHTML = '';
  state.teams.forEach((t, idx) => {
    const pill = document.createElement('div');
    pill.className = 'team-pill' + (idx === flashIdx ? ' flash' : '');
    const n = document.createElement('span'); n.className = 't-name'; n.textContent = t.name;
    const s = document.createElement('span'); s.className = 't-score'; s.textContent = `${t.score}`;
    pill.append(n, s);
    strip.append(pill);
  });
}

function renderAwardGrid(containerId, pts, includeEcho = false, allowBonus = false) {
  const grid = $(containerId);
  grid.innerHTML = '';
  state.teams.forEach((t, idx) => {
    const scored = state.scoredThisRound.includes(idx);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-award' + (scored ? ' scored' : '');
    btn.textContent = scored ? (allowBonus ? `${t.name} ✓ (+150 Mic)` : `${t.name} ✓`) : `${t.name} (+${pts})`;
    btn.addEventListener('click', () => awardTeam(idx, pts, allowBonus));
    grid.append(btn);

    if (includeEcho && !scored) {
      const half = Math.round(pts * 0.5);
      const eb = document.createElement('button');
      eb.type = 'button';
      eb.className = 'btn-award echo';
      eb.textContent = `Echo +${half}`;
      eb.title = `${t.name} assisted echo`;
      eb.addEventListener('click', () => awardTeam(idx, half, false));
      grid.append(eb);
    }
  });
}

function render(flashIdx = -1) {
  $('screen-setup').hidden = state.screen !== 'setup';
  $('screen-play').hidden = state.screen !== 'play';
  $('screen-podium').hidden = state.screen !== 'podium';
  $('btn-finish').hidden = state.screen !== 'play';
  $('btn-reset').hidden = state.screen === 'setup';
  $('btn-sound').textContent = `Sound: ${state.sound ? 'ON' : 'OFF'}`;

  if (state.screen === 'setup') {
    const saved = load();
    $('btn-resume').hidden = !saved || saved.screen !== 'play';
    return;
  }

  if (state.screen === 'podium') {
    const sorted = [...state.teams].sort((a, b) => b.score - a.score);
    $('podium-summary').textContent = `Completed ${state.round} live eye-exam rounds at level ${state.level}.`;
    const list = $('podium-list'); list.innerHTML = '';
    sorted.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'podium-row' + (i === 0 ? ' first' : '');
      const a = document.createElement('span'); a.textContent = `#${i + 1} · ${t.name}`;
      const b = document.createElement('span'); b.textContent = `${t.score} pts`;
      li.append(a, b); list.append(li);
    });
    return;
  }

  renderTeams(flashIdx);
  $('speaker-badge').textContent = `SPEAKER #${state.speakerTurn}`;
  $('round-badge').textContent = `ROUND ${state.round} · ${state.level}`;

  $('stage-blurry').hidden = state.mode !== 'blurry';
  $('stage-ab').hidden = state.mode !== 'ab';
  $('stage-snellen').hidden = state.mode !== 'snellen';

  if (state.mode === 'blurry') {
    const item = BLURRY_ROUNDS[state.blurryIdx % BLURRY_ROUNDS.length];
    const step = BLUR_STEPS[Math.min(state.blurStep, BLUR_STEPS.length - 1)];
    $('mode-badge').textContent = 'MODE 1 · BLURRY VISION';
    $('points-badge').textContent = `PRIZE: ${step.pts} PTS`;
    $('blur-pts-inline').textContent = `${step.pts}`;
    $('blur-viewport').innerHTML = item.svg;
    $('blur-viewport').style.filter = `blur(${state.revealed ? 0 : step.px}px)`;
    $('diopter-tag').textContent = state.revealed ? '20/20 CRYSTAL CLEAR' : step.diopter;
    $('blur-question').textContent = item.question;
    $('blur-frame').hidden = state.level === 'B1';
    $('blur-frame').textContent = `Frame: ${item.frame}`;
    $('btn-sharpen').disabled = state.blurStep >= BLUR_STEPS.length - 1 || state.revealed;
    $('blur-answer-box').hidden = !state.revealed;
    $('blur-answer').textContent = item.answer;
    $('blur-tip').textContent = item.tip;
    renderAwardGrid('blur-award-grid', step.pts, true, false);
  } else if (state.mode === 'ab') {
    const item = AB_ROUNDS[state.abIdx % AB_ROUNDS.length];
    $('mode-badge').textContent = 'MODE 2 · BETTER 1 OR BETTER 2?';
    $('points-badge').textContent = 'VOTE: +200 · EXPLAIN: +150';
    $('lens-1-text').textContent = item.l1;
    $('lens-2-text').textContent = item.l2;

    const l1 = $('lens-1'), l2 = $('lens-2');
    l1.className = 'lens-card'; l2.className = 'lens-card';
    $('lens-1-status').textContent = '';
    $('lens-2-status').textContent = '';

    if (state.revealed) {
      l1.classList.add(item.correct === 1 ? 'correct' : 'wrong');
      l2.classList.add(item.correct === 2 ? 'correct' : 'wrong');
      $('lens-1-status').textContent = item.correct === 1 ? '✓ 20/20 CLEAR' : '✗ BLURRY ERROR';
      $('lens-2-status').textContent = item.correct === 2 ? '✓ 20/20 CLEAR' : '✗ BLURRY ERROR';
    } else if (state.abSpotlight === 1) {
      l1.classList.add('spotlight'); l2.classList.add('dimmed');
    } else if (state.abSpotlight === 2) {
      l2.classList.add('spotlight'); l1.classList.add('dimmed');
    }

    $('ab-explain-box').hidden = !state.revealed;
    $('ab-explain').textContent = item.explain;
    renderAwardGrid('ab-award-grid', 200, false, true);
  } else {
    const item = SNELLEN_ROUNDS[state.snellenIdx % SNELLEN_ROUNDS.length];
    $('mode-badge').textContent = 'MODE 3 · SNELLEN EYE CHART';
    $('points-badge').textContent = 'CLEAN READ: +300 PTS';
    $('snellen-task').textContent = item.task;
    $('snellen-hint').hidden = state.level === 'B1';
    $('snellen-hint').textContent = item.hint;
    const box = $('snellen-lines'); box.innerHTML = '';
    item.lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = `s-line s-line-${i}` + (i >= state.snellenVisible && !state.revealed ? ' hidden-line' : '');
      div.textContent = line;
      box.append(div);
    });
    $('btn-snellen-next-line').disabled = state.snellenVisible >= item.lines.length || state.revealed;
    $('snellen-answer-box').hidden = !state.revealed;
    $('snellen-answer').textContent = item.answer;
    $('snellen-tip').textContent = item.tip;
    renderAwardGrid('snellen-award-grid', 300, true, false);
  }
}

// Controls
$('btn-start').addEventListener('click', startExam);
$('btn-resume').addEventListener('click', () => { const s = load(); if (s) { state = s; render(); } });
$('btn-again').addEventListener('click', () => { state.screen = 'setup'; save(); render(); });
$('btn-reset').addEventListener('click', () => { state.screen = 'setup'; save(); render(); });
$('btn-finish').addEventListener('click', () => { state.screen = 'podium'; save(); render(); });
$('btn-sound').addEventListener('click', () => { state.sound = !state.sound; save(); render(); });
$('btn-full').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}));
$('btn-rot-speaker').addEventListener('click', () => { state.speakerTurn = (state.speakerTurn % state.speakersPerTeam) + 1; save(); render(); });

$('btn-sharpen').addEventListener('click', () => {
  if (state.blurStep < BLUR_STEPS.length - 1) {
    state.blurStep += 1;
    beep(380 + state.blurStep * 110, 0.08, 'square');
    save(); render();
  }
});
$('btn-blur-reveal').addEventListener('click', () => { state.revealed = !state.revealed; beep(780, 0.12); render(); });

$('btn-ab-flip').addEventListener('click', () => {
  state.abSpotlight = state.abSpotlight === 1 ? 2 : 1;
  beep(state.abSpotlight === 1 ? 480 : 620, 0.07);
  render();
});
$('lens-1').addEventListener('click', () => { if (!state.revealed) { state.abSpotlight = 1; beep(480, 0.07); render(); } });
$('lens-2').addEventListener('click', () => { if (!state.revealed) { state.abSpotlight = 2; beep(620, 0.07); render(); } });
$('btn-ab-reveal').addEventListener('click', () => { state.revealed = true; beep(840, 0.15, 'triangle'); render(); });

$('btn-snellen-next-line').addEventListener('click', () => {
  const item = SNELLEN_ROUNDS[state.snellenIdx % SNELLEN_ROUNDS.length];
  if (state.snellenVisible < item.lines.length) {
    state.snellenVisible += 1;
    beep(500 + state.snellenVisible * 80, 0.08);
    save(); render();
  }
});
$('btn-snellen-reveal').addEventListener('click', () => { state.revealed = !state.revealed; beep(780, 0.12); render(); });

$('btn-next-round').addEventListener('click', () => nextRound());
document.querySelectorAll('.mini-mode').forEach((b) => b.addEventListener('click', () => nextRound(b.dataset.mode)));

$('btn-review').addEventListener('click', () => {
  const g = $('review-grid'); g.innerHTML = '';
  REVIEW_CARDS.forEach((item) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'review-card';
    const w = document.createElement('strong'); w.textContent = item.word;
    const s = document.createElement('span'); s.textContent = `${item.es} — tap for sentence`;
    b.append(w, s);
    b.addEventListener('click', () => { const o = b.classList.toggle('revealed'); s.textContent = o ? `"${item.phrase}"` : `${item.es} — tap for sentence`; });
    g.append(b);
  });
  $('review-dialog').showModal();
});
$('btn-close-review').addEventListener('click', () => $('review-dialog').close());

document.addEventListener('keydown', (e) => {
  if ($('review-dialog').open || state.screen !== 'play') return;
  if (e.key === ' ') {
    e.preventDefault();
    if (state.mode === 'blurry') $('btn-sharpen').click();
    else if (state.mode === 'ab') $('btn-ab-flip').click();
    else $('btn-snellen-next-line').click();
  }
  if (e.key.toLowerCase() === 'r') {
    if (state.mode === 'blurry') $('btn-blur-reveal').click();
    else if (state.mode === 'ab') $('btn-ab-reveal').click();
    else $('btn-snellen-reveal').click();
  }
  if (e.key.toLowerCase() === 'n') $('btn-next-round').click();
});

render();
