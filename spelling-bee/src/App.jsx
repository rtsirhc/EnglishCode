import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTeacherSync, useStudentSync } from './hooks/useSync';
import { useGameState } from './hooks/useGameState';
import Setup from './components/Setup';
import TeacherPanel from './components/TeacherPanel';
import StudentScreen from './components/StudentScreen';
import ChampionScreen from './components/ChampionScreen';

const INITIAL_STATE = {
  students: [],
  eliminated: [],
  wordList: [],
  spinQueue: [],
  currentStudent: null,
  liveText: '',
  currentWord: null,
  phase: 'setup',
  lastResult: null,
  podium: [],
};

function TeacherApp() {
  const { broadcastState, broadcastSpin } = useTeacherSync();
  const { state, actions } = useGameState(broadcastState, broadcastSpin);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [spinTarget, setSpinTarget] = useState(null);

  // Wrap spinWheel to also trigger the local wheel animation
  const handleSpin = useCallback(() => {
    actions.spinWheel();
  }, [actions]);

  // After spinWheel updates state, detect the new _lastSpinTarget
  // We use a wrapper that reads the target from state after spinWheel runs
  const wrappedSpin = useCallback(() => {
    // We need to get the target index after the state update
    // So we use a small trick: spinWheel sets _lastSpinTarget in state
    handleSpin();
  }, [handleSpin]);

  // Detect spin target changes to trigger animation
  const lastTarget = state._lastSpinTarget;

  // Use effect-like approach: track spin trigger via state changes
  const onSpinWithAnimation = useCallback(() => {
    actions.spinWheel();
    // We'll read the new target from the updated state in the next render
  }, [actions]);

  // Champion screen shown on both views
  if (state.phase === 'champion') {
    return <ChampionScreen state={state} onReset={actions.gameReset} isTeacher />;
  }

  if (state.phase === 'setup') {
    return <Setup onSetupComplete={actions.setupComplete} />;
  }

  return (
    <TeacherPanel
      state={state}
      onSpin={actions.spinWheel}
      onRevealWord={actions.revealWord}
      onLiveUpdate={actions.liveUpdate}
      onAnswerCheck={actions.answerCheck}
      onGameNext={actions.gameNext}
      onVocabAdd={actions.vocabAdd}
      onStudentAdd={actions.studentAdd}
      onStudentRemove={actions.studentRemove}
      onReset={actions.gameReset}
    />
  );
}

function StudentApp() {
  const { syncedState, spinEvent } = useStudentSync(INITIAL_STATE);

  if (!syncedState || syncedState.phase === 'setup') {
    return (
      <div className="waiting-room">
        <div className="waiting-bee">🐝</div>
        <h1>Spelling Bee</h1>
        <p>Waiting for the teacher to start…</p>
      </div>
    );
  }

  if (syncedState.phase === 'champion') {
    return <ChampionScreen state={syncedState} isTeacher={false} />;
  }

  return <StudentScreen state={syncedState} spinEvent={spinEvent} />;
}

export default function App() {
  const location = useLocation();
  const isTeacher = location.pathname === '/teacher';

  return isTeacher ? <TeacherApp /> : <StudentApp />;
}
