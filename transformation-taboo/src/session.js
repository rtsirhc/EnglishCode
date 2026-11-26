import questionBank from './data/game1QuestionBank.js';
import cards from './data/game2Cards.js';

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectQuestions(tenses) {
  const pools = shuffle([...new Set(tenses)]).map(tense =>
    shuffle(questionBank.filter(q => q.tense === tense))
  ).filter(pool => pool.length);
  const selected = [];
  while (selected.length < 20 && pools.some(pool => pool.length)) {
    for (const pool of pools) {
      if (pool.length && selected.length < 20) selected.push(pool.pop());
    }
  }
  return shuffle(selected);
}

export function createSession(changed, pack = null) {
  let phase, drill, taboo, queue, deck, timer;
  function reset() {
    clearTimeout(timer);
    phase = 'lobby';
    drill = { current: null, status: 'idle', correctCount: 0, totalQuestions: 0 };
    taboo = { current: null, status: 'idle', roundIndex: 0, score: 0, guesses: [] };
    queue = [];
    deck = [];
  }
  reset();

  function snapshot(role) {
    const game1 = { ...drill, remainingInQueue: queue.length };
    if (role === 'student' && drill.current) {
      const { tense, request, original_sentence } = drill.current;
      game1.current = { tense, request, original_sentence: drill.status === 'idle' ? '' : original_sentence };
    }
    const game2 = { ...taboo };
    if (role === 'teacher' && taboo.status === 'active') {
      game2.current = { taboo_words: taboo.current.taboo_words };
    }
    return { phase, game1, game2 };
  }

  function nextQuestion() {
    drill.current = queue.shift() ?? null;
    drill.status = drill.current ? 'idle' : 'win';
    drill.revealedAt = null;
  }
  function grade(correct) {
    clearTimeout(timer);
    drill.status = correct ? 'correct' : 'incorrect';
    if (correct) drill.correctCount++;
    else queue.splice(Math.min(queue.length, 1 + Math.floor(Math.random() * queue.length)), 0, drill.current);
  }
  function expire() {
    const now = Date.now();
    if (phase === 'game1' && drill.status === 'revealed' && now >= drill.revealedAt + 10000) {
      grade(false);
      changed();
    }
    if (phase === 'game2' && taboo.status === 'active') {
      if (now >= taboo.startedAt + 60000) {
        clearTimeout(timer);
        taboo.status = 'timeout';
        changed();
      } else if (!taboo.studentTimedOut && now >= taboo.startedAt + 45000) {
        taboo.studentTimedOut = true;
        clearTimeout(timer);
        timer = setTimeout(expire, taboo.startedAt + 60000 - now);
        changed();
      }
    }
  }
  function command(role, event, data = {}) {
    expire();
    if (role === 'teacher' && event === 'teacher_reset') reset();
    else if (role === 'teacher' && event === 'teacher_start_game1' && phase === 'lobby') {
      if (pack && data.custom) {
        queue = shuffle(pack.items).slice(0, 20).map(item => ({
          tense: pack.level, request: 'Correct the sentence if needed, or say it is already correct.',
          original_sentence: item.text, correct_answer: item.correct ? item.text : item.correction
        }));
      } else if (Array.isArray(data.tenses)) queue = selectQuestions(data.tenses);
      if (!queue.length) return;
      phase = 'game1';
      drill.totalQuestions = queue.length;
      nextQuestion();
    } else if (role === 'student' && event === 'student_reveal' && phase === 'game1' && drill.status === 'idle') {
      drill.status = 'revealed';
      drill.revealedAt = Date.now();
      timer = setTimeout(expire, 10000);
    } else if (role === 'teacher' && event === 'teacher_grade' && phase === 'game1' && drill.status === 'revealed' && typeof data.correct === 'boolean') {
      grade(data.correct);
    } else if (event === 'game1_next' && phase === 'game1' && ['correct','incorrect'].includes(drill.status)) {
      nextQuestion();
    } else if (role === 'teacher' && ((event === 'teacher_start_game2' && phase === 'lobby') ||
        (event === 'teacher_advance_game' && phase === 'game1' && drill.status === 'win'))) {
      phase = 'game2';
      deck = shuffle(cards).slice(0, 15);
    } else if (role === 'student' && event === 'student_next_card' && phase === 'game2' &&
        ['idle','timeout','success'].includes(taboo.status)) {
      if (taboo.roundIndex === deck.length) phase = 'finished';
      else {
        taboo.current = deck[taboo.roundIndex++];
        Object.assign(taboo, { status: 'active', guesses: [], studentTimedOut: false, startedAt: Date.now() });
        timer = setTimeout(expire, 45000);
      }
    } else if (role === 'teacher' && event === 'teacher_guess' && phase === 'game2' && taboo.status === 'active') {
      const guess = typeof data.guess === 'string' && data.guess.trim().slice(0, 160);
      if (!guess) return;
      taboo.guesses = [...taboo.guesses, { text: guess, timestamp: Date.now() }];
      if (guess.toLowerCase() === taboo.current.keyword.toLowerCase()) {
        clearTimeout(timer);
        taboo.score++;
        taboo.status = 'success';
      }
    } else return;
    changed();
  }
  return { command, snapshot, close: () => clearTimeout(timer) };
}
