import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CipherGame } from '../compliance-cipher/engine.js';
import { challenges } from '../compliance-cipher/challenges.js';

test('stage checks prevent duplicate answers from skipping a challenge', () => {
    const game = new CipherGame(challenges);
    game.join('team', 'Team');
    assert.match(game.command('team', 'submit', {level:0, passcode:'wrong'}).error, /Incorrect/);
    assert.equal(game.command('team', 'submit', {level:0, passcode:' plan-3 '}).state.level, 1);
    assert.match(game.command('team', 'submit', {level:0, passcode:'PLAN-3'}).error, /changed/);
    assert.equal(game.snapshot('team').level, 1);
});
test('hints charge 60 then 300 seconds once per stage and restart on the next stage', () => {
    const game = new CipherGame(challenges);
    game.join('team', 'Team');
    game.command('team', 'hint', {level:0});
    game.command('team', 'hint', {level:0});
    assert.equal(game.snapshot('team').penaltySeconds, 360);
    assert.match(game.command('team', 'hint', {level:0}).error, /Both/);
    game.command('team', 'submit', {level:0, passcode:'PLAN-3'});
    assert.equal(game.snapshot('team').hintsUsed, 0);
    game.command('team', 'hint', {level:1});
    assert.equal(game.snapshot('team').penaltySeconds, 420);
});
test('completion freezes the authoritative clock and saved solo state resumes', () => {
    let now = 100000;
    const game = new CipherGame(challenges, () => now);
    game.join('team', 'Team');
    now += 10000;
    for (let level = 0; level < challenges.length; level++) {
        game.command('team', 'submit', {level, passcode:challenges[level].word});
    }
    const saved = game.snapshot('team');
    assert.equal(saved.finished, true);
    now += 60000;
    assert.equal(game.snapshot('team').elapsedSeconds, 10);
    const resumed = new CipherGame(challenges, () => now);
    assert.equal(resumed.join('team', 'Team', saved).elapsedSeconds, 10);
    assert.equal(resumed.command('team', 'restart').state.level, 0);
    assert.equal(resumed.snapshot('team').penaltySeconds, 0);
});

test('classroom teams keep independent progress and reconnect to their own stage', () => {
    const game = new CipherGame(challenges);
    game.join('first', 'First');
    game.join('second', 'Second');
    game.command('first', 'hint', {level:0});
    game.command('first', 'submit', {level:0,passcode:'PLAN-3'});
    assert.equal(game.snapshot('second').level, 0);
    assert.equal(game.snapshot('second').penaltySeconds, 0);
    game.disconnect('first');
    assert.equal(game.snapshot('first').connected, false);
    assert.equal(game.join('first', 'First').level, 1);
    assert.equal(game.leaderboard().length, 2);
    assert.equal('clue' in game.leaderboard()[0], false);
});
