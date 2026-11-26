import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, next, question, score, standings, undo } from '../faro-games/semana_12/monster_smiles/engine.js';

test('custom quiz cycles without adjacent repeats and undo keeps its question bank', () => {
  const customQuestions = [
    { question: 'Choose a color', answer: 'Red', options: ['Red', 'Table'] },
    { question: 'Choose a place', answer: 'Library', options: ['Run', 'Library'] },
  ];
  const game = newGame({ sizes:[1,1], rounds:4, customQuestions });
  assert.equal(game.deck.length,8);
  assert.ok(game.deck.slice(1).every((id,index)=>id!==game.deck[index]));
  const clue=question(game);
  game.phase='answer';
  assert.ok(score(game,false));
  assert.equal(game.teams[0].teeth,7);
  assert.equal(score(game,false),false);
  const previous=undo(game);
  assert.equal(previous.teams[0].teeth,8);
  assert.equal(previous.paused,true);
  assert.deepEqual(question(previous),clue);
  assert.ok(!game.history[0].includes('customQuestions'));
});

test('the largest authored game completes with unique prompts and balanced turns', () => {
  const game=newGame({sizes:[2,2,2,2,2,2],rounds:20});
  assert.equal(new Set(game.deck).size,120);
  while(game.phase!=='finished'){
    assert.ok(question(game));
    game.phase='answer';
    assert.ok(score(game,true));
    assert.ok(next(game));
  }
  assert.ok(standings(game).every(team=>team.played===20&&team.teeth===8));
});
