import assert from 'node:assert/strict';
import test from 'node:test';
import { accept, buzz, createGame, flow, matchAnswer, pot, publicView, strike, undo } from '../faro-games/family-feud/engine.js';

const sample = ['Name a public place.', [
  ['Library',['public library'],50],['Park',['green space'],30],['Market',['shop'],20],
]];

test('face-off, steal and undo award each board once without leaking hidden answers', () => {
  const game=createGame([sample],['River','Cloud'],'1');
  assert.equal(publicView(game).question,'');
  assert.equal(flow(game),true);
  assert.equal(buzz(game,0),true);
  assert.equal(buzz(game,1),false);
  assert.deepEqual(publicView(game).answers,[null,null,null]);
  assert.deepEqual(matchAnswer(game,'PUBLIC LIBRARY.'),{kind:'match',index:0});
  assert.equal(accept(game,1),true);
  assert.equal(game.round.active,1);
  assert.equal(accept(game,0),true);
  assert.equal(game.round.owner,1);
  assert.deepEqual(matchAnswer(game,'green space'),{kind:'duplicate',index:1});
  for(let i=0;i<3;i++)strike(game);
  assert.equal(game.round.phase,'steal');
  assert.equal(accept(game,2),true);
  assert.deepEqual(game.scores,[100,0]);
  assert.equal(accept(game,2),false);
  assert.equal(undo(game),true);
  assert.deepEqual(game.scores,[0,0]);
  assert.equal(game.round.phase,'steal');
  assert.equal(publicView(game).answers[2],null);
  assert.equal(strike(game),true);
  assert.deepEqual(game.scores,[0,80]);
  assert.equal(flow(game),true);
  assert.equal(pot(game),80);
  assert.equal(publicView(game).answers[2].found,false);
  assert.equal(flow(game),true);
  assert.equal(game.finished,true);
});

test('four opening misses close the survey and the third round doubles the points', () => {
  const game=createGame(Array(4).fill(sample),['A','B'],'2');
  flow(game);
  buzz(game,0);
  for(let i=0;i<4;i++)strike(game);
  assert.equal(game.round.phase,'done');
  assert.deepEqual(game.scores,[0,0]);
  for(let i=0;i<5;i++)flow(game);
  buzz(game,0);
  for(let i=0;i<3;i++)accept(game,i);
  assert.deepEqual(game.scores,[100,0]);
  flow(game);flow(game);buzz(game,0);
  for(let i=0;i<3;i++)accept(game,i);
  assert.deepEqual(game.scores,[300,0]);
});
