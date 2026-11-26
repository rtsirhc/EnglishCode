import { useState, useRef, useEffect } from 'react';
import socket from '../socket';
import Countdown from './Countdown';

export default function Game2Teacher({ state }) {
  const { game2 } = state;
  const [guess, setGuess] = useState('');
  const [localGuesses, setLocalGuesses] = useState([]);
  const studentTimedOut = game2.studentTimedOut;
  const inputRef = useRef(null);
  const prevRound = useRef(game2.roundIndex);

  useEffect(() => {
    if (game2.roundIndex !== prevRound.current || game2.status === 'active') {
      setLocalGuesses([]);
      setGuess('');
      prevRound.current = game2.roundIndex;
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [game2.roundIndex, game2.status]);

  useEffect(() => {
    if (game2.guesses) setLocalGuesses(game2.guesses.map(g => g.text));
  }, [game2.guesses]);

  const handleSubmitGuess = (e) => {
    e.preventDefault();
    if (!guess.trim() || game2.status !== 'active') return;
    socket.emit('teacher_guess', { guess: guess.trim() });
    setGuess('');
    inputRef.current?.focus();
  };

  const round = game2.roundIndex;
  const score = game2.score;

  if (game2.status === 'idle' || (!game2.current && game2.status !== 'success' && game2.status !== 'timeout')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-3">🎴</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Game 2: Taboo</h2>
          <p className="text-slate-500 mb-6">
            Round {round + 1} of 15 · You are guessing the keyword!<br />
            The student will describe it — type your guess.
          </p>
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 max-w-[20px] transition-all duration-300 ${
                  i < round ? 'bg-violet-400' : i === round ? 'bg-violet-300 animate-pulse' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-2xl px-6 py-3 animate-pulse-slow">
            <p className="text-slate-600 font-medium">Waiting for student to reveal the card…</p>
          </div>
        </div>
      </div>
    );
  }

  if (game2.status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-bounce-in">
        <div className="text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-3xl font-black text-emerald-600 mb-1">Correct!</h2>
          <p className="text-slate-800 text-2xl font-bold mb-1">"{game2.current?.keyword}"</p>
          <p className="text-violet-600 font-semibold text-lg">Score: {score} / {round}</p>
          <p className="text-slate-400 mt-4 text-sm">Waiting for student to start next round…</p>
        </div>
      </div>
    );
  }

  if (game2.status === 'timeout') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-bounce-in">
        <div className="text-center">
          <div className="text-6xl mb-3">⏰</div>
          <h2 className="text-3xl font-black text-rose-500 mb-2">Time's Up!</h2>
          <p className="text-slate-500 mb-1">The keyword was:</p>
          <p className="text-slate-800 text-3xl font-black mb-3">"{game2.current?.keyword}"</p>
          <p className="text-violet-600 font-semibold text-lg">Score: {score} / {round}</p>
          <p className="text-slate-400 mt-4 text-sm">Waiting for student to start next round…</p>
        </div>
      </div>
    );
  }

  if (game2.status === 'active' && game2.current) {
    const timerSeconds = studentTimedOut ? 60 : 45;

    return (
      <div className="flex flex-col p-4 gap-4 max-w-xl mx-auto animate-fade-in">
        {/* Progress + Timer */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">Round {round} of 15</p>
            <p className="text-slate-800 font-bold text-lg">Score: {score}</p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full flex-1 max-w-[16px] transition-all duration-300 ${
                    i < round - 1 ? 'bg-violet-400' : i === round - 1 ? 'bg-violet-300' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            {studentTimedOut && (
              <p className="text-xs text-orange-500 font-bold mb-1 animate-pulse">Last 15 sec!</p>
            )}
            <Countdown
              totalSeconds={timerSeconds}
              startedAt={game2.startedAt}
              color={studentTimedOut ? 'orange' : 'violet'}
              active={true}
            />
          </div>
        </div>

        {/* Taboo words */}
        <div className="bg-violet-50 border border-violet-200 rounded-3xl p-6 glow-violet animate-slide-up">
          <p className="text-violet-600 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            🚫 Forbidden Words (keyword hidden from you)
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {game2.current.taboo_words.map((word) => (
              <span
                key={word}
                className="bg-rose-100 border border-rose-300 text-rose-700 font-bold px-4 py-2 rounded-full text-lg"
              >
                {word}
              </span>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="inline-block bg-slate-100 border border-slate-200 text-slate-400 text-sm font-bold px-4 py-1.5 rounded-full">
              🙈 Keyword is hidden
            </span>
          </div>
        </div>

        {/* Guess Input */}
        <form onSubmit={handleSubmitGuess} className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Type your guess and press Enter
          </label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              id="teacher-guess-input"
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Type the keyword…"
              className="flex-1 bg-white border-2 border-violet-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 rounded-2xl px-5 py-4 text-slate-800 text-xl font-bold placeholder-slate-300 outline-none transition-all shadow-sm"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              type="submit"
              id="teacher-guess-btn"
              className="btn-primary px-5 py-4 text-xl bg-violet-500 hover:bg-violet-400 rounded-2xl shadow-lg shadow-violet-200"
            >
              ↵
            </button>
          </div>
        </form>

        {localGuesses.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your guesses</p>
            <div className="flex flex-wrap gap-2">
              {localGuesses.map((g, i) => (
                <span
                  key={i}
                  className="bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          {studentTimedOut ? (
            <p className="text-orange-500 text-sm font-bold animate-pulse">
              ⚠️ Student time expired — finish typing your guess!
            </p>
          ) : (
            <p className="text-slate-400 text-sm">Listen carefully and type when ready</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
