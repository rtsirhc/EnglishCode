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

export default function Game1Teacher({ state }) {
  const { game1 } = state;
  const prevStatus = useRef(null);
  const [flashClass, setFlashClass] = useState('');

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

  const handleGrade = (correct) => socket.emit('teacher_grade', { correct });
  const handleNext  = ()        => socket.emit('game1_next');
  const handleAdvanceToGame2 = () => socket.emit('teacher_advance_game');

  const totalQs   = game1.totalQuestions ?? 20;
  const answered  = game1.correctCount;
  const progressPct = Math.round((answered / totalQs) * 100);

  if (game1.status === 'win') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-4 animate-bounce-in">🎉</div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">All Done!</h2>
          <p className="text-sky-600 text-xl mb-6 font-semibold">The student answered all {totalQs} questions correctly!</p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-3 rounded-full w-full" />
          </div>
          <button
            id="teacher-advance-game2-btn"
            onClick={handleAdvanceToGame2}
            className="btn-primary w-full py-6 text-2xl bg-gradient-to-r from-violet-500 to-violet-400 hover:from-violet-400 hover:to-violet-300 rounded-3xl shadow-lg shadow-violet-200 gap-3"
          >
            <span>🃏</span> Start Game 2: Taboo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col p-4 gap-4 max-w-2xl mx-auto ${flashClass}`}>
      {/* Progress */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Progress</span>
          <span className="text-slate-500 text-sm font-semibold">{answered} / {totalQs} correct · {game1.remainingInQueue} in queue</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-sky-300 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {!game1.current ? (
        <div className="text-center text-slate-400 py-12 animate-pulse-slow">
          <p className="text-lg">Waiting for next question…</p>
        </div>
      ) : (
        <>
          {/* Current Question Card */}
          <div className="bg-white border border-sky-200 rounded-3xl p-5 glow-sky animate-slide-up shadow-sm">
            {game1.current.tense && (
              <div className="mb-3">
                <span className="inline-block bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full">
                  {TENSE_LABELS[game1.current.tense] ?? game1.current.tense}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Task</p>
                <p className="text-sky-600 text-xl font-bold">{game1.current.request}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Original Sentence</p>
                <p className="text-slate-800 text-2xl font-bold">"{game1.current.original_sentence}"</p>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">✓ Correct Answer</p>
                <p className="text-emerald-700 text-xl font-semibold">"{game1.current.correct_answer}"</p>
              </div>
            </div>
          </div>

          {game1.status === 'revealed' && (
            <div className="flex justify-center animate-fade-in">
              <Countdown totalSeconds={10} startedAt={game1.revealedAt} color="sky" active={true} />
            </div>
          )}

          {game1.status === 'revealed' && (
            <div className="grid grid-cols-2 gap-4 animate-bounce-in">
              <button
                id="teacher-correct-btn"
                onClick={() => handleGrade(true)}
                className="btn-primary py-7 text-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 rounded-3xl shadow-lg shadow-emerald-100 gap-2 flex-col"
              >
                <span className="text-4xl">✅</span>
                <span>Correct</span>
              </button>
              <button
                id="teacher-incorrect-btn"
                onClick={() => handleGrade(false)}
                className="btn-primary py-7 text-2xl bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 rounded-3xl shadow-lg shadow-rose-100 gap-2 flex-col"
              >
                <span className="text-4xl">❌</span>
                <span>Incorrect</span>
              </button>
            </div>
          )}

          {game1.status === 'idle' && (
            <div className="text-center py-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-2xl px-6 py-3">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
                <span className="text-slate-600 font-medium">Waiting for student to reveal…</span>
              </div>
            </div>
          )}

          {game1.status === 'correct' && (
            <div className="flex flex-col items-center gap-3 py-4 animate-bounce-in">
              <p className="text-emerald-600 text-xl font-black">✅ Marked Correct!</p>
              <button
                id="teacher-next-btn"
                onClick={handleNext}
                className="btn-primary px-8 py-4 text-xl bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl gap-2"
              >
                Next Question →
              </button>
            </div>
          )}

          {game1.status === 'incorrect' && (
            <div className="flex flex-col items-center gap-3 py-4 animate-bounce-in">
              <p className="text-rose-500 text-xl font-black">❌ Shuffled back into queue</p>
              <button
                id="teacher-continue-btn"
                onClick={handleNext}
                className="btn-primary px-8 py-4 text-xl bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl gap-2"
              >
                Continue →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
