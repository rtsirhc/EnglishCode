import assert from 'node:assert/strict';
import test from 'node:test';
import { makeDeck, isCorrect } from '../faro-games/semana_11/clinic_rally/bank.mjs';
import { createGame, rallyEngine } from '../faro-games/semana_11/clinic_rally/rally.mjs';

const config = { count: 2, minutes: 4, playlist: [0, 3, 1, 4, 2], dexterity: true, bank: 'custom' };
const pack = { items: [{ question: 'Choose a room', options: ['Hall', 'Waiting room'], answer: 'Waiting room', explanation: 'Patients wait here.' }] };

test('a team sees only its active task and retries cannot score twice', () => {
  const game = createGame('123456', 'local', config, pack);
  const engine = rallyEngine(game);
  const join = { code: game.code, team: 0 };
  const team = engine.request('join', join, 'cloud');
  assert.throws(() => engine.request('join', join, 'river'), /already has a screen/);
  assert.equal(engine.request('task', team, 'cloud').task, null);
  engine.admin('start');
  const { task } = engine.request('task', team, 'cloud');
  assert.equal(task.prompt, 'Choose a room');
  assert.equal('answer' in task, false);
  assert.equal('deck' in engine.snapshot().game, false);
  assert.throws(() => engine.request('task', team, 'river'), { status: 401 });
  const answer = { ...team, task: task.key, answer: '1', request: 'request-1' };
  const scored = engine.request('answer', answer, 'cloud');
  assert.equal(scored.steps, 1);
  assert.deepEqual(engine.request('answer', answer, 'cloud'), scored);
  assert.throws(() => engine.request('answer', { ...answer, request: 'retake' }, 'cloud'), { status: 409 });
  assert.equal(engine.snapshot().game.teams[0].total, 1);
  assert.equal(engine.leave('cloud'), true);
  const replacement = engine.request('join', join, 'river');
  assert.notEqual(replacement.token, team.token);
});

test('the deadline, pause, skill retries and next course preserve the intended scores', () => {
  let now = 10000;
  const game = createGame('123456', 'local', config, pack);
  const engine = rallyEngine(game, () => now);
  const team = engine.request('join', { code: game.code, team: 0 }, 'cloud');
  engine.admin('start');
  function respond(answer, request) {
    const { task } = engine.request('task', team, 'cloud');
    return engine.request('answer', { ...team, task: task.key, answer, request }, 'cloud');
  }
  respond('1', 'q1');
  respond('0', 'q2');
  respond('1', 'q3');
  const drill = engine.request('task', team, 'cloud').task;
  assert.equal(drill.type, 'swipe');
  assert.equal(respond(['up'], 'skill-wrong').correct, false);
  assert.equal(respond(drill.sequence, 'skill-correct').steps, 2);
  now += 60_000;
  assert.equal(engine.admin('pause').game.remaining, 180_000);
  now += 420_000;
  engine.admin('start');
  now += 180_000;
  assert.equal(engine.tick(), true);
  assert.equal(engine.tick(), false);
  assert.deepEqual(engine.snapshot().game.winners, [0]);
  const { game: next } = engine.admin('next');
  assert.equal(next.mode, 3);
  assert.equal(next.teams[0].wins, 1);
  assert.equal(next.teams[0].total, 2);
  assert.equal(next.teams[0].steps, 0);
});

test('authored banks contain solvable tasks and clozes have a visible blank', () => {
  for (const bank of ['health', 'mixed', 'review']) {
    for (const level of ['support', 'core', 'stretch']) {
      const deck = makeDeck(level, bank);
      assert.ok(deck.length > 12);
      assert.ok(deck.some(task => task.prompt.includes('_____')));
      assert.ok(deck.some(task => task.type === 'match'));
      for (const task of deck) {
        assert.equal(isCorrect(task, task.answer), true);
        if (task.type === 'choice' || task.type === 'picture') {
          assert.equal(task.options.filter(option => option.id === task.answer).length, 1);
        }
      }
    }
  }
});
