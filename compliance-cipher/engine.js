const normalize = value => value.trim().toLocaleUpperCase('en').replace(/\s+/g, ' ');
export class CipherGame {
    constructor(challenges, now = Date.now) {
        this.challenges = challenges;
        this.now = now;
        this.teams = new Map();
    }
    join(id, name, restored) {
        if (typeof name !== 'string' || !name.trim()) throw new Error('Enter a team name.');
        if (!this.teams.has(id)) {
            const valid = restored && Number.isInteger(restored.level) && restored.level >= 0 &&
                restored.level <= this.challenges.length && Number.isInteger(restored.hintsUsed) &&
                restored.hintsUsed >= 0 && restored.hintsUsed <= 2 &&
                Number.isInteger(restored.penaltySeconds) && restored.penaltySeconds >= 0 &&
                restored.penaltySeconds <= this.challenges.length * 360 &&
                Number.isSafeInteger(restored.elapsedSeconds) && restored.elapsedSeconds >= 0 && restored.elapsedSeconds <= 31536000;
            const state = valid ? restored : { level: 0, hintsUsed: 0, penaltySeconds: 0, elapsedSeconds: 0 };
            this.teams.set(id, {
                ...state, name: name.trim().slice(0, 60), connected: true,
                startedAt: this.now() - state.elapsedSeconds * 1000,
                finished: state.level === this.challenges.length
            });
        }
        const team = this.teams.get(id);
        team.connected = true;
        team.name = name.trim().slice(0, 60);
        return this.snapshot(id);
    }
    command(id, action, { level, passcode } = {}) {
        const team = this.teams.get(id);
        if (!team) throw new Error('Join the game first.');
        if (action === 'restart') {
            this.teams.delete(id);
            return { state: this.join(id, team.name) };
        }
        if (team.finished) return { state: this.snapshot(id) };
        if (level !== team.level) return { state: this.snapshot(id), error: 'This stage changed. Read the current clue and try again.' };
        if (action === 'hint') {
            if (team.hintsUsed >= 2) return { state: this.snapshot(id), error: 'Both hints have been used for this stage.' };
            team.penaltySeconds += team.hintsUsed === 0 ? 60 : 300;
            team.hintsUsed++;
        } else if (action === 'submit') {
            if (typeof passcode !== 'string' || passcode.length > 120 || normalize(passcode) !== normalize(this.challenges[team.level].word)) {
                return { state: this.snapshot(id), error: 'Incorrect key. Check the clue and try again.' };
            }
            team.level++;
            team.hintsUsed = 0;
            if (team.level === this.challenges.length) {
                team.finished = true;
                team.elapsedSeconds = Math.max(0, Math.floor((this.now() - team.startedAt) / 1000));
            }
        } else throw new Error('Unknown game action.');
        return { state: this.snapshot(id) };
    }
    snapshot(id) {
        const team = this.teams.get(id);
        const challenge = this.challenges[team.level];
        return {
            name: team.name, level: team.level, total: this.challenges.length,
            progress: Math.round(team.level / this.challenges.length * 100),
            hintsUsed: team.hintsUsed, penaltySeconds: team.penaltySeconds,
            elapsedSeconds: team.finished ? team.elapsedSeconds : Math.max(0, Math.floor((this.now() - team.startedAt) / 1000)),
            finished: team.finished, connected: team.connected,
            clue: challenge?.clue || '',
            hint: challenge && team.hintsUsed ? challenge.hints[team.hintsUsed - 1] : ''
        };
    }
    leaderboard() {
        return [...this.teams.keys()].map(id => {
            const { name, progress, elapsedSeconds, penaltySeconds, finished, connected } = this.snapshot(id);
            return { name, progress, elapsedSeconds, penaltySeconds, finished, connected };
        }).sort((a, b) => b.progress - a.progress || (a.elapsedSeconds + a.penaltySeconds) - (b.elapsedSeconds + b.penaltySeconds));
    }
    disconnect(id) { if (this.teams.has(id)) this.teams.get(id).connected = false; }
}
