import { bindGameControls } from '../gallery/shared/runtime.js';
import { questions } from './questions.js';

const $ = id => document.getElementById(id);
const screens = ['setup', 'reading', 'start', 'quiz', 'final'];
let phase = 'setup', timer, deadline, question = 0, firstTry = 0;
let teamMode, armed, answered, mistakes, disposeControls;
const letter = index => String.fromCharCode(65 + index);

function setPhase(value) {
  phase = value;
  for (const screen of screens) $(screen + 'Screen').classList.toggle('hidden', screen !== value);
  $('timer').classList.toggle('hidden', !['setup', 'reading'].includes(phase));
  $('restartButton').classList.toggle('hidden', phase === 'setup');
  bindControls();
}

function bindControls() {
  disposeControls?.();
  const bindings = {};
  function map(action, id) {
    bindings[action] = () => $(id)?.click();
  }
  if (phase === 'setup') map('confirm', 'readButton');
  if (phase === 'reading') map('next', 'finishReading');
  if (phase === 'start') map('confirm', 'startButton');
  if (phase === 'quiz') {
    if (answered) map('next', 'nextButton');
    else if (teamMode && !armed) map('buzzer', 'buzzButton');
    else questions[question][1].forEach((_, index) => map('answer' + (index + 1), 'answer-' + index));
  }
  if (phase === 'final') map('next', 'restartButton');
  disposeControls = bindGameControls('library-kiosk-buzzer', bindings);
}

function updateTimer() {
  const seconds = Math.ceil(Math.max(0, deadline - Date.now()) / 1000);
  $('timer').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  if (!seconds) finishReading();
}

function beginReading() {
  teamMode = $('teamMode').checked;
  deadline = Date.now() + 300000;
  setPhase('reading');
  updateTimer();
  timer = setInterval(updateTimer, 200);
}

function finishReading() {
  if (phase !== 'reading') return;
  clearInterval(timer);
  setPhase('start');
  $('startButton').focus();
}

function updateQuiz() {
  const canBuzz = teamMode && !armed && !answered;
  $('buzzButton').classList.toggle('hidden', !canBuzz);
  $('buzzStatus').textContent = teamMode && !answered
    ? armed ? 'Choose one answer.' : 'Press the buzzer to claim the next attempt.'
    : '';
  $('nextButton').disabled = !answered;
  $('answers').querySelectorAll('button').forEach((button, index) => {
    button.disabled = answered || mistakes.has(index) || (teamMode && !armed);
  });
  bindControls();
}

function showQuestion() {
  if (question === questions.length) {
    $('resultScore').textContent = firstTry + ' of ' + questions.length + ' answered correctly on the first attempt.';
    setPhase('final');
    return;
  }
  const [prompt, choices] = questions[question];
  mistakes = new Set();
  answered = armed = false;
  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  $('counter').textContent = 'Question ' + (question + 1) + ' of ' + questions.length;
  $('question').textContent = prompt;
  $('nextButton').textContent = question + 1 === questions.length ? 'See results' : 'Next question →';
  $('answers').replaceChildren(...choices.map((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'answer-' + index;
    button.className = 'answer';
    const badge = document.createElement('span');
    badge.className = 'letter';
    badge.textContent = letter(index);
    badge.setAttribute('aria-hidden', 'true');
    button.append(badge, document.createTextNode(choice));
    button.onclick = () => chooseAnswer(index, button);
    return button;
  }));
  setPhase('quiz');
  updateQuiz();
  $('question').focus();
}

function chooseAnswer(index, button) {
  if (answered || mistakes.has(index) || (teamMode && !armed)) return;
  if (index === questions[question][2]) {
    if (!mistakes.size) firstTry++;
    answered = true;
    button.classList.add('correct');
    $('feedback').textContent = 'Correct.';
    $('feedback').className = 'feedback good';
  } else {
    mistakes.add(index);
    armed = false;
    button.classList.add('incorrect');
    $('feedback').textContent = teamMode ? 'Incorrect. Another team can buzz in.' : 'Incorrect. Try a different answer.';
    $('feedback').className = 'feedback bad';
  }
  updateQuiz();
}

$('readButton').onclick = beginReading;
$('finishReading').onclick = finishReading;
$('startButton').onclick = showQuestion;
$('buzzButton').onclick = () => {
  if (phase !== 'quiz' || armed || answered) return;
  armed = true;
  updateQuiz();
  $('answers').querySelector('button:not(:disabled)')?.focus();
};
$('nextButton').onclick = () => { if (phase === 'quiz' && answered) { question++; showQuestion(); } };
$('restartButton').onclick = () => {
  clearInterval(timer);
  question = firstTry = 0;
  $('timer').textContent = '5:00';
  setPhase('setup');
  $('readButton').focus();
};
window.addEventListener('pagehide', () => clearInterval(timer));
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  if (phase === 'reading') {
    updateTimer();
    if (phase === 'reading') timer = setInterval(updateTimer, 200);
  }
  bindControls();
});
setPhase('setup');
