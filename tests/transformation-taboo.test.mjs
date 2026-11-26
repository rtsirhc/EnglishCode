import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../transformation-taboo/src/session.js';

test('drill recycles missed sentences, keeps the key private and rejects student grades', () => {
  const game = createSession(() => {});
  const state = role => game.snapshot(role).game1;
  try {
    game.command('teacher', 'teacher_start_game1', { tenses: ['simple_present','simple_past'] });
    assert.equal(state('teacher').totalQuestions, 20);
    const first = state('teacher').current.id;
    const seen = new Set();
    game.command('student', 'student_reveal');
    game.command('student', 'teacher_grade', { correct: true });
    assert.equal(state('student').status, 'revealed');
    assert.equal(state('student').current.correct_answer, undefined);
    game.command('teacher', 'teacher_grade', { correct: false });
    game.command('student', 'game1_next');
    for (let i = 0; i < 20; i++) {
      assert.equal(state('student').current.original_sentence, '');
      seen.add(state('teacher').current.id);
      game.command('student', 'student_reveal');
      game.command('teacher', 'teacher_grade', { correct: true });
      game.command('teacher', 'teacher_grade', { correct: true });
      game.command('teacher', 'game1_next');
    }
    assert.equal(seen.size, 20);
    assert.ok(seen.has(first));
    assert.equal(state('student').correctCount, 20);
    assert.equal(state('student').status, 'win');
  } finally { game.close(); }
});

test('timer deadlines survive delayed callbacks and final card advances to results', t => {
  t.mock.timers.enable({ apis: ['Date','setTimeout'], now: 1000 });
  const game = createSession(() => {});
  game.command('teacher', 'teacher_start_game1', { tenses: ['future_simple'] });
  game.command('student', 'student_reveal');
  t.mock.timers.tick(10000);
  assert.equal(game.snapshot('teacher').game1.status, 'incorrect');
  game.command('teacher', 'teacher_reset');
  game.command('teacher', 'teacher_start_game2');
  for (let i = 0; i < 15; i++) {
    game.command('student', 'student_next_card');
    assert.equal(game.snapshot('teacher').game2.current.keyword, undefined);
    const { keyword } = game.snapshot('student').game2.current;
    if (i === 0) {
      t.mock.timers.tick(45000);
      assert.equal(game.snapshot('student').game2.studentTimedOut, true);
      t.mock.timers.setTime(Date.now() + 15001);
      game.command('teacher', 'teacher_guess', { guess: keyword });
      assert.equal(game.snapshot('teacher').game2.status, 'timeout');
    } else game.command('teacher', 'teacher_guess', { guess: keyword.toUpperCase() });
  }
  game.command('student', 'student_next_card');
  assert.equal(game.snapshot('student').phase, 'finished');
  assert.equal(game.snapshot('student').game2.score, 14);
  game.close();
});
