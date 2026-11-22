import { useState, useEffect, useCallback } from 'react';
import NameWheel from './NameWheel';

export default function StudentScreen({ state, spinEvent }) {
  const [showPopup, setShowPopup]     = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [spinTarget, setSpinTarget]   = useState(null);
  const [isSpinning, setIsSpinning]   = useState(false);

  // Listen for spin events from BroadcastChannel
  useEffect(() => {
    if (spinEvent && spinEvent.targetIndex !== undefined) {
      setSpinTarget(spinEvent.targetIndex);
      setSpinTrigger((t) => t + 1);
      setIsSpinning(true);
      setShowPopup(false);
    }
  }, [spinEvent]);

  useEffect(() => {
    if (state.phase === 'result' && state.lastResult) setShowPopup(true);
    else if (state.phase !== 'result') setShowPopup(false);
  }, [state.phase, state.lastResult]);

  const handleSpinEnd = useCallback(() => setIsSpinning(false), []);

  const transcribeChars = state.liveText ? state.liveText.split('') : [];
  const showWord = !!state.currentWord && state.phase !== 'result';

  return (
    <div className="student-page">
      <div className="student-header">
        <span className="student-header-bee">🐝</span>
        <span>Spelling Bee</span>
        {state.students?.length > 0 && (
          <span className="student-header-count">{state.students.length} remaining</span>
        )}
      </div>

      <div className="student-body">
        <NameWheel
          students={state.students}
          triggerSpin={spinTrigger}
          targetIndex={spinTarget}
          onSpinEnd={handleSpinEnd}
          size={showWord ? 200 : 380}
        />

        {!isSpinning && state.currentStudent && (
          <div className="student-up-next">
            <span className="student-up-next-label">UP NEXT</span>
            <span className="student-up-next-name">{state.currentStudent}</span>
          </div>
        )}

        {!isSpinning && !state.currentStudent && state.phase === 'playing' && (
          <div className="student-idle"><p>Waiting for the teacher to spin the wheel…</p></div>
        )}

        {showWord && (
          <div className="student-word-section">
            <div className="student-spell-label">SPELL THIS WORD ✏️</div>
            <div className="student-word-display">{state.currentWord}</div>
          </div>
        )}
      </div>

      {/* Live transcription bar */}
      {state.liveText && (
        <div className="transcription-bar">
          <span className="transcription-live-dot" />
          <span className="transcription-live-label">LIVE</span>
          <div className="transcription-chars">
            {transcribeChars.map((char, i) => (
              <span key={i} className="transcription-char">{char}</span>
            ))}
            <span className="transcription-cursor">|</span>
          </div>
        </div>
      )}

      {/* Result popup */}
      {showPopup && state.lastResult && (
        <div className="popup-overlay">
          <div className={`result-popup ${state.lastResult.correct ? 'popup-correct' : 'popup-incorrect'}`}>
            <div className="popup-emoji">
              {state.lastResult.correct ? '🎉' : '💥'}
            </div>
            <h2 className="popup-verdict">
              {state.lastResult.correct ? 'Correct!' : 'Eliminated!'}
            </h2>
            {state.lastResult.correct ? (
              <p className="popup-detail">
                <strong>{state.currentStudent}</strong> got it right!
              </p>
            ) : (
              <div className="popup-detail">
                <p className="eliminated-name">{state.lastResult.eliminatedName} is out! 💀</p>
                <p>Correct spelling: <strong className="correct-word">{state.lastResult.word}</strong></p>
                <p className="remaining-count">{state.lastResult.remaining} player{state.lastResult.remaining !== 1 ? 's' : ''} remaining</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
