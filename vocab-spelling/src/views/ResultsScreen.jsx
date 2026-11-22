import { useState, useEffect, useMemo } from 'react';
import { socket } from '../lib/socket';

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#f0b429', '#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
      size: `${6 + Math.random() * 8}px`,
    }));
  }, []);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ResultsScreen({ money, reviewList, totalWords, wordsCompleted, roomId, role, elapsedTime, timePenalty, finalTime }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const correctCount = wordsCompleted - reviewList.length;
  const accuracy = wordsCompleted > 0 ? Math.round((correctCount / wordsCompleted) * 100) : 0;
  const isPerfect = reviewList.length === 0;

  // Fetch leaderboard on mount
  useEffect(() => {
    socket.emit('get_leaderboard', (lb) => {
      if (Array.isArray(lb)) setLeaderboard(lb);
    });
  }, []);

  const handlePlayAgain = () => {
    socket.emit('restart_game', { roomId });
  };

  return (
    <div className="w-full max-w-2xl mx-auto fade-in text-center">
      {isPerfect && <Confetti />}

      {/* Trophy / Result */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-10 mb-6">
        <div className={`text-7xl mb-4 ${isPerfect ? 'celebrate' : ''}`}>
          {isPerfect ? '🏆' : accuracy >= 70 ? '🌟' : '📚'}
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">
          {isPerfect ? 'PERFECT GAME!' : accuracy >= 70 ? 'Great Job!' : 'Keep Studying!'}
        </h1>

        <p className="text-slate-400 mb-6">
          You completed {wordsCompleted} of {totalWords} words.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-deep-bg rounded-xl p-4">
            <p className={`text-3xl font-extrabold ${money < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {money < 0 ? '-' : ''}${Math.abs(money).toLocaleString()}
            </p>
            <p className="text-slate-500 text-xs mt-1 uppercase">Final Balance</p>
          </div>
          <div className="bg-deep-bg rounded-xl p-4">
            <p className="text-indigo-400 text-3xl font-extrabold">{correctCount}</p>
            <p className="text-slate-500 text-xs mt-1 uppercase">Correct</p>
          </div>
          <div className="bg-deep-bg rounded-xl p-4">
            <p className="text-amber-400 text-3xl font-extrabold">{accuracy}%</p>
            <p className="text-slate-500 text-xs mt-1 uppercase">Accuracy</p>
          </div>
          <div className="bg-deep-bg rounded-xl p-4">
            <p className="text-cyan-400 text-3xl font-extrabold">{finalTime ? formatTime(finalTime) : (elapsedTime ? formatTime(elapsedTime) : '--')}</p>
            <p className="text-slate-500 text-xs mt-1 uppercase">Final Time</p>
          </div>
        </div>

        {/* Time penalty breakdown */}
        {timePenalty > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-sm">
            <p className="text-slate-400">
              ⏱ Actual time: <span className="text-white font-bold">{formatTime(elapsedTime)}</span>
              {' + '}
              <span className="text-red-400 font-bold">{formatTime(timePenalty)} penalty</span>
              {' (debt: -${' + Math.abs(money).toLocaleString() + '} → '}
              <span className="text-red-400 font-bold">{Math.floor(Math.abs(money) / 100)} min added</span>)
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 text-left">
        <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4 text-center">
          🏆 Best Times Leaderboard
        </h3>
        {leaderboard.length === 0 ? (
          <p className="text-slate-600 text-center text-sm py-4">No records yet. Complete a full game to set a time!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                  i === 0
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : i === 1
                    ? 'bg-slate-400/10 border-slate-400/20'
                    : i === 2
                    ? 'bg-orange-500/10 border-orange-500/20'
                    : 'bg-deep-bg border-card-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-extrabold w-8 ${
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div>
                    <span className="text-white font-bold text-sm">{entry.room}</span>
                    <span className="text-slate-500 text-xs ml-2">{formatDate(entry.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-xs">{entry.accuracy}% acc</span>
                  <span className={`text-xs font-bold ${entry.money < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {entry.money < 0 ? '-' : ''}${Math.abs(entry.money).toLocaleString()}
                  </span>
                  {entry.penalty > 0 && (
                    <span className="text-red-400/60 text-xs">+{formatTime(entry.penalty)}</span>
                  )}
                  <span className="text-cyan-400 font-mono font-extrabold text-lg">{formatTime(entry.time)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review List */}
      {reviewList.length > 0 && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 text-left">
          <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4 text-center">
            📋 Words to Study ({reviewList.length})
          </h3>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {reviewList.map((word, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-500/8 rounded-lg border border-red-500/15">
                <span className="text-red-400/60 text-xs font-mono w-5">{i + 1}.</span>
                <span className="text-red-300 font-medium text-sm">{word}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewList.length === 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-green-400 font-bold text-lg">Perfect Score!</p>
          <p className="text-green-300/70 text-sm">Every single word spelled correctly!</p>
        </div>
      )}

      {/* Play Again */}
      {role === 'Teacher' && (
        <button
          onClick={handlePlayAgain}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-lg shadow-green-900/30 cursor-pointer"
        >
          🔄 Play Again
        </button>
      )}
    </div>
  );
}
