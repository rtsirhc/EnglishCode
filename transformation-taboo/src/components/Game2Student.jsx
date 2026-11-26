import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { tone } from '../../../gallery/shared/sound.js';
import Countdown from './Countdown';

export default function Game2Student({ state }) {
  const { game2 } = state;
  const studentTimedOut = game2.studentTimedOut;
  const prevStatus = useRef(null);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (game2.status === 'success' && prevStatus.current !== 'success') {
      setFlashClass('flash-green');
      setTimeout(() => setFlashClass(''), 800);
      tone('correct');
    } else if (game2.status === 'timeout' && prevStatus.current !== 'timeout') {
      setFlashClass('flash-red');
      setTimeout(() => setFlashClass(''), 800);
    }
    prevStatus.current = game2.status;
  }, [game2.status]);

  const handleNextCard = () => socket.emit('student_next_card');

  const round = game2.roundIndex;
  const score = game2.score;

  if (game2.status === 'idle' || (!game2.current && game2.status !== 'finished')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200/25 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-pink-200/25 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🃏</div>
          <h2 className="text-3xl font-black text-slate-800 mb-1">Taboo!</h2>
          <p className="text-violet-600 text-lg mb-2 font-semibold">Round {round + 1} of 15</p>
          <p className="text-slate-500 mb-8">
            Describe the word <span className="text-slate-800 font-bold">without</span> using the forbidden words!
          </p>
          <div className="mb-6 flex justify-center gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 max-w-[20px] transition-all duration-300 ${
                  i < round ? 'bg-violet-400' : i === round ? 'bg-violet-300 animate-pulse' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <button
            id="student-next-card-btn"
            onClick={handleNextCard}
            className="btn-primary w-full py-7 text-2xl bg-gradient-to-r from-violet-500 to-violet-400 hover:from-violet-400 hover:to-violet-300 rounded-3xl shadow-lg shadow-violet-200 gap-3"
          >
            <span>▶️</span> Next Card
          </button>
        </div>
      </div>
    );
  }

  if (game2.status === 'success') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${flashClass}`}>
        <div className="text-center max-w-sm animate-bounce-in">
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-4xl font-black text-emerald-600 mb-2">Correct!</h2>
          <p className="text-slate-800 text-2xl font-bold mb-1">{game2.current?.keyword}</p>
          <p className="text-slate-500 mb-2">+1 point</p>
          <p className="text-violet-600 font-semibold text-xl mb-8">Score: {score} / {round}</p>

            <button
              id="student-next-card-after-success-btn"
              onClick={handleNextCard}
              className="btn-primary w-full py-6 text-xl bg-gradient-to-r from-violet-500 to-violet-400 hover:from-violet-400 hover:to-violet-300 rounded-3xl shadow-lg shadow-violet-200 gap-2"
            >
              {round === 15 ? 'See final score' : 'Next Card →'}
            </button>

        </div>
      </div>
    );
  }

  if (game2.status === 'timeout') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${flashClass}`}>
        <div className="text-center max-w-sm animate-bounce-in">
          <div className="text-8xl mb-4">⏰</div>
          <h2 className="text-4xl font-black text-rose-500 mb-2">Time's Up!</h2>
          <p className="text-slate-500 mb-2">No point this round.</p>
          <p className="text-violet-600 font-semibold text-xl mb-8">Score: {score} / {round}</p>

            <button
              id="student-next-card-after-timeout-btn"
              onClick={handleNextCard}
              className="btn-primary w-full py-6 text-xl bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-3xl gap-2"
            >
              {round === 15 ? 'See final score' : 'Next Card →'}
            </button>

        </div>
      </div>
    );
  }

  if (game2.status === 'active' && game2.current) {
    return (
      <div className={`min-h-screen flex flex-col ${flashClass}`}>
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-400 z-10" />
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 -right-32 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -left-32 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl" />
        </div>

        <header className="relative z-10 px-4 pt-7 pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">🃏 Game 2</span>
            <p className="text-slate-800 font-bold">Round {round} of 15 · Score: {score}</p>
          </div>
          {!studentTimedOut ? (
            <Countdown totalSeconds={45} startedAt={game2.startedAt} color="violet" active={true} />
          ) : (
            <div className="text-center">
              <div className="text-orange-500 text-sm font-bold animate-pulse">Teacher is guessing…</div>
              <Countdown totalSeconds={60} startedAt={game2.startedAt} color="orange" active={true} />
            </div>
          )}
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="w-full max-w-md animate-bounce-in">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-3xl p-8 text-center glow-violet shadow-sm">
              <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-3">Describe This Word!</p>
              <p className="text-slate-800 text-5xl font-black mb-6 tracking-tight">
                {game2.current.keyword}
              </p>
              <div className="border-t border-violet-200 pt-4">
                <p className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-3">🚫 Forbidden Words</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {game2.current.taboo_words.map((word) => (
                    <span key={word} className="bg-rose-100 border border-rose-300 text-rose-700 font-bold px-3 py-1 rounded-full text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!studentTimedOut ? (
            <p className="text-slate-500 text-sm text-center font-medium">
              Describe the word without saying any forbidden words!<br />
              The teacher will try to guess it.
            </p>
          ) : (
            <div className="text-center animate-fade-in">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-6 py-3">
                <p className="text-orange-600 font-bold">Your time is up!</p>
                <p className="text-slate-500 text-sm">The teacher has 15 seconds to type their final guess…</p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}
