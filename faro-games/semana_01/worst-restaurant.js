import { gameRuntime } from '/gallery/shared/runtime.js';
import { read, write } from '/gallery/shared/storage.js';
import { clipKey } from '/gallery/shared/lesson-audio.js';
import { avatars, GAME_ROUNDS, missionPools } from './worst-restaurant-bank.js';

const id = 'worst-restaurant';
const $ = name => document.getElementById(name);
const params = new URLSearchParams(location.search);
const screen = params.get('view') === 'screen';
const projectionKey = 'worst-restaurant:projection';
const sessionKey = id + ':teacher-session';
let session = params.get('session');
if (!screen) {
  try {
    session = sessionStorage.getItem(sessionKey) || crypto.randomUUID();
    sessionStorage.setItem(sessionKey, session);
  } catch { session = crypto.randomUUID(); }
}
const controls = session && typeof BroadcastChannel === 'function'
  ? new BroadcastChannel(id + ':controls:' + session) : null;
if (controls) window.addEventListener('pagehide', () => controls.close(), { once: true });
const stages = ['order', 'listen', 'score', 'answer', 'winner'];
const levels = { support: 'A1', core: 'A2', stretch: 'B1' };
const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const actions = {
  ...Object.fromEntries(Array.from({ length: 5 }, (_, index) => ['answer' + (index + 1), () => chooseTeam(index)])),
  answer6: () => score(1), answer7: () => score(2), answer8: () => score(3),
  confirm: primary, next: nextRound, buzzer: () => state.stage === 'score' ? steal() : primary(), hint: noAnswer,
};
const allowed = action => !screen && $('confirmOverlay').classList.contains('hidden') && $('setupOverlay').classList.contains('hidden') && Object.hasOwn(actions, action);
const runtime = gameRuntime(id, 'dialogues', screen ? {} : Object.fromEntries(
  Object.keys(actions).map(action => [action, () => { if (allowed(action)) actions[action](); }])
));
const packSignature = runtime.pack ? clipKey(JSON.stringify(runtime.pack)) : null;
const pools = { ...missionPools };
if (runtime.pack) {
  levels.custom = runtime.pack.level;
  pools.custom = runtime.pack.items.map(item => ({
    title: item.title, level: runtime.pack.title, order: item.order,
    mistake: item.reply, answer: item.correction, languageError: item.grammar,
  }));
}

const defaultTeams = ['Dino Squad', 'Space Monsters', 'Octo Crew', 'Dragon Bites', 'Shark Snacks'];
let countdown, audioContext, projector, avatarTarget, confirmAction;
const undoStack = [];
let state = screen ? null : load();

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function deckFor(difficulty, previous = []) {
  const pool = pools[difficulty];
  const indices = pool.map((_, index) => index);
  const favored = group => [...shuffle(group.filter(index => !previous.includes(index))), ...shuffle(group.filter(index => previous.includes(index)))];
  if (difficulty === 'custom') return favored(indices).slice(0, GAME_ROUNDS);
  const firstCut = Math.ceil(pool.length / 3);
  const secondCut = Math.ceil(pool.length * 2 / 3);
  return [indices.slice(0, firstCut), indices.slice(firstCut, secondCut), indices.slice(secondCut)]
    .flatMap(group => shuffle(favored(group).slice(0, 4)));
}

function cleanName(value, fallback) {
  return typeof value === 'string' ? value.trim().slice(0, 36) || fallback : fallback;
}

function load() {
  let old = runtime.load(null);
  if (!old) {
    try { old = JSON.parse(localStorage.getItem('faroWorstRestaurant')); } catch { /* start a new match */ }
  }
  const difficulty = Object.hasOwn(pools, old?.difficulty) ? old.difficulty : 'core';
  const count = Math.min(GAME_ROUNDS, pools[difficulty].length);
  const deck = old?.deck;
  const validDeck = Array.isArray(deck) && deck.length === count && new Set(deck).size === count &&
    deck.every(index => Number.isInteger(index) && pools[difficulty][index]) &&
    (difficulty === 'custom' ? old.packSignature === packSignature : old.deckLevel === difficulty || old.difficulty === difficulty);
  const teams = defaultTeams.map((name, index) => {
    const team = Array.isArray(old?.teams) ? old.teams[index] : null;
    return {
      name: cleanName(team?.name, name),
      avatar: avatars.includes(team?.avatar) ? team.avatar : avatars[index],
      score: validDeck && Number.isSafeInteger(team?.score) && team.score >= 0 ? team.score : 0,
    };
  });
  const round = validDeck && Number.isInteger(old?.round) && old.round >= 0 && old.round < count ? old.round : 0;
  const selected = Number.isInteger(old?.selected) && teams[old.selected] ? old.selected : null;
  let stage = validDeck && stages.includes(old.stage) ? old.stage : 'order';
  if (stage === 'score' && selected === null) stage = 'listen';
  const timerRemaining = (stage === 'listen' || stage === 'score') && Number.isInteger(old.timerRemaining)
    ? Math.min(10, Math.max(0, old.timerRemaining)) : null;
  const freshDeadline = timerRemaining > 0 ? Date.now() + timerRemaining * 1000 : 0;
  return {
    difficulty, round, stage, teams, deck: validDeck ? deck : deckFor(difficulty),
    selected: stage === 'score' || stage === 'answer' ? selected : null,
    attempted: stage === 'listen' || stage === 'score' ? (Array.isArray(old.attempted)
      ? [...new Set(old.attempted.filter(index => Number.isInteger(index) && teams[index]))] : []) : [],
    timerRemaining, deadline: timerRemaining > 0 && Number.isFinite(old.deadline) ? Math.min(freshDeadline, old.deadline || freshDeadline) : freshDeadline,
    result: stage === 'answer' && (old.result ?? old.roundResult) === 'none' ? 'none' : null,
  };
}

function save() {
  runtime.save({ ...state, packSignature: state.difficulty === 'custom' ? packSignature : null });
  renderTeacher();
  publish();
}

function remember() {
  undoStack.push(structuredClone(state));
  if (undoStack.length > 30) undoStack.shift();
}

function stopCountdown() {
  clearInterval(countdown);
  countdown = undefined;
}

function clearSignals() {
  stopCountdown();
  Object.assign(state, { timerRemaining: null, deadline: 0 });
}

function resetRound() {
  clearSignals();
  Object.assign(state, { stage: 'order', selected: null, attempted: [], result: null });
}

function restart(difficulty = state.difficulty) {
  const previous = difficulty === state.difficulty ? state.deck : [];
  undoStack.length = 0;
  state.difficulty = difficulty;
  state.round = 0;
  state.deck = deckFor(difficulty, previous);
  state.teams.forEach(team => { team.score = 0; });
  resetRound();
  save();
}

function tone(frequency, duration, delay = 0, type = 'sine', volume = .16) {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    const start = audioContext.currentTime + delay;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .012);
    gain.gain.setValueAtTime(volume, start + Math.max(.02, duration - .045));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  } catch { /* visual countdown is always available */ }
}

function tick() {
  const previous = state.timerRemaining;
  state.timerRemaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
  if (state.timerRemaining === previous) return;
  if (!state.timerRemaining) {
    stopCountdown();
    state.deadline = 0;
    tone(1050, .55, 0, 'square', .22);
    tone(1575, .55, 0, 'sine', .12);
  } else if (state.timerRemaining <= 3) {
    tone(690, .21, 0, 'square', .2);
    tone(345, .21, .15, 'sine', .1);
  }
  save();
}

function armCountdown() {
  if (state.stage !== 'listen' || !state.deadline) return;
  tick();
  if (state.deadline) countdown = setInterval(tick, 200);
}

function startCountdown() {
  if (state.stage !== 'listen' || state.timerRemaining !== null) return;
  remember();
  state.timerRemaining = 10;
  state.deadline = Date.now() + 10000;
  save();
  armCountdown();
}

const current = () => pools[state.difficulty][state.deck[state.round]];
const canPick = () => state.stage === 'score' || (state.stage === 'listen' && state.timerRemaining === 0);

function goListen() {
  if (state.stage !== 'order') return;
  remember();
  state.stage = 'listen';
  save();
}

function chooseTeam(index) {
  if (!canPick() || !state.teams[index] || state.attempted.includes(index) || state.selected === index) return;
  remember();
  state.selected = index;
  state.stage = 'score';
  save();
}

function reveal(result) {
  clearSignals();
  state.stage = 'answer';
  state.result = result;
  save();
}

function score(points) {
  if (state.stage !== 'score' || ![1, 2, 3].includes(points) || (points === 3 && !current().languageError)) return;
  remember();
  state.teams[state.selected].score += points;
  reveal('scored');
}

function steal() {
  if (state.stage !== 'score') return;
  remember();
  state.attempted.push(state.selected);
  state.selected = null;
  tone(190, .14, 0, 'sawtooth', .13);
  tone(135, .23, .15, 'sine', .13);
  if (state.attempted.length === state.teams.length) {
    reveal('none');
    return;
  }
  state.stage = 'listen';
  state.timerRemaining = 0;
  save();
}

function noAnswer() {
  if (!canPick()) return;
  remember();
  state.selected = null;
  reveal('none');
}

function nextRound() {
  if (state.stage !== 'answer') return;
  remember();
  if (state.round >= state.deck.length - 1) {
    state.stage = 'winner';
    state.selected = null;
  } else {
    state.round++;
    resetRound();
  }
  save();
}

function primary() {
  if (state.stage === 'order') goListen();
  else if (state.stage === 'listen') startCountdown();
  else if (state.stage === 'answer') nextRound();
}

function undo() {
  if (!undoStack.length) return;
  stopCountdown();
  state = undoStack.pop();
  save();
  armCountdown();
  if (!$('setupOverlay').classList.contains('hidden')) openSetup();
}

function podium(teams) {
  const medals = ['🥇', '🥈', '🥉'];
  const places = ['first', 'second', 'third'];
  const ranked = [...teams].sort((a, b) => b.score - a.score).slice(0, 3);
  return '<div class="podium">' + ranked.map((team, index) => `<div class="podium-place ${places[index]}">
    <span class="podium-medal">${medals[index]}</span><span class="podium-avatar">${esc(team.avatar)}</span>
    <span class="podium-name">${esc(team.name)}</span><span class="podium-points">${team.score} pts</span></div>`).join('') + '</div>';
}

function teamRows(view, student = false) {
  const lead = Math.max(...view.teams.map(team => team.score));
  return view.teams.map((team, index) => {
    const highlights = (team.score === lead && lead > 0 ? ' leading' : '') + (view.selected === index ? ' selected' : '');
    const avatar = `<span class="emoji">${esc(team.avatar)}</span>`;
    if (student) return `<div class="student-team sketch${highlights}">${avatar}<span class="name">${esc(team.name)}</span><strong class="points">${team.score}</strong></div>`;
    const selectable = canPick() && !state.attempted.includes(index);
    return `<button class="team-row${highlights}${selectable ? ' can-pick' : ''}" data-action="team" data-index="${index}" ${selectable ? '' : 'disabled'}>
      ${avatar}<span class="team-name">${esc(team.name)}</span><strong class="team-score">${team.score}</strong></button>`;
  }).join('');
}

const guide = {
  order: ['Show the order', 'Let teams read the order, then hide it.'],
  listen: ['Listen once', 'Say the yellow line once, then start the ten-second timer.'],
  score: ['Score the answer', 'Tap another team if needed. Reveal the model if nobody solves it.'],
  answer: ['Reveal the correction', 'Everyone repeats the correction once. Undo removes an accidental score.'],
  winner: ['Game over', 'Start a new shuffled game when the class is ready.'],
};
const button = (action, label, classes, extra = '') => `<button type="button" data-action="${action}" class="${classes}" ${extra}>${label}</button>`;

function teacherMission() {
  const item = current();
  if (state.stage === 'winner') return `<h3>The podium</h3>${podium(state.teams)}
    <p class="teacher-help">${state.deck.length} rounds complete.</p>${button('restart', 'New shuffled game', 'main-action primary')}`;
  const phase = stages.slice(0, 4).map((key, index) => `<span class="phase-chip${key === state.stage ? ' active' : ''}">${index + 1} ${key}</span>`).join('');
  const top = `<div class="teacher-kicker small">${esc(item.level)} · ${esc(item.title)}</div><div class="phase-strip">${phase}</div>`;
  if (state.stage === 'order') return `${top}<h3>Students see this order</h3><div class="teacher-order">${esc(item.order)}</div>
    ${button('listen', 'Hide order and listen', 'main-action primary')}`;
  if (state.stage === 'listen') {
    let status = button('countdown', 'Start 10 seconds', 'main-action listen');
    if (state.attempted.length) status = '<div class="steal-readout">Steal · pick another team</div>' +
      button('no-answer', 'Reveal without points', 'steal-choice no-answer');
    else if (state.timerRemaining === 0) status = '<div class="timer-readout ready">Hands up!</div>' +
      button('no-answer', 'Reveal without points', 'steal-choice no-answer');
    else if (state.timerRemaining > 0) status = `<div class="timer-readout" role="timer">${state.timerRemaining}</div>`;
    return `${top}<h3>Read this line aloud</h3><div class="teacher-say">${esc(item.mistake)}</div>${status}`;
  }
  if (state.stage === 'score') return `${top}<h3>${esc(state.teams[state.selected].name)} answered</h3>
    <div class="teacher-answer">${esc(item.answer)}</div>
    ${item.languageError ? `<div class="language-check"><b>Grammar bonus</b>${esc(item.languageError)}</div>` : ''}
    <div class="score-actions">
      ${button('score', '+2 Complete', 'score-choice', 'data-points="2"')}
      ${button('score', '+1 Good try', 'score-choice try', 'data-points="1"')}
      ${item.languageError ? button('score', '+3 Master catch', 'score-choice master', 'data-points="3"') : ''}
      ${button('steal', 'Incorrect · steal', 'steal-choice')}
      ${button('no-answer', 'Reveal without points', 'steal-choice no-answer')}
    </div>`;
  return `${top}<h3>${state.result === 'none' ? 'Model answer · no points' : 'Reveal the correction'}</h3>
    <div class="teacher-answer">${esc(item.answer)}</div>${button('next', 'Next round', 'main-action primary')}`;
}

function renderTeacher() {
  const [title, help] = guide[state.stage];
  $('teacherPhaseTitle').textContent = title;
  $('roundTag').textContent = `Round ${state.round + 1} / ${state.deck.length}`;
  $('teacherTeams').innerHTML = teamRows(state);
  $('teamPrompt').textContent = canPick() ? 'Choose a team' : 'Scoreboard';
  $('missionPanel').innerHTML = teacherMission();
  $('nextCard').innerHTML = `<b>Your next action</b>${help}`;
  $('levelCard').innerHTML = `<h3>${state.stage === 'order' ? 'Choose a level' : levels[state.difficulty]}</h3>` +
    (state.stage === 'order' ? '<div class="level">' + Object.entries(levels).map(([level, cefr]) =>
      button('level', cefr + (level === 'custom' ? ' · My dialogues' : ''), state.difficulty === level ? 'active' : '',
        `data-level="${level}" aria-pressed="${state.difficulty === level}"`)).join('') + '</div>' : '');
  $('undoAction').disabled = !undoStack.length;
}

function publicView() {
  const item = current();
  const showOrder = state.stage === 'order' ||
    (state.difficulty === 'support' && ['listen', 'score'].includes(state.stage) && !state.attempted.length);
  return {
    session, stage: state.stage, teams: state.teams, selected: state.selected, level: levels[state.difficulty],
    round: state.round + 1, count: state.deck.length, remaining: state.timerRemaining, steal: state.attempted.length > 0,
    support: state.difficulty === 'support', core: state.difficulty === 'core',
    title: state.stage === 'order' ? item.title : '', order: showOrder ? item.order : '',
    answer: state.stage === 'answer' ? item.answer : '', model: state.result === 'none',
  };
}

function publish() {
  const view = publicView();
  write(projectionKey, view);
  if (projector && !projector.closed) projector.postMessage({ game: id, type: 'view', view }, location.origin);
}

function renderProjection(view) {
  if (!view || !stages.includes(view.stage) || !Array.isArray(view.teams) ||
      !view.teams.length || view.teams.some(team => !Number.isSafeInteger(team?.score))) {
    $('studentMission').textContent = 'Open the projector from the teacher panel to start.';
    return;
  }
  $('displayRound').textContent = `${view.level} · ${view.round} / ${view.count}`;
  $('studentScores').innerHTML = teamRows(view, true);
  const order = view.order ? `<div class="student-order">${esc(view.order)}</div>` : '';
  let body;
  if (view.stage === 'winner') body = '<h2>The podium</h2>' + podium(view.teams);
  else if (view.stage === 'order') body = `<h2>${esc(view.title)}</h2>${order}<p class="student-instruction">Read it. Remember it.</p>`;
  else if (view.stage === 'answer') body = `<h2>${view.model ? 'Model answer' : 'Nice catch'}</h2>
    <div class="student-answer">${esc(view.answer)}</div><p class="student-instruction">Everybody says it once.</p>`;
  else if (view.steal) body = '<div class="student-steal">Steal! Another team may answer.</div>';
  else {
    const hint = view.support ? 'We ordered ___, not ___.' : view.core ? 'Excuse me · ordered · not · please' : 'Make a natural correction.';
    const timing = view.remaining === null ? '<p class="student-instruction">Listen and think.</p>' :
      Number.isInteger(view.remaining) && view.remaining > 0 ? `<div class="student-timer" role="timer">${view.remaining}</div>` : '<div class="student-timer ready">Hands up!</div>';
    body = `<h2>What did the waiter get wrong?</h2>${order}<div class="student-hint">${hint}</div>${timing}`;
  }
  $('studentMission').innerHTML = body;
}

function ask(message, action) {
  confirmAction = action;
  $('confirmMessage').textContent = message;
  $('confirmOverlay').classList.remove('hidden');
  $('confirmOk').focus();
}

function closeConfirm() {
  confirmAction = null;
  $('confirmOverlay').classList.add('hidden');
  $('teacherPhaseTitle').tabIndex = -1;
  $('teacherPhaseTitle').focus();
}

function openSetup() {
  $('setupOverlay').classList.remove('hidden');
  $('avatarPicker').classList.add('hidden');
  $('setupTeams').innerHTML = state.teams.map((team, index) => `<div class="setup-team">
    ${button('avatars', esc(team.avatar), 'avatar-btn', `data-index="${index}" aria-label="Choose avatar for team ${index + 1}"`)}
    <input aria-label="Team ${index + 1} nickname" maxlength="36" value="${esc(team.name)}" data-team-name="${index}">
    <div class="score-editor">
      ${button('adjust', '−', '', `data-index="${index}" data-change="-1" aria-label="Subtract a point from team ${index + 1}"`)}
      <strong>${team.score}</strong>
      ${button('adjust', '+', '', `data-index="${index}" data-change="1" aria-label="Add a point to team ${index + 1}"`)}
    </div></div>`).join('');
  $('closeSetup').focus();
}

function closeSetup() {
  $('setupOverlay').classList.add('hidden');
  $('openSetup').focus();
}

function showAvatars(index) {
  avatarTarget = index;
  $('avatarPicker').classList.remove('hidden');
  $('avatarPicker').innerHTML = avatars.map(avatar => button('avatar', esc(avatar), avatar === state.teams[index].avatar ? 'chosen' : '',
    `data-avatar="${esc(avatar)}"`)).join('');
}

function openProjector() {
  publish();
  projector = window.open(location.pathname + '?' + new URLSearchParams({ view: 'screen', session }),
    'englishcode-worst-restaurant-' + session, 'width=1400,height=900');
  $('projectionStatus').hidden = Boolean(projector);
  $('projectionStatus').textContent = projector ? '' : 'Allow popups for EnglishCode, then open the projector again.';
}

const keyboard = {
  Space: 'confirm', ArrowRight: 'next', Digit1: 'answer1', Digit2: 'answer2', Digit3: 'answer3',
  Digit4: 'answer4', Digit5: 'answer5', KeyA: 'answer6', KeyS: 'answer7', KeyD: 'answer8', KeyX: 'buzzer', KeyN: 'hint',
};

if (screen) {
  $('screenView').classList.remove('hidden');
  const refresh = () => {
    const view = read(projectionKey, null);
    if (!session || view?.session === session) renderProjection(view);
  };
  refresh();
  window.addEventListener('storage', event => {
    if (event.key === 'englishcode:v1:' + projectionKey) refresh();
  });
  window.addEventListener('message', event => {
    const data = event.data;
    if (event.origin === location.origin && event.source === window.opener && data?.game === id && data.type === 'view') renderProjection(data.view);
  });
  window.addEventListener('keydown', event => {
    const action = keyboard[event.code];
    if (!action || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    event.preventDefault();
    if (controls) controls.postMessage(action);
    else if (session) window.opener?.postMessage({ game: id, session, type: 'action', action }, location.origin);
  });
  if (session) window.opener?.postMessage({ game: id, session, type: 'ready' }, location.origin);
} else {
  $('teacherView').classList.remove('hidden');
  $('openScreen').onclick = openProjector;
  $('openSetup').onclick = openSetup;
  $('closeSetup').onclick = closeSetup;
  $('undoAction').onclick = undo;
  $('resetGame').onclick = () => ask('Reset the scores and begin a newly shuffled game?', () => restart());
  $('confirmCancel').onclick = closeConfirm;
  $('confirmOk').onclick = () => { const action = confirmAction; closeConfirm(); action?.(); };
  $('setupTeams').addEventListener('change', event => {
    const index = Number(event.target.dataset.teamName);
    if (!Number.isInteger(index) || !state.teams[index]) return;
    state.teams[index].name = cleanName(event.target.value, 'Team ' + (index + 1));
    event.target.value = state.teams[index].name;
    save();
  });
  const clickActions = {
    listen: goListen, countdown: startCountdown, team: element => chooseTeam(Number(element.dataset.index)),
    score: element => score(Number(element.dataset.points)), steal, 'no-answer': noAnswer, next: nextRound,
    restart: () => restart(),
    level: element => {
      const next = element.dataset.level;
      if (next !== state.difficulty && Object.hasOwn(pools, next)) ask('Switch levels and start a new game?', () => restart(next));
    },
    avatars: element => showAvatars(Number(element.dataset.index)),
    adjust: element => {
      const team = state.teams[Number(element.dataset.index)];
      remember();
      team.score = Math.max(0, team.score + Number(element.dataset.change));
      save();
      openSetup();
    },
    avatar: element => {
      const avatar = element.dataset.avatar;
      if (!avatars.includes(avatar)) return;
      remember();
      state.teams[avatarTarget].avatar = avatar;
      save();
      openSetup();
      showAvatars(avatarTarget);
    },
  };
  document.addEventListener('click', event => {
    const element = event.target.closest('button[data-action]');
    if (element) clickActions[element.dataset.action]?.(element);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (confirmAction) closeConfirm();
      else if (!$('setupOverlay').classList.contains('hidden')) closeSetup();
      return;
    }
    if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey) && !event.target.matches('input,textarea')) {
      event.preventDefault();
      undo();
    }
  });
  window.addEventListener('message', event => {
    const data = event.data;
    if (event.origin !== location.origin || data?.game !== id || data.session !== session ||
        (projector && event.source !== projector) || !event.source) return;
    if (data.type === 'ready') {
      projector = event.source;
      publish();
    } else if (data.type === 'action' && allowed(data.action)) {
      projector = event.source;
      actions[data.action]();
    }
  });
  if (controls) controls.onmessage = ({ data }) => {
    if (allowed(data)) actions[data]();
  };
  save();
  armCountdown();
}
