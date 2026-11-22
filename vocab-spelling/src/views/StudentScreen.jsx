import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';

export default function StudentScreen({ roomId, gameState }) {
  const [betInput, setBetInput] = useState('');
  const [flashClass, setFlashClass] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const {
    phase,
    money,
    currentBet,
    streak,
    resultType,
    reviewList,
    currentWordIndex,
    totalWords,
    teacherConnected,
    currentWord,
    doubleAccepted,
    gameStartTime,
    suddenDeath,
    lastTypedAnswer,
  } = gameState;

  // Global stopwatch
  useEffect(() => {
    if (!gameStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Flash on result
  useEffect(() => {
    if (phase === 'result' && resultType) {
      setFlashClass(resultType === 'correct' ? 'flash-green' : 'flash-red');
      const t = setTimeout(() => setFlashClass(''), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, resultType]);

  // Reset bet input on new round
  useEffect(() => {
    if (phase === 'betting') setBetInput('');
  }, [phase, currentWordIndex]);

  const handlePlaceBet = (e) => {
    e.preventDefault();
    const amount = parseInt(betInput, 10);
    if (isNaN(amount) || amount <= 0) return;
    socket.emit('place_bet', { roomId, amount });
  };

  const maxAllowed = money > 0 ? money : Math.abs(money) + 1;

  const handleQuickBet = (pct) => {
    const amount = Math.max(1, Math.floor(maxAllowed * pct));
    socket.emit('place_bet', { roomId, amount });
  };

  const handleDoubleResponse = (accepted) => {
    socket.emit('double_bet_response', { roomId, accepted });
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full max-w-[1100px] mx-auto fade-in ${flashClass}`}>
      {/* Two-column layout */}
      <div className="flex gap-5 items-start">
        {/* LEFT — Main game area */}
        <div className="flex-1 min-w-0">
          {/* Balance & Status */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-5 mb-4 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Your Balance</p>
            <h2 className={`text-5xl font-extrabold pop ${money < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {money < 0 ? '-' : ''}${Math.abs(money).toLocaleString()}
            </h2>
            {money < 0 && (
              <p className="text-red-400/70 text-xs mt-1 font-bold">
                ⚠️ {Math.floor(Math.abs(money) / 100)} min penalty added to final time
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-slate-500 text-sm">
                Word {currentWordIndex + 1} / {totalWords}
              </span>
              {gameStartTime && (
                <span className="px-3 py-1 rounded-full bg-slate-700/50 text-white font-mono font-bold text-sm">
                  ⏱ {formatTime(elapsed)}
                </span>
              )}
              {streak > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs streak-glow">
                  🔥 {streak} Streak
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${teacherConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {teacherConnected ? '🎤 Teacher Online' : '⏳ Waiting'}
              </span>
            </div>
          </div>

          {/* Double Bet Prompt */}
          {phase === 'doublePrompt' && (
            <div className="bg-card-bg border border-amber-500/30 rounded-2xl p-6 mb-4 text-center double-pulse">
              <div className="text-4xl mb-2">🔥</div>
              <h3 className="text-xl font-extrabold text-amber-400 mb-1">Streak Bonus!</h3>
              <p className="text-slate-400 mb-1 text-sm">
                {streak} correct answers in a row!
              </p>
              <p className="text-white font-bold mb-4">
                Double your next bet?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleDoubleResponse(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-extrabold py-3 px-6 rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  🎯 Accept Double!
                </button>
                <button
                  onClick={() => handleDoubleResponse(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
                >
                  ✋ Decline
                </button>
              </div>
            </div>
          )}

          {/* Betting Phase */}
          {phase === 'betting' && (
            <div className="bg-card-bg border border-card-border rounded-2xl p-5 mb-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 text-center">Place Your Bet</p>

              {/* 2× loss warning */}
              <div className="text-center mb-3 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                ⚠️ Wrong = LOSE 2× YOUR BET
              </div>

              {doubleAccepted && (
                <div className="text-center mb-3 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-sm font-bold">
                  ⚡ DOUBLE MODE — Your bet will be doubled!
                </div>
              )}

              <form onSubmit={handlePlaceBet} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-2xl font-bold">$</span>
                  <input
                    type="number"
                    value={betInput}
                    onChange={(e) => setBetInput(e.target.value)}
                    min={1}
                    max={maxAllowed}
                    className="w-full bg-deep-bg border border-card-border rounded-xl p-4 pl-10 text-white text-3xl text-center font-bold focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0.1, 0.25, 0.5, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickBet(pct)}
                      className="bg-deep-bg border border-card-border hover:border-accent-gold text-slate-300 hover:text-accent-gold font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {pct === 1 ? 'ALL IN' : `${pct * 100}%`}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!betInput || parseInt(betInput) <= 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl text-lg transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Place Bet{doubleAccepted ? ' (2×)' : ''}
                </button>
              </form>
            </div>
          )}

          {/* Typing Phase — Student View (NO live typing preview) */}
          {phase === 'typing' && (
            <div className={`bg-card-bg border rounded-2xl p-6 mb-4 text-center ${suddenDeath ? 'border-red-500/50 bg-red-500/5' : 'border-card-border'}`}>
              {suddenDeath && (
                <div className="mb-3">
                  <div className="text-5xl mb-1 animate-pulse">💀</div>
                  <h3 className="text-2xl font-extrabold text-red-400 tracking-wider">SUDDEN DEATH</h3>
                  <p className="text-red-300 text-sm font-bold">FORCED ALL-IN — ${currentBet.toLocaleString()}</p>
                </div>
              )}
              {!suddenDeath && (
                <>
                  <div className="text-3xl mb-2">✍️</div>
                  <p className="text-slate-400 mb-1">Teacher is spelling…</p>
                </>
              )}
              <p className="text-amber-400 font-bold">
                Your bet: <span className="text-xl">${currentBet.toLocaleString()}{doubleAccepted ? ' (2×)' : ''}</span>
              </p>
              <p className="text-slate-600 text-xs mt-3">Listen carefully and wait for the result…</p>
            </div>
          )}

          {/* Result Phase */}
          {phase === 'result' && (
            <div className={`rounded-2xl p-6 mb-4 text-center border ${resultType === 'correct' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-4xl mb-2">{resultType === 'correct' ? '🎉' : '💸'}</div>
              <p className={`text-2xl font-extrabold ${resultType === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {resultType === 'correct' ? 'CORRECT!' : 'WRONG — LOST 2×'}
              </p>
              <p className={`text-xl font-bold mt-1 ${resultType === 'correct' ? 'text-green-300' : 'text-red-300'}`}>
                {resultType === 'correct' 
                  ? `+$${(currentBet * (doubleAccepted ? 2 : 1)).toLocaleString()}` 
                  : `-$${(currentBet * 2 * (doubleAccepted ? 2 : 1)).toLocaleString()}`}
              </p>

              {/* Always show the correct answer */}
              <div className="mt-4 p-3 bg-deep-bg rounded-xl">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Correct Spelling</p>
                <p className="text-white text-2xl font-bold font-mono tracking-wider">{currentWord}</p>
              </div>

              {/* If wrong, also show what was typed */}
              {resultType === 'wrong' && lastTypedAnswer && (
                <div className="mt-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-400/70 text-xs uppercase tracking-widest mb-1">What Was Typed</p>
                  <p className="text-red-300 text-xl font-bold font-mono tracking-wider">{lastTypedAnswer}</p>
                </div>
              )}

              <p className="text-slate-500 text-sm mt-3">Waiting for teacher to advance…</p>
            </div>
          )}
        </div>

        {/* RIGHT — Review Box (always visible) */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-card-bg border border-card-border rounded-2xl p-4 sticky top-4">
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>📋 Review Box</span>
              <span className="text-slate-500 font-mono">{reviewList.length} missed</span>
            </h3>

            {reviewList.length === 0 ? (
              <div className="text-center py-10">
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
