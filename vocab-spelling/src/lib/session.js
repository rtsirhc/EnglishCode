import words from '../data/spelling-bank.js';

const LIMIT = 1_000_000_000;
const normalize = text => text.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
const bounded = amount => Math.max(-LIMIT, Math.min(LIMIT, amount));

export function createSession(pack, onFinish) {
  const source = pack?.items ?? words.map(word => ({ word }));
  let deck, state, studentConnected, previousStreak, loss;
  function restart() {
    deck = [...source];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    state = {
      phase: 'betting', money: 1, currentWordIndex: 0, currentBet: 0, streak: 0,
      reviewList: [], wordsCompleted: 0, gameStartTime: null, suddenDeath: false,
      betPlaced: false, doubleAccepted: false, resultType: null, lastTypedAnswer: ''
    };
  }
  restart();

  function snapshot(role) {
    const item = deck[state.currentWordIndex];
    const visible = role === 'Teacher' || ['result', 'finished'].includes(state.phase);
    const { lastTypedAnswer, ...shared } = state;
    return {
      ...shared, totalWords: deck.length, teacherConnected: true, studentConnected: Boolean(studentConnected),
      currentWord: visible ? item.word : undefined,
      currentClue: role === 'Teacher' ? item.clue : undefined,
      lastTypedAnswer: visible ? lastTypedAnswer : undefined
    };
  }
  function bet(amount) {
    const max = state.money > 0 ? state.money : Math.abs(state.money) + 1;
    state.currentBet = Math.min(amount, max);
    state.betPlaced = true;
    state.phase = 'typing';
    state.gameStartTime ??= Date.now();
  }
  function next() {
    if (state.currentWordIndex + 1 === deck.length) {
      state.phase = 'finished';
      state.elapsedTime = Math.round((Date.now() - state.gameStartTime) / 1000);
      state.timePenalty = Math.floor(Math.max(0, -state.money) / 100) * 60;
      state.finalTime = state.elapsedTime + state.timePenalty;
      onFinish(state, deck.length);
      return;
    }
    state.currentWordIndex++;
    Object.assign(state, {
      currentBet: 0, betPlaced: false, resultType: null, lastTypedAnswer: '',
      doubleAccepted: false, suddenDeath: (state.currentWordIndex + 1) % 15 === 0
    });
    state.phase = state.streak > 0 && state.streak % 3 === 0 ? 'doublePrompt' : 'betting';
    if (state.suddenDeath) bet(LIMIT + 1);
  }
  function command(role, event, data) {
    const { phase } = state;
    if (role === 'Student') {
      if (event === 'place_bet' && phase === 'betting' && Number.isSafeInteger(data.amount) && data.amount > 0) bet(data.amount);
      else if (event === 'double_bet_response' && phase === 'doublePrompt' && typeof data.accepted === 'boolean') {
        state.doubleAccepted = data.accepted;
        if (!data.accepted) state.streak = 0;
        state.phase = 'betting';
      } else return false;
      return true;
    }
    if (role !== 'Teacher') return false;
    const stake = state.currentBet * (state.doubleAccepted ? 2 : 1);
    if (event === 'submit_answer' && phase === 'typing' && typeof data.answer === 'string' && data.answer.trim() && data.answer.length <= 240) {
      const { word } = deck[state.currentWordIndex];
      const correct = normalize(data.answer) === normalize(word);
      previousStreak = state.streak;
      const updated = bounded(state.money + (correct ? stake : -2 * stake));
      loss = state.money - updated;
      state.money = updated;
      state.lastTypedAnswer = data.answer.trim();
      state.phase = 'result';
      state.resultType = correct ? 'correct' : 'wrong';
      state.streak = correct ? previousStreak + 1 : 0;
      if (!correct) state.reviewList = [...state.reviewList, word];
      state.wordsCompleted++;
    } else if (event === 'override_correct' && phase === 'result' && state.resultType === 'wrong') {
      state.money = bounded(state.money + loss + stake);
      state.resultType = 'correct';
      state.streak = previousStreak + 1;
      state.reviewList = state.reviewList.slice(0, -1);
    } else if (event === 'set_money' && phase !== 'finished' && Number.isSafeInteger(data.amount)) {
      state.money = bounded(data.amount);
    } else if (event === 'next_round' && phase === 'result') next();
    else if (event === 'restart_game' && phase === 'finished') restart();
    else return false;
    return true;
  }
  return { command, snapshot, setStudent: connected => { studentConnected = connected; } };
}
