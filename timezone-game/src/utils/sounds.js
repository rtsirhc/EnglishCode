import { tone } from '../../../gallery/shared/sound.js';
export function playSound(name) {
    if (name !== 'timer') return tone(name === 'wrong' ? 'wrong' : 'correct');
}
