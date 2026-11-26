import React, { useEffect, useState } from 'react';
import { bindGameControls } from '../../../gallery/shared/runtime.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { useTeacherSync } from '../hooks/useSync';
import { Play, Pause, CheckCircle, XCircle, Eye, Volume2, RotateCw } from 'lucide-react';

const TeacherPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [room] = useState(() => crypto.randomUUID());
  const { broadcastState } = useTeacherSync(room);
  const {
    state,
    startGame,
    spinWheel,
    updateTypedText,
    toggleTimer,
    revealWord,
    checkAuto,
    overrideCorrect,
    overrideIncorrect,
    addStudent,
    removeStudent,
    setCurrentWord,
    addCustomWord
  } = useGameState(broadcastState);

  // We need to keep local text input perfectly in sync to handle "Enter" to submit
  const [inputText, setInputText] = useState("");
  const [manageName, setManageName] = useState("");
  const [customWordText, setCustomWordText] = useState("");

  useEffect(() => {
    if (location.state && location.state.grade && location.state.students) {
      startGame(location.state.grade, location.state.students);
    } else if (state.phase === 'setup') {
      // If refreshed without state, go back
      navigate('/');
    }
  }, [location.state]);

  // Sync state.typedText to local input if it changed externally (e.g., cleared by next turn)
  useEffect(() => {
    setInputText(state.typedText);
  }, [state.typedText, state.currentStudent]);

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    updateTypedText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      checkAuto();
    }
  };

  const speakWord = () => {
    if (!state.currentWord || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const utterance = new SpeechSynthesisUtterance(state.currentWord);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const canSpin = state.phase === 'playing' && !state.currentStudent && !state.isSpinning;
  useEffect(() => {
    const actions = {};
    if (canSpin) actions.next = spinWheel;
    if (state.currentStudent) Object.assign(actions, { answer1: overrideCorrect, answer2: overrideIncorrect, hint: revealWord });
    if (state.currentStudent && inputText.trim()) actions.confirm = checkAuto;
    return bindGameControls('sudden-death-spelling-bee', actions);
  });
  if (state.phase === 'podium') return (
    <main className="screen-container">
      <section className="glass-panel">
        <h1>Final standings</h1>
        <ol>{[...state.podium].sort((a,b) => a.place - b.place).map(player => <li key={player.name}>{player.name}</li>)}</ol>
        <button className="btn-primary" onClick={() => navigate('/')}>Play again</button>
      </section>
    </main>
  );
  if (state.phase === 'setup') return <div>Loading Game State...</div>;

  const currentQueueLength = state.roundQueue.length;
  const isWheelSpinnable = canSpin;

  return (
    <div className="screen-container" style={{ background: '#1c1c1c' }}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-white">Teacher Control Panel</h2>
        <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
          <a href={`${import.meta.env.BASE_URL}index.html#/student?room=${room}`} target="_blank" rel="noopener">Open classroom display</a> in this browser and move it to your projector.
        </div>
      </div>

      <div className="match-columns flex gap-4" style={{ flex: 1, minHeight: 0 }}>
        {/* LEFT COLUMN: Controls */}
        <div className="flex-col gap-2 w-full" style={{ flex: 2 }}>
          
          <div className="glass-panel text-center">
            <h3 className="mb-1">Current Turn</h3>
            <p role="status">{state.feedback}</p>
            {state.currentStudent ? (
              <div className="text-giant" style={{ color: 'var(--primary)' }}>
                {state.currentStudent}
              </div>
            ) : (
              <div className="text-giant" style={{ color: '#aaa' }}>Waiting...</div>
            )}
            
            <div className="mt-2 flex gap-2 justify-center">
              <button 
                className="btn-accent" 
                onClick={spinWheel} 
                disabled={!isWheelSpinnable}
                style={{ opacity: isWheelSpinnable ? 1 : 0.5, padding: '8px 16px', fontSize: '1rem' }}
              >
                <RotateCw size={20} className={state.isSpinning ? "animate-pulse" : ""} />
                Spin the Wheel!
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ flex: 1, justifyContent: 'center' }}>
            <div className="flex justify-between items-center mb-2">
              <h3>{state.currentWord ? "Dictate: " + state.currentWord : "Live Transcription"}</h3>
              <button disabled={!state.currentWord || !window.speechSynthesis} onClick={speakWord} style={{ background: 'none', color: 'var(--primary)', padding: '4px', fontSize: '0.9rem' }} className="flex items-center gap-1">
                <Volume2 size={18} /> Hear Word
              </button>
            </div>
            <input 
              type="text"
              placeholder="Type exactly what the student spells..."
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={!state.currentStudent || state.isSpinning}
              style={{ fontSize: '1.5rem', padding: '12px', textAlign: 'center', letterSpacing: '2px' }}
              autoComplete="off"
              autoFocus
            />
            
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" style={{ padding: '8px', fontSize: '1rem' }} onClick={checkAuto} disabled={!state.currentStudent || !inputText.trim()}>
                Submit
              </button>
              <button className="btn-success flex-1" style={{ padding: '8px', fontSize: '1rem' }} onClick={overrideCorrect} disabled={!state.currentStudent}>
                <CheckCircle size={18} /> Correct
              </button>
              <button className="btn-danger flex-1" style={{ padding: '8px', fontSize: '1rem' }} onClick={overrideIncorrect} disabled={!state.currentStudent}>
                <XCircle size={18} /> Incorrect
              </button>
            </div>
          </div>

          <div className="glass-panel text-center">
            <h3>Display Controls</h3>
            <div className="flex justify-center mt-2">
              <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '1rem' }} onClick={revealWord} disabled={!state.currentStudent}>
                <Eye size={20} /> Reveal Word on TV
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (Timer & State) */}
        <div className="flex-col gap-2 w-full" style={{ flex: 1 }}>
          
          <div className="glass-panel text-center">
            <h3>Match Timer</h3>
            <div className={`timer-text my-2 ${state.timer <= 10 ? 'danger-text' : ''}`}>
              {Math.floor(state.timer / 60)}:{String(state.timer % 60).padStart(2, '0')}
            </div>
            <button className="btn-primary w-full" style={{ padding: '8px', fontSize: '1rem' }} disabled={!state.currentStudent || !state.timer} onClick={toggleTimer}>
              {state.deadline ? <Pause size={20} /> : <Play size={20} />}
              {state.deadline ? 'Pause' : 'Resume'}
            </button>
          </div>

          <div className="glass-panel gap-2 flex-col text-sm" style={{ flex: 1 }}>
            <h3 className="mb-1">Game Status</h3>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p><b>English level:</b> {state.grade}</p>
              <p><b>Alive:</b> {state.activeStudents.length} / {state.allStudents.length}</p>
              <p><b>Left this round:</b> {currentQueueLength}</p>
            </div>
            <div className="mt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
              <input 
                type="text" 
                placeholder="Student name..." 
                value={manageName}
                onChange={e => setManageName(e.target.value)}
                style={{ fontSize: '0.9rem', padding: '6px', marginBottom: '8px' }}
              />
              <div className="flex gap-2">
                 <button className="btn-success flex-1" style={{ padding: '6px', fontSize: '0.8rem' }} disabled={state.isSpinning || !!state.podium.length || !manageName.trim()} onClick={() => { addStudent(manageName); setManageName(''); }}>Add</button>
                 <button className="btn-danger flex-1" style={{ padding: '6px', fontSize: '0.8rem' }} disabled={state.isSpinning || !!state.currentStudent || !state.activeStudents.includes(manageName.trim())} onClick={() => { removeStudent(manageName); setManageName(''); }}>Remove</button>
              </div>
            </div>
          </div>

          <div className="glass-panel gap-2 flex-col" style={{ flex: 1, minHeight: 0 }}>
            <h3 className="mb-1 flex justify-between items-center text-sm">
              Vocabulary Bank
            </h3>
            
            <div className="flex gap-2 mb-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
              <input 
                type="text" 
                placeholder="Write custom word..." 
                value={customWordText}
                onChange={e => setCustomWordText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addCustomWord(customWordText);
                    setCustomWordText('');
                  }
                }}
                style={{ fontSize: '0.9rem', padding: '6px', flex: 1 }}
              />
              <button 
                className="btn-accent" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }} 
                disabled={!state.currentStudent || !customWordText.trim()} onClick={() => { addCustomWord(customWordText); setCustomWordText(''); }}
              >
                Use
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'flex-start' }}>
              {state.wordsList && state.wordsList.map((word, i) => (
                <button 
                  key={i} 
                  disabled={!state.currentStudent} onClick={() => setCurrentWord(word)}
                  style={{ 
                    padding: '4px 8px', 
                    fontSize: '0.8rem', 
                    background: state.currentWord === word ? 'var(--primary)' : 'rgba(0,0,0,0.05)', 
                    color: state.currentWord === word ? 'white' : 'var(--text-dark)',
                    border: '1px solid currentColor',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherPanel;
