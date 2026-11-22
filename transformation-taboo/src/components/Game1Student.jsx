import { useEffect, useRef, useState } from 'react';
import socket from '../socket';
import Countdown from './Countdown';

const TENSE_LABELS = {
  simple_present: 'Simple Present',
  simple_past: 'Simple Past',
  present_continuous: 'Present Continuous',
  past_continuous: 'Past Continuous',
  present_perfect: 'Present Perfect',
  past_perfect: 'Past Perfect',
  future_simple: 'Future Simple',
  present_perfect_continuous: 'Present Perfect Continuous',
  past_perfect_continuous: 'Past Perfect Continuous',
};

export default function Game1Student({ state }) {
  const { game1 } = state;
  const [flashClass, setFlashClass] = useState('');
  const prevStatus = useRef(null);

  useEffect(() => {
    if (game1.status === 'correct' && prevStatus.current !== 'correct') {
      setFlashClass('flash-green');
      setTimeout(() => setFlashClass(''), 800);
    } else if (game1.status === 'incorrect' && prevStatus.current !== 'incorrect') {
      setFlashClass('flash-red');
      setTimeout(() => setFlashClass(''), 800);
    }
    prevStatus.current = game1.status;
  }, [game1.status]);

  const handleReveal = () => socket.emit('student_reveal');
  const handleNext   = () => socket.emit('game1_next');

  const totalQs     = game1.totalQuestions ?? 20;
  const remaining   = game1.queue.length + (game1.current ? 1 : 0);
  const answered    = game1.correctCount;
  const progressPct = Math.round((answered / totalQs) * 100);

  if (game1.status === 'win') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        </div>
        <div className="text-center max-w-sm relative z-10">
          <div className="text-8xl mb-6 animate-bounce-in">🏆</div>
          <h2 className="text-4xl font-black text-slate-800 mb-3">Game 1 Complete!</h2>
          <p className="text-sky-600 text-xl mb-2 font-semibold">All {totalQs} questions answered!</p>
          <p className="text-slate-500 mb-10">Waiting for teacher to unlock Game 2…</p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-3 rounded-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${flashClass}`}>
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-sky-300 z-10" />

      {/* Soft background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-sky-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-sky-200/25 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-7 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">⚡ Game 1</span>
            <h1 className="text-slate-800 font-black text-xl leading-tight">Transformation Drill</h1>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-800">{answered}</div>
            <div className="text-xs text-slate-400">correct</div>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-sky-300 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{answered} answered correctly</span>
          <span>{remaining} remaining</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {!game1.current ? (
          <div className="text-center text-slate-400 animate-pulse-slow">
            <p className="text-lg">Waiting for the next question…</p>
          </div>
        ) : (
          <>
            {/* Task card */}
            <div className="w-full max-w-md bg-sky-50 border-2 border-sky-200 rounded-3xl p-6 text-center glow-sky animate-slide-up">
              {game1.current.tense && (
                <span className="inline-block bg-sky-200 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {TENSE_LABELS[game1.current.tense] ?? game1.current.tense}
                </span>
              )}
              <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">Your Task</p>
              <p className="text-slate-800 text-3xl font-black leading-tight">
                {game1.current.request}
              </p>
            </div>

            {game1.status === 'idle' && (
              <button
                id="student-reveal-btn"
                onClick={handleReveal}
                className="btn-primary w-full max-w-md py-7 text-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 rounded-3xl shadow-lg shadow-sky-200 animate-bounce-in gap-3"
              >
                <span>👁️</span> Reveal Sentence
              </button>
            )}

            {(game1.status === 'revealed' || game1.status === 'correct' || game1.status === 'incorrect') && (
              <>
                <div className={`w-full max-w-md bg-white border-2 rounded-3xl p-6 text-center animate-bounce-in shadow-sm
                  ${game1.status === 'correct' ? 'border-emerald-300' : game1.status === 'incorrect' ? 'border-rose-300' : 'border-slate-200'}
                `}>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Original Sentence</p>
                  <p className="text-slate-800 text-2xl font-bold leading-snug">
                    "{game1.current.original_sentence}"
                  </p>
                </div>

                {game1.status === 'revealed' && (
                  <div className="flex flex-col items-center gap-2">
                    <Countdown totalSeconds={10} startedAt={game1.revealedAt} color="sky" active={true} />
                    <p className="text-slate-500 text-sm font-medium">Answer out loud!</p>
                  </div>
                )}

                {game1.status === 'correct' && (
                  <div className="flex flex-col items-center gap-4 animate-bounce-in">
                    <div className="text-6xl">✅</div>
                    <p className="text-emerald-600 text-2xl font-black">Correct!</p>
                    <button
                      id="student-next-btn"
                      onClick={handleNext}
                      className="btn-primary px-8 py-4 text-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 rounded-2xl shadow-lg shadow-emerald-100 gap-2"
                    >
                      Next Question →
                    </button>
                  </div>
                )}

                {game1.status === 'incorrect' && (
                  <div className="flex flex-col items-center gap-4 animate-bounce-in">
                    <div className="text-6xl">❌</div>
                    <p className="text-rose-500 text-2xl font-black">Try Again Later</p>
                    <p className="text-slate-400 text-sm">Question shuffled back into the queue</p>
                    <button
                      id="student-next-after-incorrect-btn"
                      onClick={handleNext}
                      className="btn-primary px-8 py-4 text-xl bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-2xl gap-2"
                    >
                      Continue →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
