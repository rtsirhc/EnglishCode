import assert from 'node:assert/strict';
import test from 'node:test';
import { createSession } from '../vocab-spelling/src/lib/session.js';

test('spelling round protects answers and preserves wager, streak and review rules for the original bank', () => {
  let result;
  const game = createSession(null, state => { result = state; });
  const teacher = () => game.snapshot('Teacher');
  const submit = answer => game.command('Teacher', 'submit_answer', { answer });
  assert.equal(teacher().totalWords, 115);
  for (let i = 0; i < 115; i++) {
    assert.equal(game.snapshot('Student').currentWord, undefined);
    assert.equal(game.command('Teacher', 'next_round', {}), false);
    assert.equal(game.command('Student', 'submit_answer', { answer: teacher().currentWord }), false);
    if (teacher().phase === 'doublePrompt') game.command('Student', 'double_bet_response', { accepted: true });
    if (i % 15 === 14) assert.ok(teacher().suddenDeath && teacher().currentBet > 0 && teacher().phase === 'typing');
    else game.command('Student', 'place_bet', { amount: 1 });
    if (i === 3) {
      const before = teacher().money;
      assert.equal(teacher().doubleAccepted, true);
      submit('incorrect answer');
      assert.equal(teacher().money, before - 4);
      game.command('Teacher', 'override_correct', {});
      assert.equal(teacher().money, before + 2);
      assert.equal(teacher().streak, 4);
      assert.deepEqual(teacher().reviewList, []);
    } else submit(teacher().currentWord);
    assert.equal(game.snapshot('Student').currentWord, teacher().currentWord);
    game.command('Teacher', 'next_round', {});
  }
  assert.equal(result.wordsCompleted, 115);
  assert.equal(result.phase, 'finished');
  assert.equal(game.command('Teacher', 'next_round', {}), false);
  game.command('Teacher', 'restart_game', {});
  assert.equal(teacher().money, 1);
});

test('spelling counts repeated missed words as separate rounds and applies the debt time penalty', () => {
  const pack = { items: [{ word: 'apple' }, { word: 'apple' }] };
  const game = createSession(pack, () => {});
  game.command('Teacher', 'set_money', { amount: -100 });
  for (let i = 0; i < 2; i++) {
    game.command('Student', 'place_bet', { amount: 1 });
    game.command('Teacher', 'submit_answer', { answer: 'pear' });
    game.command('Teacher', 'next_round', {});
  }
  const state = game.snapshot('Teacher');
  assert.deepEqual(state.reviewList, ['apple', 'apple']);
  assert.equal(state.timePenalty, 60);
});
