import { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';

export default function TeacherScreen({ roomId, gameState }) {
  const [inputValue, setInputValue] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [flashClass, setFlashClass] = useState('');

  const [moneyInput, setMoneyInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef(null);

  const {
    currentWord,
    phase,

    resultType,
    currentWordIndex,
    totalWords,
    money,
    currentBet,
    betPlaced,
    streak,
    reviewList,
    wordsCompleted,
    studentConnected,
    gameStartTime,
    suddenDeath,
  } = gameState;



  // Flash on result
  useEffect(() => {
    if (phase === 'result' && resultType) {
      setFlashClass(resultType === 'correct' ? 'flash-green' : 'flash-red');
      const t = setTimeout(() => setFlashClass(''), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, resultType]);

  // Global stopwatch
  useEffect(() => {
    if (!gameStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Reset input on new round
  useEffect(() => {
    if (phase === 'typing') {
      setInputValue('');
      setHasStartedTyping(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }, [phase, currentWordIndex]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (!hasStartedTyping && val.length > 0) {
      setHasStartedTyping(true);
    }
    socket.emit('typing_update', { roomId, text: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phase !== 'typing' || !inputValue.trim()) return;
    socket.emit('submit_answer', { roomId, answer: inputValue });
  };

  const handleNextRound = () => socket.emit('next_round', { roomId });
  const handleOverrideCorrect = () => socket.emit('override_correct', { roomId });


  const handleSetMoney = (e) => {
    e.preventDefault();
    const val = parseInt(moneyInput, 10);
    if (isNaN(val)) return;
    socket.emit('set_money', { roomId, amount: val });
    setMoneyInput('');
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };



  return (
    <div className={`w-full max-w-[1400px] mx-auto fade-in ${flashClass}`}>
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Word</span>
          <span className="text-white font-bold text-lg">{currentWordIndex + 1}</span>
          <span className="text-slate-500">/ {totalWords}</span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs streak-glow">
              🔥 STREAK: {streak}
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-green-500/15 text-green-400 font-bold">
            💰 ${money.toLocaleString()}
          </div>
          {gameStartTime && (
            <div className="px-3 py-1 rounded-full bg-slate-700/50 text-white font-mono font-bold text-sm">
              ⏱ {formatTime(elapsed)}
            </div>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${studentConnected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
            {studentConnected ? '🎓 Student Online' : '⏳ Waiting for Student'}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5 items-start">
        {/* LEFT — Main game area */}
        <div className="flex-1 min-w-0">
          {/* Current Word Card */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-4">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 text-center">Read This Word Aloud</p>
            <h2 className="text-5xl font-extrabold text-center text-white tracking-wide">
              {currentWord}
            </h2>
            {betPlaced && (
              <p className="text-center text-amber-400 text-sm mt-3 font-medium">
                Student bet: <span className="font-bold">${currentBet.toLocaleString()}</span>
              </p>
            )}
          </div>



          {/* Typing Input */}
          {phase === 'typing' && (
            <form onSubmit={handleSubmit} className="mb-4">
              {suddenDeath && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-3 text-center">
                  <span className="text-3xl">💀</span>
                  <span className="text-red-400 font-extrabold text-lg ml-2 tracking-wider">SUDDEN DEATH — ALL IN: ${currentBet.toLocaleString()}</span>
                </div>
              )}
              <div className="bg-card-bg border border-card-border rounded-2xl p-5">
                <label className="text-slate-500 text-xs uppercase tracking-widest block mb-2">
                  Type the spelling below
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-full bg-deep-bg border border-card-border rounded-xl p-3.5 text-white text-2xl text-center font-bold tracking-wider focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/30"
                  placeholder="Start typing…"
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-lg transition-all shadow-lg shadow-indigo-900/30 cursor-pointer"
                >
                  Submit (Enter ↵)
                </button>
              </div>
            </form>
          )}

          {/* Waiting for bet */}
          {phase === 'betting' && (
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-4 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <p className="text-slate-400">Waiting for student to place their bet…</p>
            </div>
          )}

          {/* Double prompt */}
          {phase === 'doublePrompt' && (
            <div className="bg-card-bg border border-amber-500/30 rounded-2xl p-6 mb-4 text-center streak-glow">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-amber-400 font-bold">Streak Bonus!</p>
              <p className="text-slate-400 mt-1 text-sm">Waiting for student to accept or decline…</p>
            </div>
          )}

          {/* Result */}
          {phase === 'result' && (
            <div className={`rounded-2xl p-6 mb-4 text-center border ${resultType === 'correct' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-4xl mb-2">{resultType === 'correct' ? '✅' : '❌'}</div>
              <p className={`text-2xl font-extrabold ${resultType === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {resultType === 'correct' ? 'CORRECT!' : 'INCORRECT'}
              </p>
              <p className="text-slate-400 mt-1 text-sm">
                The word was: <span className="text-white font-bold">{currentWord}</span>
              </p>
              <button
                onClick={handleNextRound}
                className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Next Word →
              </button>
            </div>
          )}

          {/* Override + Money Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Override Panel */}
            <div className="bg-card-bg border border-card-border rounded-2xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Teacher Override</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleOverrideCorrect}
                  disabled={phase !== 'result' || resultType === 'correct'}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-green-500/20 cursor-pointer"
                >
                  ✓ Mark Correct
                </button>

              </div>
            </div>

            {/* Manual Money Adjustment */}
            <div className="bg-card-bg border border-card-border rounded-2xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Adjust Balance</p>
              <form onSubmit={handleSetMoney} className="flex flex-col gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">$</span>
                  <input
                    type="number"
                    value={moneyInput}
                    onChange={(e) => setMoneyInput(e.target.value)}
                    className="w-full bg-deep-bg border border-card-border rounded-lg py-2 pl-8 pr-3 text-white font-bold text-center focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={money.toLocaleString()}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold py-2 rounded-lg text-sm transition-colors border border-indigo-500/20 cursor-pointer"
                >
                  💰 Set Balance
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT — Review Box (always visible) */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-card-bg border border-card-border rounded-2xl p-4 sticky top-4">
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>📋 Review Box</span>
              <span className="text-slate-500 font-mono">{reviewList.length}</span>
            </h3>

            {reviewList.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2 opacity-30">✨</div>
                <p className="text-slate-600 text-sm">No missed words yet!</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {reviewList.map((word, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-500/8 rounded-lg border border-red-500/15">
                    <span className="text-red-400/60 text-xs font-mono w-5">{i + 1}.</span>
                    <span className="text-red-300 font-medium text-sm">{word}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
