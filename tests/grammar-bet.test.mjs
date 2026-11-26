import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreRound, wagerBounds } from '../webrtc-betting-game/scoring.js';

test('correct teams earn their stake and split losses while debt still permits a positive wager', () => {
    const teams = [
        { id: 'correct', bankroll: 1000, lastChoice: 'F', lastBet: 200 },
        { id: 'wrong', bankroll: 1000, lastChoice: 'A', lastBet: 300 },
        { id: 'missed', bankroll: 100, lastChoice: null, lastBet: 0 }
    ];
    const results = scoreRound(teams, 'F');
    assert.deepEqual(teams.map(team => team.bankroll), [2500, 700, -900]);
    assert.deepEqual(results.missed, { result: 'NO_VOTE', change: 1000 });
    assert.deepEqual(wagerBounds(-900), { min: 10, max: 10 });
    assert.deepEqual(wagerBounds(5), { min: 5, max: 5 });
    assert.deepEqual(wagerBounds(700), { min: 10, max: 700 });
});

test('repeated all-in wins stay within an exact integer balance', () => {
    const team = { id: 'winner', bankroll: 1000, lastChoice: 'A' };
    for (let round = 0; round < 500; round++) {
        team.lastBet = wagerBounds(team.bankroll).max;
        scoreRound([team], 'A');
        assert.ok(Number.isSafeInteger(team.bankroll));
    }
    assert.equal(team.bankroll, 1_000_000_000_000);
});
