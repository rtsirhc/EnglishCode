import assert from 'node:assert/strict';
import test from 'node:test';
import { createGame, reduceGame, projectorState, winners } from '../classroom-feud/src/game.js';

test('projector sees revealed answers only and a late reveal expires the active turn exactly once', () => {
    let state = createGame([['Cloud'], ['River']]);
    const question = { question: 'Name a fruit.', answers: [{ text: 'Pear', points: 30 }, { text: 'Apple', points: 20 }] };
    const send = (type, now, details = {}) => { state = reduceGame(state, { type, now, ...details }); };
    assert.deepEqual(projectorState(state, question, 0).question.answers, [null, null]);
    send('toggle', 0);
    send('toggle', 5000);
    assert.equal(projectorState(state, question, 10000).timerRemaining, 10);
    send('toggle', 10000);
    send('reveal', 20000, { index: 0, points: 30 });
    assert.equal(state.event, 'strike');
    assert.equal(state.activeTalkerId, 2);
    const card = { index: 0, points: 30, total: 2 };
    send('reveal', 20200, card);
    send('reveal', 20200, card);
    assert.deepEqual(state.teams.map(team => team.score), [0, 30]);
    assert.deepEqual(projectorState(state, question, 20200).question.answers, [question.answers[0], null]);
    send('reveal', 20300, { index: 1, points: 20, total: 2 });
    assert.equal(state.deadline, null);
    send('next', 20400, { total: 1 });
    assert.deepEqual(winners(state), [2]);
    send('replay', 20500);
    assert.deepEqual(state.teams.map(team => team.score), [0, 0]);
});
