import { read, write } from './storage.js';
export const ACTIONS = ['answer1', 'answer2', 'answer3', 'answer4', 'answer5', 'answer6', 'answer7', 'answer8', 'confirm', 'next', 'buzzer', 'hint'];
export const DEFAULT_KEYS = { answer1: 'Digit1', answer2: 'Digit2', answer3: 'Digit3', answer4: 'Digit4', answer5: 'Digit5', answer6: 'Digit6', answer7: 'Digit7', answer8: 'Digit8', confirm: 'Enter', next: 'ArrowRight', buzzer: 'Space', hint: 'KeyH' };
export const DEFAULT_BUTTONS = { answer1: 0, answer2: 1, answer3: 2, answer4: 3, answer5: 6, answer6: 7, answer7: 10, answer8: 11, confirm: 9, next: 5, buzzer: 4, hint: 8 };
export function resolveMapping(saved = {}) {
  const result = {};
  for (const [type, defaults] of [['keys', DEFAULT_KEYS], ['buttons', DEFAULT_BUTTONS]]) {
    const values = {};
    const used = new Set();
    const isValid = value => type === 'keys' ? typeof value === 'string' && value.length > 0 : Number.isInteger(value) && value >= 0 && value <= 31;
    for (const action of ACTIONS) {
      const value = saved?.[type]?.[action];
      if (isValid(value) && !used.has(value)) { values[action] = value; used.add(value); }
    }
    const alternatives = type === 'buttons'
      ? Array.from({length:32}, (_, index) => index)
      : [...Object.values(DEFAULT_KEYS), ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => 'Key' + letter), ...Array.from({length:12}, (_, index) => 'F' + (index + 1))];
    for (const action of ACTIONS) {
      if (Object.hasOwn(values, action)) continue;
      const value = used.has(defaults[action]) ? alternatives.find(candidate => !used.has(candidate)) : defaults[action];
      values[action] = value; used.add(value);
    }
    result[type] = values;
  }
  return result;
}
export function mapping() { return resolveMapping(read('input', {})); }
export function saveMapping(value) {
  for (const type of ['keys', 'buttons']) {
    const values = ACTIONS.map(a => value[type]?.[a]);
    if (values.some(v => type === 'keys' ? typeof v !== 'string' || !v : !Number.isInteger(v) || v < 0 || v > 31)) throw new Error('Each action needs a valid key or gamepad button (0–31).');
    if (new Set(values).size !== values.length) throw new Error('Assign a different key/button to each action.');
  }
  if (!write('input', value)) throw new Error('Your browser could not save the input mapping.');
}
export function listenInput(onAction, supported = ACTIONS) {
  let raf, previous = new Set(), alive = true;
  const editable = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  function key(event) {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || editable()) return;
    const action = Object.entries(mapping().keys).find(([, code]) => code === event.code)?.[0];
    if (['Enter', 'Space'].includes(event.code) && event.target.closest?.('button, a[href], summary')) return;
    if (supported.includes(action)) { event.preventDefault(); onAction(action, { type: 'keyboard', code: event.code }); }
  }
  function poll() {
    if (!alive) return;
    const held = new Set();
    let pads = [];
    try { pads = navigator.getGamepads?.() || []; } catch { /* unavailable in embedded browsers */ }
    for (const pad of pads) {
      if (!pad) continue;
      for (const [action, index] of Object.entries(mapping().buttons)) {
        if (!supported.includes(action)) continue;
        const key = `${pad.index}:${index}`;
        if (pad.buttons[index]?.pressed) { held.add(key); if (!previous.has(key)) onAction(action, { type: 'gamepad', index: pad.index, button: index }); }
      }
    }
    previous = held;
    raf = requestAnimationFrame(poll);
  }
  document.addEventListener('keydown', key); raf = requestAnimationFrame(poll);
  return () => { alive = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', key); };
}
