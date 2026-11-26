import { attemptsFor, audioPath, decks } from './pronunciation-bank.js';
import { bindGameControls } from '/gallery/shared/runtime.js';
import { read, write } from '/gallery/shared/storage.js';

const deckKey = document.body.dataset.deck;
const { id, title, slides } = decks[deckKey];
const quizSlide = slides.findIndex(slide => slide.quiz || slide.pairs);
const bank = attemptsFor(slides[quizSlide]);
const key = 'progress:' + id;
const $ = name => document.getElementById(name);
const audio = $('sample');
const saved = read(key, null);
let legacyIndex;
try { legacyIndex = Number(localStorage.getItem('faro.pronunciation.' + deckKey)); } catch { /* Storage is optional. */ }
let index = Math.max(0, Math.min(slides.length - 1, Number.isInteger(saved?.index) ? saved.index : Math.trunc(legacyIndex || 0)));
let mode = saved?.mode === 'class' ? 'class' : 'solo';
const rounds = { solo: restoreRound(saved?.rounds?.solo), class: restoreRound(saved?.rounds?.class) };
let round = rounds[mode] || newRound();
let finishClip, playback = 0;
const sources = deckKey === 'b'
  ? ['beer', 'bird', 'bear', 'beard']
  : ['sip', 'zip', 'price', 'prize'];

function newRound() {
  const order = bank.map((_, index) => index);
  for (let end = order.length - 1; end > 0; end--) {
    const other = Math.floor(Math.random() * (end + 1));
    [order[other], order[end]] = [order[end], order[other]];
  }
  return { order, position: 0, results: [] };
}

function restoreRound(data) {
  if (!Array.isArray(data?.order) || data.order.length !== bank.length ||
      new Set(data.order).size !== bank.length ||
      !data.order.every(index => Number.isInteger(index) && index >= 0 && index < bank.length) ||
      !Number.isInteger(data.position) || data.position < 0 || data.position > bank.length ||
      !Array.isArray(data.results) || ![data.position, data.position + 1].includes(data.results.length) ||
      data.results.length > bank.length) return null;
  if (!data.results.every((value, position) => value === null ||
      Number.isInteger(value) && value >= 0 && value < bank[data.order[position]].choices.length)) return null;
  return data;
}

function save() { rounds[mode] = round; write(key, { index, mode, rounds }); }
function quizOpen() { return index === quizSlide; }
function attempt() { return bank[round.order[round.position]]; }
function answered() { return round.results.length > round.position; }
function markStatus(text) { $('status').textContent = text; }

function stopAudio() {
  playback++;
  audio.pause();
  finishClip?.(false);
  markStatus('');
}

async function play(samples) {
  if (!samples?.length) return;
  stopAudio();
  const active = playback;
  for (const sample of samples) {
    if (active !== playback) return;
    audio.src = audioPath(sample);
    markStatus('Reproduciendo…');
    try {
      const ended = await new Promise((resolve, reject) => {
        function clear() {
          audio.onended = audio.onerror = null;
          finishClip = null;
        }
        finishClip = value => { clear(); resolve(value); };
        const fail = error => { clear(); reject(error); };
        audio.onended = () => finishClip?.(true);
        audio.onerror = fail;
        audio.play().catch(error => { if (active === playback) fail(error); });
      });
      if (!ended) return;
    } catch {
      if (active === playback) markStatus('No se pudo reproducir el audio. Pulsa Escuchar para reintentar.');
      return;
    }
  }
  if (active === playback) markStatus('');
}

function listen() {
  play(quizOpen() ? (attempt() ? [attempt().word] : []) : slides[index].audio);
}

function move(delta) {
  const next = index + delta;
  if (next < 0 || next >= slides.length) return;
  stopAudio();
  index = next;
  $('notes').hidden = true;
  $('note').setAttribute('aria-expanded', 'false');
  render(true);
}

function progress() {
  const score = round.results.reduce((correct, selected, index) => correct + Number(selected === bank[round.order[index]].correct), 0);
  const item = attempt();
  if (!item) {
    const summary = mode === 'solo'
      ? `<p class="score"><strong>${score} / ${bank.length}</strong> aciertos</p>`
      : `<p class="score">${bank.length} palabras practicadas</p>`;
    return `<section class="round-summary" tabindex="-1"><h2>Ronda completa</h2>${summary}<button class="primary" id="replay">Volver a jugar</button></section>`;
  }
  const done = answered();
  const selected = round.results[round.position];
  const feedback = done ? `${mode === 'class' ? 'Respuesta' : selected === item.correct ? '¡Correcto!' : 'Respuesta correcta'} · ${item.correct + 1}. ${item.word}` : '';
  return `<p class="quiz-count">Intento ${round.position + 1} de ${bank.length}</p>
    <p>${mode === 'class' ? 'Escuchen y muestren el número.' : 'Escucha y elige la palabra.'}</p>
    <div class="words quiz-choices">${item.choices.map((word, number) => {
      const inner = `<span>${number + 1}</span><b lang="en">${word}</b>`;
      const state = done ? number === item.correct ? ' correct' : number === selected ? ' incorrect' : '' : '';
      return mode === 'class' ? `<div class="word${state}">${inner}</div>`
        : `<button class="word${state}" data-choice="${number}" ${done ? 'disabled' : ''}>${inner}</button>`;
    }).join('')}</div><p class="result" id="result" role="status" tabindex="-1">${feedback}</p>`;
}

function reveal(selected = null) {
  if (!quizOpen() || !attempt() || answered()) return;
  round.results.push(selected);
  render();
  $('result').focus();
}

function advance() {
  if (!quizOpen()) return move(1);
  if (!attempt()) return move(1);
  if (!answered()) reveal();
  stopAudio();
  round.position++;
  render();
  if (attempt()) $('listen').focus();
  else document.querySelector('.round-summary').focus();
}

function render(focusTitle = false) {
  const slide = slides[index];
  $('slide').innerHTML = `<h1 id="slide-title" tabindex="-1">${slide.title}</h1>` +
    (quizOpen() ? progress() : slide.html) +
    (!quizOpen() && slide.html.includes('class="sentence"') ?
      `<div class="phrase-audio">${slide.audio.map((phrase, i) => `<button data-phrase="${i}" aria-label="Escuchar frase ${i + 1}">▶ ${i + 1}</button>`).join('')}</div>` : '');
  $('position').textContent = `${index + 1} / ${slides.length}`;
  $('deck-title').textContent = title;
  $('mode').value = mode;
  $('notes').innerHTML = `<h2>Notas para docentes</h2><p>${slide.notes}</p><p>Modelos de pronunciación en inglés estadounidense generados con Kokoro (af_heart).</p>
    <p class="sources">${sources.map(word => `<a href="https://dictionary.cambridge.org/pronunciation/english/${word}" target="_blank" rel="noopener">${word}</a>`).join(' · ')}</p>`;
  $('prev').disabled = index === 0;
  $('next').disabled = index === slides.length - 1;
  $('listen').disabled = quizOpen() && !attempt();
  $('answer').hidden = !quizOpen() || !attempt() || answered();
  $('answer').textContent = mode === 'class' ? 'Revelar' : 'Ver respuesta';
  $('another').hidden = !quizOpen() || !attempt();
  $('another').textContent = answered() ? 'Otro intento' : 'Omitir';
  document.querySelectorAll('[data-audio]').forEach(button => {
    button.onclick = () => play([button.dataset.audio]);
  });
  document.querySelectorAll('[data-phrase]').forEach(button => {
    button.onclick = () => play([slide.audio[Number(button.dataset.phrase)]]);
  });
  document.querySelectorAll('[data-choice]').forEach(button => {
    button.onclick = () => reveal(Number(button.dataset.choice));
  });
  const replay = $('replay');
  if (replay) replay.onclick = () => { round = newRound(); render(); $('listen').focus(); };
  if (focusTitle) $('slide-title').focus();
  save();
}

$('prev').onclick = () => move(-1);
$('next').onclick = () => move(1);
$('listen').onclick = listen;
$('answer').onclick = () => reveal();
$('another').onclick = advance;
$('jump').onclick = () => move(quizSlide - index);
$('mode').onchange = event => {
  if (event.target.value === mode) return;
  stopAudio();
  mode = event.target.value;
  round = rounds[mode] || newRound();
  render();
};
$('note').onclick = () => {
  $('notes').hidden = !$('notes').hidden;
  $('note').setAttribute('aria-expanded', String(!$('notes').hidden));
};
$('full').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { markStatus('Usa el control de pantalla completa del navegador.'); }
};

bindGameControls(id, {
  ...Object.fromEntries(Array.from({ length: 6 }, (_, index) => ['answer' + (index + 1), () => {
    document.querySelectorAll(quizOpen() ? '[data-choice]' : '[data-audio], [data-phrase]')[index]?.click();
  }])),
  confirm: listen,
  next: advance,
  hint: () => reveal(),
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable) return;
  const shortcut = { l: 'listen', r: 'answer', o: 'another', n: 'note', f: 'full', PageDown: 'next', PageUp: 'prev', ArrowLeft: 'prev' };
  const button = $(shortcut[event.key] || shortcut[event.key.toLowerCase()]);
  if (button && !button.hidden) { event.preventDefault(); button.click(); }
  if (event.key === 'Escape' && !$('notes').hidden) { $('note').click(); $('note').focus(); }
});
render();
