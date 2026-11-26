import { useState, useEffect, useCallback, useRef } from 'react';
import { bindGameControls } from '../../../gallery/shared/runtime.js';
import NameWheel from './NameWheel';

export default function TeacherPanel({
  state,
  displayId,
  onSpin,
  onRevealWord,
  onLiveUpdate,
  onAnswerCheck,
  onGameNext,
  onVocabAdd,
  onStudentAdd,
  onStudentRemove,
  onReset,
}) {
  const [inputText, setInputText]     = useState('');
  const [vocabInput, setVocabInput]   = useState('');
  const [addNameInput, setAddNameInput] = useState('');
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [spinTarget, setSpinTarget]   = useState(null);
  const [isSpinning, setIsSpinning]   = useState(false);
  const answerRef = useRef(null);


  // Detect when state._lastSpinTarget changes to trigger the wheel animation
  useEffect(() => {
    const target = state._lastSpinTarget;
    if (target !== undefined && target !== null) {

      setSpinTarget(target);
      setSpinTrigger((t) => t + 1);
      setIsSpinning(true);
      setInputText('');
    }
  }, [state.spinNumber]);

  useEffect(() => {
    if (state.phase === 'playing' && !state.liveText) setInputText('');
  }, [state.phase, state.liveText]);

  useEffect(() => {
    if (state.currentWord && state.phase === 'playing') {
      setTimeout(() => answerRef.current?.focus(), 100);
    }
  }, [state.currentWord, state.phase]);

  const handleSpinEnd = useCallback(() => setIsSpinning(false), []);

  const handleSpin = () => {
    if (isSpinning || state.students.length === 0 || state.phase !== 'playing') return;
    onSpin();
  };

  const handleRevealWord = () => onRevealWord();

  const handleType = (e) => {
    const val = e.target.value;
    setInputText(val);
    onLiveUpdate(val);
  };

  const handleCheck = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !state.currentWord) return;
    onAnswerCheck(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleCheck(); };

  const handleNext = () => {
    onGameNext();
    setInputText('');
  };

  const handleVocabAdd = (e) => {
    e.preventDefault();
    if (vocabInput.trim()) {
      onVocabAdd(vocabInput.trim());
      setVocabInput('');
    }
  };

  const handleAddName = (e) => {
    e.preventDefault();
    if (addNameInput.trim()) {
      onStudentAdd(addNameInput.trim());
      setAddNameInput('');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset the game?')) { onReset(); setInputText(''); }
  };

  const studentUrl = `${window.location.origin}${import.meta.env.BASE_URL}index.html#/student?room=${displayId}`;
  const queueLeft  = state.spinQueue?.length ?? 0;
  const canReveal  = state.phase === 'playing' && state.currentStudent && !isSpinning;
  const canCheck   = state.phase === 'playing' && state.currentWord && !isSpinning;
  const activeCount = state.students?.length ?? 0;

  useEffect(() => {
    const controls = {};
    if (state.phase === 'result') controls.next = handleNext;
    else if (!isSpinning) {
      if (!state.currentStudent && activeCount) controls.confirm = handleSpin;
      else if (canReveal && !state.currentWord) controls.confirm = handleRevealWord;
      else if (canCheck && inputText.trim()) controls.confirm = handleCheck;
    }
    return bindGameControls('spelling-bee', controls);
  });

  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <div className="teacher-title"><span>👩‍🏫</span><span>Teacher Panel</span></div>
        <div className="teacher-header-right">
          <a className="student-url-chip" href={studentUrl} target="_blank" rel="noopener">Open classroom display (same browser)</a>
          <span className="active-count-chip">👤 {activeCount} left</span>
          <button className="reset-btn" onClick={handleReset}>↺ Reset</button>
        </div>
      </div>

      <div className="teacher-body">

        {/* Wheel */}
        <div className="teacher-wheel-section">
          <NameWheel
            students={state.students}
            triggerSpin={spinTrigger}
            targetIndex={spinTarget}
            onSpinEnd={handleSpinEnd}
            size={360}
          />
          <button
            className="spin-btn"
            onClick={handleSpin}
            disabled={isSpinning || state.phase !== 'playing' || !activeCount || !!state.currentStudent}
          >
            {isSpinning ? '🌀 Spinning…' : '🎡 Spin Wheel'}
          </button>
          {queueLeft > 0 && !isSpinning && (
            <p className="queue-hint">{queueLeft} student{queueLeft !== 1 ? 's' : ''} left before reset</p>
          )}
        </div>

        {/* Up Next */}
        {state.currentStudent && (
          <div className="up-next-box">
            <span className="up-next-label">UP NEXT</span>
            <span className="up-next-name">{state.currentStudent}</span>
          </div>
        )}

        {/* Word + answer check */}
        {canReveal && (
          <div className="section-card word-controls-card">
            <h3 className="section-title">🔤 Give the Word</h3>

            {!state.currentWord && (
              <button className="reveal-word-btn" onClick={handleRevealWord}>
                🎲 Reveal Word from List
              </button>
            )}
            {state.currentWord && (
              <div className="word-revealed-notice">Dictate this word: <strong>{state.currentWord}</strong></div>
            )}

            {canCheck && (
              <>
                <div className="answer-input-label">
                  Type what the student spelled — press <strong>Enter</strong> to check
                </div>
                <div className="answer-input-wrap">
                  <input
                    ref={answerRef}
                    className="answer-check-input"
                    type="text"
                    value={inputText}
                    onChange={handleType}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Type the student's attempt…"
                  />
                  <button className="check-btn" onClick={handleCheck} disabled={!inputText.trim()}>
                    Check ↵
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {state.phase === 'playing' && state.currentWord && (
          <div className="phase-status answering-status">
            ✏️ Listening for {state.currentStudent}&apos;s spelling…
          </div>
        )}

        {state.phase === 'result' && state.lastResult && (
          <>
            <div className={`phase-status ${state.lastResult.correct ? 'correct-status' : 'incorrect-status'}`}>
              {state.lastResult.practiceRetry ? "Try the spelling again." : state.lastResult.correct
                ? `✅ Correct! "${state.lastResult.word}"`
                : `❌ ${state.lastResult.eliminatedName} eliminated — ${state.lastResult.remaining} player${state.lastResult.remaining !== 1 ? 's' : ''} left`}
            </div>
            <button className="next-btn" onClick={handleNext}>
              {state.lastResult.practiceRetry ? 'Try Again' : state.lastResult.remaining <= 1 ? '🏆 See Champion' : 'Next Round →'}
            </button>
          </>
        )}

        {/* Vocab override — add words to list mid-game */}
        <div className="section-card vocab-override-card">
          <h3 className="section-title">📖 Vocab Override</h3>
          <form className="vocab-override-form" onSubmit={handleVocabAdd}>
            <input
              className="vocab-override-input"
              type="text"
              value={vocabInput}
              onChange={(e) => setVocabInput(e.target.value)}
              placeholder="Add a word to the list…"
              autoComplete="off"
            />
            <button className="add-btn" type="submit">+ Add</button>
          </form>
          <p className="vocab-count-hint">{state.wordList?.length ?? 0} words in list</p>
        </div>

        {/* Name override */}
        <div className="section-card name-override-card">
          <h3 className="section-title">👤 Name Override</h3>
          <form className="name-override-form" onSubmit={handleAddName}>
            <input
              className="name-override-input"
              type="text"
              value={addNameInput}
              onChange={(e) => setAddNameInput(e.target.value)}
              placeholder="Add a name…"
              autoComplete="off"
            />
            <button className="add-btn" type="submit">+ Add</button>
          </form>
          <div className="name-chips">
            {state.students?.map((name) => (
              <div key={name} className={`name-chip ${name === state.currentStudent ? 'name-chip-active' : ''}`}>
                <span>{name}</span>
                <button className="name-chip-remove" disabled={activeCount <= 1 || !!state.currentStudent || isSpinning || state.phase !== 'playing'} aria-label={'Remove ' + name} onClick={() => onStudentRemove(name)}>×</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
