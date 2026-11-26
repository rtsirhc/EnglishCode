const MAX_BALANCE = 1_000_000_000_000;

export function wagerBounds(balance) {
    const max = balance > 0 ? balance : 10;
    return { min: Math.min(10, max), max };
}

export function scoreRound(teams, answer) {
    let pot = 0;
    const winners = [];
    const results = {};
    for (const team of teams) {
        if (team.lastChoice === answer) {
            winners.push(team);
            continue;
        }
        const missing = team.lastChoice === null;
        const change = missing ? 1000 : team.lastBet;
        team.bankroll -= change;
        pot += change;
        results[team.id] = { result: missing ? 'NO_VOTE' : 'LOSE', change };
    }
    const share = winners.length ? Math.floor(pot / winners.length) : 0;
    for (const team of winners) {
        const change = Math.min(team.lastBet + share, MAX_BALANCE - team.bankroll);
        team.bankroll += change;
        results[team.id] = { result: 'WIN', change };
    }
    return results;
}
