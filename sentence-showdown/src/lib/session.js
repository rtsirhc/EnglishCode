import { listeningTraps, speakingTraps } from './sentences.js';

const other = player => player === 'p1' ? 'p2' : 'p1';
const normalize = text => text.normalize('NFC').toLowerCase().replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const skipPhases = ['betting', 'buzzer_ready', 'buzzer_active', 'listening_active', 'speaking_active'];

export function createSession(roomCode, changed, pack) {
    let timer, turn = 0;
    const custom = pack?.items.map(item => item.correct ? item.text : item.correction);
    const banks = { listening: custom ?? listeningTraps, speaking: custom ?? speakingTraps };
    const used = { listening: new Set(), speaking: new Set() };
    const members = new Map();
    const state = { roomCode, players: { p1: null, p2: null }, winner: null };
    function clearTimer() {
        clearTimeout(timer);
        state.listeningTimerStart = null;
    }
    function resetRound(phase) {
        clearTimer();
        Object.assign(state, {
            phase, bets: { p1: null, p2: null }, currentQuestion: null, questionType: null,
            activePlayer: null, buzzerWinner: null, stealRequest: null, lastResult: null,
            submittedAnswer: null, listeningTimerSeconds: 30, turn: ++turn
        });
    }
    resetRound('lobby');

    function pick(type) {
        const bank = banks[type];
        if (used[type].size === bank.length) used[type].clear();
        const available = bank.map((_, index) => index).filter(index => !used[type].has(index));
        const index = available[Math.floor(Math.random() * available.length)];
        used[type].add(index);
        return { sentence: bank[index] };
    }
    function finish(result) {
        clearTimer();
        state.lastResult = result;
        const { p1, p2 } = state.players;
        state.winner = p1.balance >= 100000 || p2.balance <= 0 ? 'p1' :
            p2.balance >= 100000 || p1.balance <= 0 ? 'p2' : null;
        state.phase = state.winner ? 'game_over' : 'round_result';
    }
    function correct(override = false) {
        const winner = state.activePlayer;
        const amount = state.bets[winner];
        state.players[winner].balance += amount;
        finish({ winner, loser: other(winner), amount, correct: true, override });
    }
    function startTimer() {
        clearTimer();
        state.turn = ++turn;
        state.listeningTimerStart = Date.now();
        timer = setTimeout(expire, 30000);
    }
    function miss(timedOut) {
        const loser = state.activePlayer;
        const winner = other(loser);
        const amount = Math.min(state.bets[winner], state.players[loser].balance);
        state.players[loser].balance -= amount;
        state.players[winner].balance += amount;
        finish({ winner, loser, amount, correct: false, timedOut });
        if (!state.winner) {
            state.phase = 'listening_active';
            state.activePlayer = winner;
            state.lastResult.turnSwitch = true;
            state.submittedAnswer = null;
            startTimer();
        }
    }
    function expire() {
        if (state.phase === 'listening_active' && Date.now() >= state.listeningTimerStart + 30000) {
            miss(true);
            changed();
        }
    }
    function join(sender, name) {
        if (members.has(sender)) return { success: true, playerKey: members.get(sender) };
        const playerKey = ['p1', 'p2'].find(key => !state.players[key]);
        if (!playerKey || state.phase !== 'lobby') return { success: false, error: 'Room is full.' };
        if (typeof name !== 'string' || !name.trim() || name.length > 20) return { success: false, error: 'Enter a nickname of up to 20 characters.' };
        members.set(sender, playerKey);
        state.players[playerKey] = { name: name.trim(), balance: 1000 };
        return { success: true, playerKey };
    }
    function leave(sender) {
        const playerKey = members.get(sender);
        if (!playerKey) return;
        members.delete(sender);
        state.players[playerKey] = null;
        if (state.phase !== 'lobby') {
            for (const player of Object.values(state.players)) if (player) player.balance = 1000;
            used.listening.clear();
            used.speaking.clear();
            state.winner = null;
            resetRound('lobby');
        }
        changed();
    }
    function snapshot(playerKey) {
        const shared = { ...state, players: Object.fromEntries(Object.entries(state.players).map(
            ([key, player]) => [key, player && { ...player }]
        )) };
        if (!playerKey) return shared;
        const opponent = other(playerKey);
        const shareSentence = state.questionType === 'speaking' && state.phase === 'speaking_active' ||
            ['round_result', 'game_over'].includes(state.phase);
        const { bets, submittedAnswer, ...playerState } = shared;
        return {
            ...playerState, playerKey, currentQuestion: shareSentence ? state.currentQuestion : null,
            myBalance: state.players[playerKey].balance, myBet: bets[playerKey],
            opponentBalance: state.players[opponent]?.balance ?? 0, opponentName: state.players[opponent]?.name ?? 'Waiting…',
            myBetLocked: bets[playerKey] !== null, opponentBetLocked: bets[opponent] !== null,
            isActivePlayer: state.activePlayer === playerKey
        };
    }
    function command(player, event, data) {
        expire();
        const { phase } = state;
        const reject = { success: false, error: 'Action unavailable in this phase.' };
        let isCorrect;
        if (player) {
            if (data.turn !== state.turn) return reject;
            if (event === 'place_bet' && phase === 'betting' && state.bets[player] === null &&
                Number.isSafeInteger(data.amount) && data.amount >= 1) {
                state.bets[player] = Math.min(data.amount, state.players[player].balance);
                if (Object.values(state.bets).every(bet => bet !== null)) state.phase = 'buzzer_ready';
            } else if (event === 'buzzer_tap' && phase === 'buzzer_active') {
                state.activePlayer = state.buzzerWinner = player;
                state.phase = state.questionType === 'listening' ? 'listening_active' : 'speaking_active';
                if (state.phase === 'listening_active') startTimer();
            } else if (event === 'submit_answer' && phase === 'listening_active' && state.activePlayer === player &&
                typeof data.answer === 'string' && data.answer.trim() && data.answer.length <= 2000) {
                state.submittedAnswer = data.answer;
                isCorrect = normalize(data.answer) === normalize(state.currentQuestion.sentence);
                if (isCorrect) correct();
                else miss(false);
            } else if (event === 'request_steal' && phase === 'speaking_active' &&
                state.activePlayer !== player && !state.stealRequest) {
                state.stealRequest = { from: player, pending: true };
            } else return reject;
        } else if (event === 'start_game' && phase === 'lobby' && state.players.p1 && state.players.p2) {
            resetRound('select_question');
        } else if (event === 'select_question_type' && phase === 'select_question' && Object.hasOwn(banks, data.type)) {
            resetRound('betting');
            state.questionType = data.type;
            state.currentQuestion = pick(data.type);
        } else if (event === 'release_buzzer' && phase === 'buzzer_ready') state.phase = 'buzzer_active';
        else if (event === 'host_override' && phase === 'listening_active' ||
                 event === 'mark_correct_speaking' && phase === 'speaking_active') correct(event === 'host_override');
        else if (event === 'skip_timer' && phase === 'listening_active') miss(true);
        else if (event === 'skip_question' && skipPhases.includes(phase)) finish({ skipped: true });
        else if (event === 'mark_all_correct' && ['listening_active', 'speaking_active'].includes(phase)) {
            for (const key of ['p1', 'p2']) state.players[key].balance += state.bets[key];
            finish({ allCorrect: true, correct: true });
        } else if (['approve_steal', 'deny_steal'].includes(event) && phase === 'speaking_active' && state.stealRequest) {
            if (event === 'approve_steal') state.activePlayer = state.stealRequest.from;
            state.stealRequest = null;
        } else if (event === 'next_round' && phase === 'round_result') resetRound('select_question');
        else if (event === 'new_game' && phase === 'game_over') {
            for (const player of Object.values(state.players)) player.balance = 1000;
            used.listening.clear();
            used.speaking.clear();
            state.winner = null;
            resetRound('select_question');
        } else return reject;
        return { success: true, isCorrect };
    }
    return { join, leave, command, snapshot, members, close: clearTimer };
}
