import { useState, useEffect, useRef } from 'react';
import { getRandomizedList } from '../constants/words';

export const useGameState = (broadcastState) => {
  const [state, setState] = useState({
    phase: 'setup', // 'setup', 'playing', 'podium'
    grade: '5th',
    allStudents: [], // [{ name: 'John', status: 'active' | 'eliminated', place: null }]
    activeStudents: [], // array of names currently alive
    roundQueue: [], // array of names waiting for their turn this cycle
    currentStudent: null,
    wordsList: [],
    currentWordIndex: 0,
    currentWord: '',
    wordVisible: false,
    typedText: '',
    timer: 60,
    timerRunning: false,
    podium: [], // [{ name, place }]
    isSpinning: false
  });

  const timerRef = useRef(null);
  const stateRef = useRef(state);
  
  // Keep ref in sync for timer interval
  useEffect(() => {
    stateRef.current = state;
    // Broadcast state on every change
    if (broadcastState) {
      broadcastState(state);
    }
  }, [state, broadcastState]);

  // Timer logic
  useEffect(() => {
    if (state.timerRunning && state.timer > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timer <= 1) {
            clearInterval(timerRef.current);
            return { ...prev, timer: 0, timerRunning: false };
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
    } else if (!state.timerRunning) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [state.timerRunning, state.timer]);

  const startGame = (grade, studentNames) => {
    const list = getRandomizedList(grade);
    const students = studentNames
      .filter(n => n.trim())
      .map(n => ({ name: n.trim(), status: 'active', place: null }));
    
    const activeNames = students.map(s => s.name);
    
    setState({
      phase: 'playing',
      grade,
      allStudents: students,
      activeStudents: activeNames,
      roundQueue: [...activeNames],
      currentStudent: null,
      wordsList: list,
      currentWordIndex: 0,
      currentWord: '', // Start with no word selected until wheel spun
      wordVisible: false,
      typedText: '',
      timer: 60,
      timerRunning: false,
      podium: [],
      isSpinning: false
    });
  };

  const getNextWord = () => {
    const s = stateRef.current;
    let idx = s.currentWordIndex;
    if (idx >= s.wordsList.length) {
      idx = 0; // Recycle words if exhausted
    }
    const word = s.wordsList[idx];
    setState(prev => ({
      ...prev,
      currentWord: word,
      currentWordIndex: idx + 1,
      wordVisible: false,
      typedText: '',
      timer: 60,
      timerRunning: false
    }));
  };

  const spinWheel = () => {
    clearTimeout(timerRef.current); // safe measure
    const s = stateRef.current;
    let queue = [...s.roundQueue];
    
    // If the queue is empty, a new round begins with active students!
    if (queue.length === 0) {
      queue = [...s.activeStudents];
    }
    
    // Randomize the next pick from the remaining queue (for unpredictability but fairness)
    // Actually, picking a random index from the queue acts as the "rigged" round-robin
    const randomIndex = Math.floor(Math.random() * queue.length);
    const selected = queue[randomIndex];
    
    // Remove the selected student from the queue
    queue.splice(randomIndex, 1);
    
    setState(prev => ({ ...prev, isSpinning: true }));
    
    // Simulate spin animation delay
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isSpinning: false,
        currentStudent: selected,
        roundQueue: queue
      }));
      getNextWord();
    }, 2000);
  };

  const updateTypedText = (text) => {
    const s = stateRef.current;
    if (s.phase !== 'playing' || !s.currentStudent) return;
    
    let isRunning = s.timerRunning;
    // Auto-start timer when teacher starts typing
    if (text.length > 0 && s.timer === 60 && !isRunning) {
      isRunning = true;
    }

    setState(prev => ({
      ...prev,
      typedText: text,
      timerRunning: isRunning
    }));
  };

  const toggleTimer = () => {
    setState(prev => ({ ...prev, timerRunning: !prev.timerRunning }));
  };

  const revealWord = () => {
    setState(prev => ({ ...prev, wordVisible: true }));
  };

  const processAnswer = (isCorrect) => {
    const s = stateRef.current;
    let newActive = [...s.activeStudents];
    let newAll = [...s.allStudents];
    let newPodium = [...s.podium];
    
    if (!isCorrect) {
      // Eliminated!
      newActive = newActive.filter(n => n !== s.currentStudent);
      
      const studentIndex = newAll.findIndex(st => st.name === s.currentStudent);
      if (studentIndex !== -1) {
        newAll[studentIndex].status = 'eliminated';
        
        // Podium logic for 2nd and 3rd place
        // If they just got eliminated and there are exactly 2 students total left ACTIVE now
        // Wait, if active drops to 2, the eliminated one is 3rd.
        // If active drops to 1, the eliminated one is 2nd, and the last active is 1st!
        if (newActive.length === 2) {
            newAll[studentIndex].place = 3;
            newPodium.push({ name: s.currentStudent, place: 3, rank: '3rd' });
        } else if (newActive.length === 1) {
            newAll[studentIndex].place = 2;
            newPodium.push({ name: s.currentStudent, place: 2, rank: '2nd' });
            
            // The last remaining is 1st place!
            const winner = newActive[0];
            const winnerIndex = newAll.findIndex(st => st.name === winner);
            if (winnerIndex !== -1) newAll[winnerIndex].place = 1;
            newPodium.push({ name: winner, place: 1, rank: '1st' });
        }
      }
    }

    setState(prev => {
      const isGameOver = newActive.length <= 1 && newAll.length > 1; // Need at least 2 to start to have a game over naturally
      return {
        ...prev,
        activeStudents: newActive,
        allStudents: newAll,
        podium: newPodium,
        timerRunning: false, // pause timer
        // If game is over, we switch phase immediately or wait for teacher? Let's just set phase to podium.
        phase: isGameOver ? 'podium' : prev.phase
      };
    });
  };

  const checkAuto = () => {
    const s = stateRef.current;
    const isCorrect = s.typedText.trim().toLowerCase() === s.currentWord.trim().toLowerCase();
    processAnswer(isCorrect);
  };

  const setCurrentWord = (word) => {
    setState(prev => ({
      ...prev,
      currentWord: word,
      wordVisible: false,
      typedText: '',
      timer: 60,
      timerRunning: false
    }));
  };

  const addCustomWord = (word) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    
    setState(prev => {
      const isDuplicate = prev.wordsList.includes(trimmed);
      return {
        ...prev,
        wordsList: isDuplicate ? prev.wordsList : [trimmed, ...prev.wordsList],
        currentWord: trimmed,
        wordVisible: false,
        typedText: '',
        timer: 60,
        timerRunning: false
      };
    });
  };

  const overrideCorrect = () => {
    processAnswer(true);
  };

  const overrideIncorrect = () => {
    processAnswer(false);
  };

  const restartGame = () => {
    setState(prev => ({
        ...prev,
        phase: 'setup',
        allStudents: [],
        activeStudents: [],
        roundQueue: [],
        currentStudent: null,
        podium: []
    }));
  };

  const addStudent = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    setState(prev => {
      if (prev.allStudents.find(st => st.name === trimmed)) return prev; // Avoid dupes
      return {
        ...prev,
        allStudents: [...prev.allStudents, { name: trimmed, status: 'active', place: null }],
        activeStudents: [...prev.activeStudents, trimmed],
        roundQueue: [...prev.roundQueue, trimmed]
      };
    });
  };

  const removeStudent = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setState(prev => {
      const newActive = prev.activeStudents.filter(n => n !== trimmed);
      const newQueue = prev.roundQueue.filter(n => n !== trimmed);
      const newAll = prev.allStudents.map(st => 
        st.name === trimmed ? { ...st, status: 'eliminated' } : st
      );
      
      const isGameOver = newActive.length <= 1 && newAll.length > 1;

      let newPhase = prev.phase;
      let newPodium = [...prev.podium];
      
      if (isGameOver) {
         newPhase = 'podium';
         if (newActive.length === 1 && !newPodium.find(p => p.place === 1)) {
            const winner = newActive[0];
            const winnerIndex = newAll.findIndex(st => st.name === winner);
            if (winnerIndex !== -1) newAll[winnerIndex].place = 1;
            newPodium.push({ name: winner, place: 1, rank: '1st' });
         }
      }

      return {
        ...prev,
        allStudents: newAll,
        activeStudents: newActive,
        roundQueue: newQueue,
        podium: newPodium,
        phase: newPhase
      };
    });
  };

  return {
    state,
    startGame,
    spinWheel,
    updateTypedText,
    toggleTimer,
    revealWord,
    checkAuto,
    overrideCorrect,
    overrideIncorrect,
    restartGame,
    addStudent,
    removeStudent,
    setCurrentWord,
    addCustomWord
  };
};
