import { useState, useEffect, useRef, useCallback } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const INITIAL_STATE = {
  students: [],
  eliminated: [],
  wordList: [],
  spinQueue: [],
  currentStudent: null,
  liveText: '',
  currentWord: null,
  phase: 'setup',     // 'setup' | 'playing' | 'result' | 'champion'
  lastResult: null,
  podium: [],
};

/**
 * All game logic, previously on the Socket.IO server.
 * The teacher tab is the single source of truth.
 *
 * @param {Function} broadcastState  – called on every state change
 * @param {Function} broadcastSpin   – called when the wheel should spin
 */
export const useGameState = (broadcastState, broadcastSpin) => {
  const [state, setState] = useState(INITIAL_STATE);
  const stateRef = useRef(state);

  // Keep ref in sync + broadcast on every change
  useEffect(() => {
    stateRef.current = state;
    if (broadcastState) broadcastState(state);
  }, [state, broadcastState]);

  /* ── Actions ─────────────────────────────────────────── */

  const setupComplete = useCallback(({ students, wordList }) => {
    setState({
      ...INITIAL_STATE,
      students,
      wordList,
      spinQueue: shuffle([...students]),
      phase: 'playing',
    });
  }, []);

  const spinWheel = useCallback(() => {
    setState((prev) => {
      if (prev.students.length === 0) return prev;
      let queue = prev.spinQueue.filter((s) => prev.students.includes(s));
      if (queue.length === 0) queue = shuffle([...prev.students]);

      const targetStudent = queue.shift();
      const targetIndex = prev.students.indexOf(targetStudent);

      // Fire the spin animation event
      if (broadcastSpin) broadcastSpin(targetIndex);

      return {
        ...prev,
        spinQueue: queue,
        currentStudent: targetStudent,
        currentWord: null,
        liveText: '',
        // Return targetIndex so TeacherPanel / App can use it
        _lastSpinTarget: targetIndex,
        spinNumber: (prev.spinNumber || 0) + 1,
      };
    });
  }, [broadcastSpin]);

  const revealWord = useCallback(() => {
    setState((prev) => {
      if (!prev.wordList.length) return prev;
      const word = prev.wordList[Math.floor(Math.random() * prev.wordList.length)];
      return { ...prev, currentWord: word, liveText: '' };
    });
  }, []);

  const liveUpdate = useCallback((text) => {
    setState((prev) => ({ ...prev, liveText: text }));
  }, []);

  const answerCheck = useCallback((answer) => {
    setState((prev) => {
      if (!prev.currentWord) return prev;
      const correct = answer.trim().toLowerCase() === prev.currentWord.trim().toLowerCase();

      let newStudents = prev.students;
      let newEliminated = prev.eliminated;
      let newSpinQueue = prev.spinQueue;

      const practiceRetry = !correct && prev.students.length === 1;
      if (!correct && !practiceRetry) {
        newEliminated = [...prev.eliminated, prev.currentStudent];
        newStudents = prev.students.filter((s) => s !== prev.currentStudent);
        newSpinQueue = prev.spinQueue.filter((s) => s !== prev.currentStudent);
      }

      return {
        ...prev,
        students: newStudents,
        eliminated: newEliminated,
        spinQueue: newSpinQueue,
        lastResult: {
          correct,
          practiceRetry,
          answer: answer.trim(),
          word: prev.currentWord,
          eliminatedName: !correct ? prev.currentStudent : null,
          remaining: newStudents.length,
        },
        liveText: '',
        phase: 'result',
      };
    });
  }, []);

  const gameNext = useCallback(() => {
    setState((prev) => {
      if (prev.lastResult?.practiceRetry) return { ...prev, phase: 'playing', lastResult: null };
      if (prev.students.length === 1) {
        // Build podium
        const champion = prev.students[0];
        const podium = [champion];
        for (let i = prev.eliminated.length - 1; i >= 0 && podium.length < 3; i--) {
          podium.push(prev.eliminated[i]);
        }
        return { ...prev, podium, phase: 'champion' };
      }
      return {
        ...prev,
        currentStudent: null,
        currentWord: null,
        liveText: '',
        lastResult: null,
        phase: 'playing',
      };
    });
  }, []);

  const vocabAdd = useCallback((word) => {
    const t = word.trim();
    if (!t) return;
    setState((prev) => {
      if (prev.wordList.includes(t)) return prev;
      return { ...prev, wordList: [...prev.wordList, t] };
    });
  }, []);

  const studentAdd = useCallback((name) => {
    const t = name.trim();
    if (!t) return;
    setState((prev) => {
      if ([...prev.students, ...prev.eliminated].some(name => name.toLowerCase() === t.toLowerCase())) return prev;
      return { ...prev, students: [...prev.students, t] };
    });
  }, []);

  const studentRemove = useCallback((name) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s !== name),
      spinQueue: prev.spinQueue.filter((s) => s !== name),
      currentStudent: prev.currentStudent === name ? null : prev.currentStudent,
    }));
  }, []);

  const gameReset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    actions: {
      setupComplete,
      spinWheel,
      revealWord,
      liveUpdate,
      answerCheck,
      gameNext,
      vocabAdd,
      studentAdd,
      studentRemove,
      gameReset,
    },
  };
};
