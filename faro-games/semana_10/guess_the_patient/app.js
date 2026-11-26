import { bindGameControls } from '/gallery/shared/runtime.js';
import { read, write } from '/gallery/shared/storage.js';

const $ = id => document.getElementById(id);
const names = ['Ana','Leo','Sofia','Diego','Mia','Bruno','Sara','Nico','Emma','Hugo','Luna','Alex'];
const features = {
  red: ['red shirt','Are they wearing a red shirt?'],
  blue: ['blue shirt','Are they wearing a blue shirt?'],
  green: ['green shirt','Are they wearing a green shirt?'],
  yellow: ['yellow shirt','Are they wearing a yellow shirt?'],
  purple: ['purple shirt','Are they wearing a purple shirt?'],
  glasses: ['glasses','Are they wearing glasses?'],
  thermometer: ['thermometer','Do they have a thermometer?'],
  tissue: ['tissue','Do they have a tissue?'],
  arm: ['arm cast or sling','Do they have an arm cast or sling?'],
  leg: ['leg cast','Do they have a leg cast?'],
  bandage: ['bandage','Do they have a bandage?'],
  cough: ['coughing','Are they coughing?'],
  auburn: ['auburn hair','Do they have reddish-brown hair?'],
  headache: ['hand on head','Do they have a hand on their head?'],
  stomach: ['hand on stomach','Do they have a hand on their stomach?'],
  ear: ['hand on ear','Do they have a hand on their ear?'],
  wheelchair: ['wheelchair','Are they using a wheelchair?'],
  crutches: ['crutches','Are they using crutches?'],
  boot: ['walking boot','Do they have a walking boot?'],
};
const boards = [
  ['red glasses thermometer bandage','blue auburn tissue headache','green stomach','yellow glasses cough ear',
   'purple glasses arm ear','green thermometer bandage','red tissue stomach','blue glasses arm ear',
   'yellow glasses thermometer stomach','purple cough','blue tissue headache','green glasses bandage ear'],
  ['red glasses leg','blue crutches bandage','yellow wheelchair','green glasses arm','purple crutches leg','red glasses wheelchair thermometer',
   'blue bandage headache','yellow glasses crutches bandage','green glasses wheelchair arm','purple leg tissue','red glasses arm','blue glasses boot thermometer'],
  ['green glasses wheelchair tissue','yellow crutches leg bandage','purple thermometer arm','red bandage headache','blue glasses leg',
   'green wheelchair arm bandage','yellow glasses crutches boot','purple arm tissue','red glasses wheelchair thermometer','blue glasses crutches bandage',
   'green boot ear bandage','yellow leg tissue'],
].map(board => board.map(features => features.split(' ')));
const key = 'progress:guess-the-patient';
const saved = read(key, {});
let legacy = 0;
try { legacy = Number(localStorage.getItem('guess-patient.version')); } catch {}
const isIndex = value => Number.isInteger(value) && value >= 0 && value < names.length;
const validVersion = value => Number.isInteger(value) && value >= 0 && value < boards.length;
let version = validVersion(saved?.version) ? saved.version : validVersion(legacy) ? legacy : 0;
let mode = saved?.mode === 'solo' ? 'solo' : 'pairs';
let descriptions = saved?.descriptions === true;
let excluded = new Set(Array.isArray(saved?.excluded) ? saved.excluded.filter(isIndex) : []);
let questions = new Set(Array.isArray(saved?.questions) ? saved.questions.filter(id => Object.hasOwn(features, id)) : []);
let target = isIndex(saved?.target) ? saved.target : Math.floor(Math.random() * names.length);
let revealed = saved?.revealed === true && mode === 'solo';
let guessing = false;
let notice = '';

function save() {
  write(key, { version, mode, descriptions, excluded: [...excluded], questions: [...questions], target, revealed });
}

function render(focusIndex) {
  const board = boards[version];
  const currentQuestion = $('question').value;
  $('version').textContent = `${version + 1} / ${boards.length}`;
  $('mode').value = mode;
  $('descriptions').checked = descriptions;
  $('questions').hidden = mode !== 'solo';
  $('guess').setAttribute('aria-pressed', String(guessing));
  $('guess').disabled = revealed;
  $('guess').textContent = guessing ? 'Cancel guess' : 'Make a guess';
  $('instruction').textContent = mode === 'solo' ? 'Ask a yes/no question, cross out patients and guess the mystery patient.' :
    'One player secretly chooses a patient. Ask yes/no questions and cross out patients on the board.';
  $('notice').textContent = notice;
  $('question').replaceChildren(...Object.entries(features)
    .filter(([id]) => board.some(traits => traits.includes(id)) && board.some(traits => !traits.includes(id)) && !questions.has(id))
    .map(([id, [, label]]) => new Option(label, id)));
  if ([...$('question').options].some(option => option.value === currentQuestion)) $('question').value = currentQuestion;
  $('ask').disabled = revealed || !$('question').options.length;
  $('answers').replaceChildren(...[...questions].map(id => {
    const li = document.createElement('li');
    li.textContent = `${features[id][1]} ${board[target].includes(id) ? 'Yes.' : 'No.'}`;
    return li;
  }));
  $('board').replaceChildren(...board.map((traits, index) => {
    const card = document.createElement('button');
    card.className = 'patient';
    card.disabled = revealed;
    card.classList.toggle('excluded', excluded.has(index));
    card.classList.toggle('found', revealed && index === target);
    card.setAttribute('aria-pressed', String(excluded.has(index)));
    card.setAttribute('aria-label', `${names[index]}, patient ${index + 1}: ${traits.map(id => features[id][0]).join(', ')}`);
    const img = document.createElement('img');
    img.src = `assets/board-${version + 1}-${index + 1}.webp`;
    img.alt = '';
    const label = document.createElement('strong');
    label.textContent = `${String(index + 1).padStart(2, '0')} · ${names[index]}`;
    card.append(img, label);
    if (descriptions) {
      const text = document.createElement('span');
      text.textContent = traits.map(id => features[id][0]).join(', ');
      card.append(text);
    }
    card.onclick = () => select(index);
    return card;
  }));
  if (Number.isInteger(focusIndex) && !revealed) $('board').children[focusIndex]?.focus({ preventScroll:true });
  if (revealed) $('restart').focus({ preventScroll:true });
  save();
}

function victoryText(name) { return `You found ${name} in ${questions.size} ${questions.size === 1 ? 'question' : 'questions'}!`; }

function select(index) {
  if (revealed || !isIndex(index)) return;
  const name = names[index];
  if (guessing) {
    if (mode === 'pairs') {
      notice = `Your guess is ${name}. Ask your partner to reveal their patient.`;
    } else if (index === target) {
      revealed = true;
      notice = victoryText(name);
    } else {
      excluded.add(index);
      notice = `The mystery patient is someone else. Keep asking!`;
    }
    guessing = false;
  } else {
    if (excluded.has(index)) excluded.delete(index);
    else excluded.add(index);
    notice = `${name} ${excluded.has(index) ? 'crossed out' : 'restored'}.`;
  }
  render(index);
}

function restart() {
  excluded.clear();
  questions.clear();
  target = Math.floor(Math.random() * names.length);
  revealed = guessing = false;
  notice = '';
  render();
}

function move(step) {
  version = (version + step + boards.length) % boards.length;
  restart();
}

$('question-form').onsubmit = event => {
  event.preventDefault();
  if ($('ask').disabled || mode !== 'solo') return;
  questions.add($('question').value);
  notice = '';
  render();
  $('notice').textContent = $('answers').lastElementChild.textContent;
};
$('mode').onchange = event => { mode = event.target.value; restart(); };
$('descriptions').onchange = event => { descriptions = event.target.checked; render(); };
$('previous').onclick = () => move(-1);
$('next').onclick = () => move(1);
$('restart').onclick = restart;
$('guess').onclick = () => {
  guessing = !guessing;
  notice = guessing ? 'Choose the patient you want to guess.' : '';
  render();
};
$('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { $('notice').textContent = 'Use your browser’s full-screen control.'; }
};

bindGameControls('guess-the-patient', {
  ...Object.fromEntries(Array.from({ length: 8 }, (_, index) => ['answer' + (index + 1), () => select(index)])),
  next: () => move(1),
  confirm: () => { if (mode === 'solo' && !$('ask').disabled) $('question-form').requestSubmit(); else $('guess').click(); },
  buzzer: () => $('guess').click(),
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.repeat ||
      ['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  if (event.key.toLowerCase() === 'f') $('fullscreen').click();
});
if (revealed) notice = victoryText(names[target]);
render();
