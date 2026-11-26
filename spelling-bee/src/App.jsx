import { useState } from 'react';
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
  const [displayId] = useState(() => crypto.randomUUID());
  const { broadcastState, broadcastSpin } = useTeacherSync(displayId);
  const { state, actions } = useGameState(broadcastState, broadcastSpin);
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
      displayId={displayId}
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
  const displayId = new URLSearchParams(useLocation().search).get('room');
  const { syncedState, spinEvent } = useStudentSync(INITIAL_STATE, displayId);

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
  const isTeacher = location.pathname !== '/student';

  return isTeacher ? <TeacherApp /> : <StudentApp />;
}
