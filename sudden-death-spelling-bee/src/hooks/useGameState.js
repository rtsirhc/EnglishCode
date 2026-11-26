import { useEffect, useState } from 'react';
import { getRandomizedList } from '../constants/words';

const initial = {
  phase: 'setup', grade: 'A1', allStudents: [], activeStudents: [], roundQueue: [],
  currentStudent: null, wordsList: [], currentWordIndex: 0, currentWord: '',
  wordVisible: false, typedText: '', timer: 60, deadline: null, podium: [], isSpinning: false,
  feedback: ''
};

function eliminate(state, name) {
  const activeStudents = state.activeStudents.filter(student => student !== name);
  const place = activeStudents.length + 1;
  const podium = place <= 3 ? [...state.podium, { name, place }] : state.podium;
  const finished = activeStudents.length === 1;
  return {
    ...state, activeStudents, roundQueue: state.roundQueue.filter(student => student !== name),
    podium: finished ? [...podium, { name: activeStudents[0], place: 1 }] : podium,
    phase: finished ? 'podium' : 'playing',
    feedback: name + ' is out.'
  };
}

export const useGameState = broadcastState => {
  const [state, setState] = useState(initial);
  useEffect(() => {
    const { phase, currentStudent, activeStudents, isSpinning, wordVisible, currentWord, typedText, timer, podium } = state;
    broadcastState({ phase, currentStudent, activeStudents, isSpinning, wordVisible,
      currentWord: wordVisible ? currentWord : '', typedText, timer, podium });
  }, [state, broadcastState]);

  useEffect(() => {
    if (!state.deadline) return;
    const tick = () => setState(prev => {
      if (!prev.deadline) return prev;
      const timer = Math.max(0, Math.ceil((prev.deadline - Date.now()) / 1000));
      return timer === prev.timer ? prev : { ...prev, timer, deadline: timer ? prev.deadline : null };
    });
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [state.deadline]);

  useEffect(() => {
    if (!state.isSpinning) return;
    const timer = setTimeout(() => {
      const available = state.roundQueue.length ? state.roundQueue : state.activeStudents;
      const selected = available[Math.floor(Math.random() * available.length)];
      setState(prev => {
        const index = prev.currentWordIndex % prev.wordsList.length;
        return { ...prev, isSpinning: false, currentStudent: selected,
          roundQueue: available.filter(name => name !== selected), currentWord: prev.wordsList[index],
          currentWordIndex: index + 1, typedText: '', wordVisible: false, timer: 60, deadline: null };
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.isSpinning, state.roundQueue, state.activeStudents]);

  const startGame = (grade, names) => setState({ ...initial, phase: 'playing', grade,
    allStudents: names, activeStudents: names, roundQueue: names, wordsList: getRandomizedList(grade) });
  const spinWheel = () => setState(prev => prev.phase === 'playing' && !prev.currentStudent
    ? { ...prev, isSpinning: true, feedback: '' } : prev);
  const updateTypedText = text => setState(prev => ({ ...prev, typedText: text,
    deadline: !prev.typedText && text && prev.timer === 60 && !prev.deadline ? Date.now() + 60000 : prev.deadline }));
  const toggleTimer = () => setState(prev => prev.currentStudent && prev.timer > 0
    ? { ...prev, deadline: prev.deadline ? null : Date.now() + prev.timer * 1000 } : prev);
  const revealWord = () => setState(prev => ({ ...prev, wordVisible: true }));
  const processAnswer = verdict => setState(prev => {
    if (!prev.currentStudent || prev.phase !== 'playing') return prev;
    const correct = verdict ?? (prev.typedText.trim().toLowerCase() === prev.currentWord.toLowerCase());
    const next = correct ? { ...prev, feedback: prev.currentStudent + ' spelled it correctly.' }
      : eliminate(prev, prev.currentStudent);
    return { ...next, currentStudent: null, currentWord: '', wordVisible: false, typedText: '', deadline: null };
  });
  const selectWord = (word, add) => setState(prev => {
    const value = word.trim();
    if (!value || !prev.currentStudent) return prev;
    return { ...prev, currentWord: value, wordVisible: false, typedText: '', timer: 60, deadline: null,
      wordsList: add && !prev.wordsList.includes(value) ? [...prev.wordsList, value] : prev.wordsList };
  });
  const addStudent = raw => setState(prev => {
    const name = raw.trim();
    if (!name || prev.isSpinning || prev.podium.length || prev.allStudents.some(s => s.toLowerCase() === name.toLowerCase())) return prev;
    return { ...prev, activeStudents: [...prev.activeStudents, name], allStudents: [...prev.allStudents, name],
      roundQueue: [...prev.roundQueue, name] };
  });
  const removeStudent = raw => setState(prev => {
    if (prev.isSpinning || prev.currentStudent || !prev.activeStudents.includes(raw.trim())) return prev;
    return eliminate(prev, raw.trim());
  });
  return { state, startGame, spinWheel, updateTypedText, toggleTimer, revealWord,
    checkAuto: () => processAnswer(null), overrideCorrect: () => processAnswer(true),
    overrideIncorrect: () => processAnswer(false), setCurrentWord: word => selectWord(word, false),
    addCustomWord: word => selectWord(word, true), addStudent, removeStudent };
};
