import { gameRuntime } from '/gallery/shared/runtime.js';
import { missions } from './restaurant-bank.js';

const levels = {
  support: {
    instruction: 'Keep all lines visible, read once, then switch roles.',
    success: 'Use “please” and “thank you” in the guided exchange.',
  },
  core: {
    instruction: 'Try the full exchange, then hide the customer lines for round two.',
    success: 'Switch roles and complete a polite order.',
  },
  stretch: {
    instruction: 'Hide the customer lines after round one, then solve the scenario challenge.',
    success: 'Complete the exchange, ask a follow-up and solve the problem politely.',
  },
};
const $ = id => document.getElementById(id);
const runtime = gameRuntime('restaurant-mission', 'fixed', {
  next: newMission,
  confirm: playAudio,
  hint: () => setHidden(!hidden),
  buzzer: toggleTimer,
  answer1: () => setLevel('support'),
  answer2: () => setLevel('core'),
  answer3: () => setLevel('stretch'),
});
const audio = $('modelAudio');
const saved = runtime.load(null);
let level = typeof saved?.level === 'string' && Object.hasOwn(levels, saved.level) ? saved.level : 'core';
let missionIndex = missions[saved?.missionIndex]?.level === level ? saved.missionIndex : missions.findIndex(m => m.level === level);
let hidden = saved?.hidden === true;
let maxTime = [30, 60, 120].includes(saved?.maxTime) ? saved.maxTime : 60;
let remaining = Number.isInteger(saved?.remaining) ? Math.min(maxTime, Math.max(0, saved.remaining)) : maxTime;
if (Number.isFinite(saved?.deadline) && saved.deadline > 0) {
  remaining = Math.min(maxTime, Math.max(0, Math.ceil((saved.deadline - Date.now()) / 1000)));
}
let timer, deadline = 0, audioAttempt = 0;

function save() {
  runtime.save({ level, missionIndex, hidden, maxTime, remaining, deadline });
}

function setHidden(value) {
  hidden = value;
  document.querySelectorAll('.customer').forEach(row => row.classList.toggle('hidden', hidden));
  const button = $('hide');
  button.classList.toggle('on', hidden);
  button.setAttribute('aria-pressed', String(hidden));
  button.setAttribute('aria-label', hidden ? 'Reveal customer lines' : 'Hide customer lines');
  $('hideText').textContent = hidden ? 'Reveal lines' : 'Hide lines';
  save();
}

function makeLine(line, index) {
  const row = document.createElement('div');
  const customer = index % 2 === 1;
  row.className = customer ? 'speech customer' : 'speech';
  row.innerHTML = '<div class="avatar" aria-hidden="true"></div><div class="bubble"><b></b></div>';
  row.querySelector('.avatar').textContent = customer ? 'C' : 'S';
  row.querySelector('b').textContent = customer ? 'Customer:' : 'Server:';
  row.querySelector('.bubble').append(' ' + line);
  return row;
}

function showMission() {
  const mission = missions[missionIndex];
  const track = missions.filter(item => item.level === level);
  audioAttempt++;
  audio.pause();
  audio.src = mission.audio;
  $('listen').classList.remove('playing');
  $('voiceStatus').textContent = `Mission ${track.indexOf(mission) + 1} of ${track.length}. Press Listen to hear this scene.`;
  $('instruction').textContent = levels[level].instruction;
  $('success').textContent = levels[level].success;
  $('challenge').textContent = mission.challenge;
  $('challengeSection').classList.toggle('hidden-ui', level !== 'stretch');
  $('dialogue').replaceChildren(...mission.lines.map(makeLine));
  $('menu').innerHTML = mission.menu.map(([name, price]) => `<div class="menu-item"><span>${name}</span><span class="price">\$${price}</span></div>`).join('');
  document.querySelectorAll('[data-level]').forEach(button => {
    const selected = button.dataset.level === level;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  setHidden(hidden);
}

function setLevel(next) {
  if (next === level) return;
  level = next;
  missionIndex = missions.findIndex(m => m.level === level);
  hidden = false;
  showMission();
}

function newMission() {
  const track = missions.map((m, index) => m.level === level ? index : -1).filter(index => index >= 0);
  missionIndex = track[(track.indexOf(missionIndex) + 1) % track.length];
  hidden = false;
  showMission();
}

async function playAudio() {
  const attempt = ++audioAttempt;
  audio.currentTime = 0;
  $('voiceStatus').textContent = 'Playing the model dialogue…';
  $('listen').classList.add('playing');
  try {
    await audio.play();
  } catch {
    if (attempt !== audioAttempt) return;
    $('listen').classList.remove('playing');
    $('voiceStatus').textContent = 'Audio could not start. Press Listen to retry.';
  }
}

function paintTimer() {
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  $('clock').textContent = remaining ? `${minutes}:${seconds}` : 'CHANGE!';
  $('clock').style.color = remaining <= 10 ? 'var(--red)' : 'var(--ink)';
  $('progress').style.width = `${remaining / maxTime * 100}%`;
  $('pause').textContent = deadline ? 'PAUSE' : remaining < maxTime && remaining > 0 ? 'RESUME' : 'START';
}

function stopTimer() {
  clearInterval(timer);
  deadline = 0;
}

function tick() {
  remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (!remaining) {
    stopTimer();
    save();
  }
  paintTimer();
}

function startTimer(seconds, duration = seconds) {
  stopTimer();
  maxTime = duration;
  remaining = seconds;
  deadline = Date.now() + seconds * 1000;
  timer = setInterval(tick, 200);
  paintTimer();
  save();
}

function toggleTimer() {
  if (!deadline) {
    startTimer(remaining || maxTime, maxTime);
    return;
  }
  tick();
  stopTimer();
  paintTimer();
  save();
}

document.querySelectorAll('[data-level]').forEach(button => button.onclick = () => setLevel(button.dataset.level));
document.querySelectorAll('[data-seconds]').forEach(button => button.onclick = () => startTimer(Number(button.dataset.seconds)));
$('reset').onclick = () => {
  stopTimer();
  remaining = maxTime = 60;
  paintTimer();
  save();
};
$('pause').onclick = toggleTimer;
$('new').onclick = newMission;
$('listen').onclick = playAudio;
$('hide').onclick = () => setHidden(!hidden);
$('fullscreen').onclick = () => document.documentElement.requestFullscreen?.().catch(() => {});
audio.onended = () => {
  $('voiceStatus').textContent = 'Audio finished. Repeat this scene with your partner.';
  $('listen').classList.remove('playing');
};
showMission();
paintTimer();
