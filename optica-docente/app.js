'use strict';

const byId = (id) => document.getElementById(id);
const grade = byId('grade');
const picker = byId('game');
let deck;
let index = 0;
let deadline = 0;
let clock = 0;

function decode(value) {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (character) => character.charCodeAt(0));
}

function stopClock() {
  window.clearInterval(clock);
  deadline = 0;
}

function resetClock() {
  stopClock();
  byId('timer-button').textContent = selectedGame().seconds + ' s · Iniciar';
}

function selectedGame() {
  return deck.games[Number(picker.value)];
}

function cards() {
  return selectedGame().levels[Number(grade.value)];
}

function render() {
  const game = selectedGame();
  const [mode, prompt, direction, answer] = cards()[index];

  byId('rules').textContent = game.rules;
  byId('counter').textContent = (Number(picker.value) === 3 ? 'Turno ' : 'Tarjeta ') + (index + 1) + ' de ' + cards().length;
  byId('mode').textContent = mode;
  byId('prompt').textContent = prompt;
  byId('direction').textContent = direction;
  byId('answer').textContent = answer;
  byId('answer').hidden = true;
  byId('reveal').textContent = 'Ver ejemplo';
  byId('reveal').setAttribute('aria-expanded', 'false');
  byId('back').disabled = index === 0;
  byId('next').disabled = index === cards().length - 1;
  save('position', JSON.stringify([grade.value,picker.value,index]));
  resetClock();
}

function updateClock() {
  const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (seconds === 0) stopClock();
  byId('timer-button').textContent = seconds ? seconds + ' s · Reiniciar' : 'Tiempo · Iniciar';
}

const storagePrefix = 'englishcode.optica.';
function read(name) { try { return localStorage.getItem(storagePrefix+name); } catch { return null; } }
function save(name,value) { try { localStorage.setItem(storagePrefix+name,value); } catch {} }
async function start(keyText = location.hash.slice(1) || read('access') || '') {
  if (!/^[\w-]{43}$/.test(keyText)) {
    byId('unlock').hidden = false;
    byId('locked').textContent = 'Usa tu enlace privado la primera vez en este navegador.';
    return;
  }
  try {
    const response = await fetch('./deck.enc');
    if (!response.ok) throw new Error('Deck unavailable');
    const buffer = new Uint8Array(await response.arrayBuffer());
    const key = await crypto.subtle.importKey('raw', decode(keyText), 'AES-GCM', false, ['decrypt']);
    const clear = await crypto.subtle.decrypt({name:'AES-GCM',iv:buffer.slice(0,12)}, key, buffer.slice(12));
    deck = JSON.parse(new TextDecoder().decode(clear));
    deck.games.forEach((game, position) => picker.add(new Option(game.name, position)));
    deck.words.forEach((line) => {
      const item = document.createElement('p');
      item.textContent = line;
      byId('words').append(item);
    });
    save('access',keyText);
    byId('unlock').hidden = true;
    try {
      const [level,game,card] = JSON.parse(read('position'));
      if (deck.games[game]?.levels[level]?.[card] && Number.isInteger(card)) {
        grade.value=level; picker.value=game; index=card;
      }
    } catch {}
    render();
    byId('locked').hidden = true;
    byId('panel').hidden = false;
  } catch {
    byId('unlock').hidden = false;
    byId('locked').textContent = 'No se pudo abrir el panel. Comprueba tu conexión y vuelve a abrir el enlace privado.';
  }
}

for (const select of [grade, picker]) {
  select.addEventListener('change', () => { index = 0; render(); });
}
byId('back').onclick = () => { index -= 1; render(); };
byId('next').onclick = () => { index += 1; render(); };
byId('reveal').onclick = () => {
  const answer = byId('answer');
  answer.hidden = !answer.hidden;
  byId('reveal').textContent = answer.hidden ? 'Ver ejemplo' : 'Ocultar';
  byId('reveal').setAttribute('aria-expanded', String(!answer.hidden));
};
byId('timer-button').onclick = () => {
  stopClock();
  deadline = Date.now() + selectedGame().seconds * 1000;
  updateClock();
  clock = window.setInterval(updateClock, 200);
};

byId('unlock').onsubmit = event => {
  event.preventDefault();
  const value=byId('access').value.trim().split('#').pop();
  byId('access').value='';
  start(value);
};
start();
