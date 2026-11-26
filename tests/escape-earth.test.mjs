import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_DATA } from '../escape-planet-earth/js/game-data.js';
import { createEscapeSession } from '../escape-planet-earth/js/session.js';

test('escape rooms keep team progress separate and only award completion after the final code', () => {
  let now = 1000;
  const game = createEscapeSession(() => now);
  assert.equal(game.start(), false);
  assert.equal(game.join('a', 'Cloud'), true);
  assert.equal(game.join('b', 'River'), true);
  assert.equal(game.join('c', 'river'), false);
  assert.equal(game.start(), true);
  const state = () => game.snapshot('a');
  const send = (event, value) => game.command('a', event, { revision: state().revision, value });
  assert.ok(send('begin'));
  const oldRevision = state().revision;
  assert.ok(send('hint'));
  assert.equal(game.command('a', 'hint', { revision: oldRevision }), false);
  assert.ok(send('hint'));
  assert.equal(send('hint'), false);
  assert.equal(state().penalty, 360000);
  for (const room of GAME_DATA.rooms) {
    for (const question of room.questions) {
      assert.ok(send('answer', question.correctIndex ?? question.correctAnswer));
      assert.ok(send('continue'));
    }
    assert.ok(send('unlock', 'wrong'));
    assert.equal(state().phase, 'code');
    assert.ok(send('unlock', room.codeWord));
    assert.equal(send('unlock', room.codeWord), false);
    assert.ok(send('continue'));
  }
  assert.equal(state().progress, 99);
  assert.equal(state().finalLetters.slice().sort().join(''), [...GAME_DATA.finalEscape.answer].sort().join(''));
  assert.ok(send('escape', 'planet'));
  assert.equal(state().progress, 100);
  now += 5000;
  assert.equal(game.leaderboard()[0].elapsed, 0);
  assert.equal(game.snapshot('b').phase, 'story');
  assert.equal(game.leaderboard()[1].elapsed, 5000);
});
