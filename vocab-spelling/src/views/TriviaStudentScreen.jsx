import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';

export default function TriviaStudentScreen({ roomId, gameState }) {
  const [flashClass, setFlashClass] = useState('');

  const {
    triviaIndex,
    triviaTotal,
    triviaCorrect,
    triviaAnswered,
    triviaPhase,
    triviaLastResult,
    triviaLastCorrectAnswer,
    triviaCanStartSpelling,
    money,
    question,
    choices,
    teacherConnected,
    reviewList = [],
  } = gameState;

  // Flash on result
  useEffect(() => {
    if (triviaPhase === 'result' && triviaLastResult) {
      setFlashClass(triviaLastResult === 'correct' ? 'flash-green' : 'flash-red');
      const t = setTimeout(() => setFlashClass(''), 1800);
      return () => clearTimeout(t);
    }
  }, [triviaPhase, triviaLastResult]);

  const handleAnswer = (index) => {
    if (triviaPhase !== 'question') return;
    socket.emit('trivia_answer', { roomId, choiceIndex: index });
  };

  const handleStartSpelling = () => {
    socket.emit('start_spelling', { roomId });
  };

  const handleNextQuestion = () => {
    socket.emit('trivia_next', { roomId });
  };

  const accuracy = triviaAnswered > 0 ? Math.round((triviaCorrect / triviaAnswered) * 100) : 0;

  return (
    <div className={`w-full max-w-[1100px] mx-auto fade-in ${flashClass}`}>
      <div className="flex gap-5 items-start">
        {/* LEFT — Main area */}
        <div className="flex-1 min-w-0">
          {/* Balance */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-5 mb-4 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Your Balance</p>
            <h2 className="text-5xl font-extrabold text-green-400 pop">
              ${money.toLocaleString()}
            </h2>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="text-slate-500 text-sm">
                Question {triviaIndex + 1} / {triviaTotal}
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 font-bold text-xs">
                🧠 TRIVIA PHASE
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${teacherConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {teacherConnected ? '🎤 Teacher Online' : '⏳ Waiting'}
              </span>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 mb-4 text-center">
            <span className="text-indigo-300 text-sm">Each correct answer earns you <span className="font-bold text-green-400">$100</span>!</span>
          </div>

          {/* Question */}
          {triviaPhase === 'question' && question && (
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Question {triviaIndex + 1}</p>
              <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                {question}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="bg-deep-bg border border-card-border hover:border-accent-gold hover:bg-accent-gold/10 text-white font-medium py-4 px-5 rounded-xl text-left transition-all cursor-pointer group text-lg"
                  >
                    <span className="inline-block w-8 h-8 rounded-lg bg-card-border text-center leading-8 text-accent-gold/80 font-bold mr-3 group-hover:bg-accent-gold group-hover:text-slate-900 transition-all">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {triviaPhase === 'result' && (
            <div className={`rounded-2xl p-6 mb-4 text-center border ${triviaLastResult === 'correct' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-5xl mb-3">{triviaLastResult === 'correct' ? '🎉' : '💡'}</div>
              <p className={`text-3xl font-extrabold ${triviaLastResult === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {triviaLastResult === 'correct' ? '+$100!' : 'Not quite!'}
              </p>
              {triviaLastResult === 'wrong' && (
                <p className="text-slate-400 mt-3">
                  The answer was: <span className="text-white font-bold text-lg">{triviaLastCorrectAnswer}</span>
                </p>
              )}

              {/* Student controls: continue trivia or start spelling */}
              <div className="flex gap-3 justify-center mt-5 flex-wrap">
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Keep Earning →
                </button>

                {triviaCanStartSpelling && (
                  <button
                    onClick={handleStartSpelling}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    🎯 Start Spelling Game
                  </button>
                )}
              </div>

              {!triviaCanStartSpelling && (
                <p className="text-slate-600 text-xs mt-3">
                  Answer {Math.max(0, 10 - triviaAnswered)} more question{10 - triviaAnswered !== 1 ? 's' : ''} to unlock the spelling game
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Stats + Review */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Stats card */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-4 sticky top-4">
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4">📊 Your Progress</h3>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-deep-bg rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-400">{triviaCorrect}</p>
                <p className="text-slate-500 text-[10px]">Correct</p>
              </div>
              <div className="bg-deep-bg rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-400">{triviaAnswered - triviaCorrect}</p>
                <p className="text-slate-500 text-[10px]">Wrong</p>
              </div>
              <div className="bg-deep-bg rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-indigo-400">{accuracy}%</p>
                <p className="text-slate-500 text-[10px]">Accuracy</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Answered</span>
                <span>{triviaAnswered}/{triviaTotal}</span>
              </div>
              <div className="w-full h-2 bg-deep-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(triviaAnswered / triviaTotal) * 100}%` }}
                />
              </div>
            </div>

            <div className={`rounded-lg p-3 text-center text-sm mb-3 ${triviaCanStartSpelling ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-slate-800 border border-card-border text-slate-500'}`}>
              {triviaCanStartSpelling
                ? '✅ Spelling game unlocked!'
                : `🔒 ${Math.max(0, 10 - triviaAnswered)} more to unlock spelling`
              }
            </div>

            <div className="bg-deep-bg rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs uppercase mb-1">Total Earned</p>
              <p className="text-2xl font-extrabold text-green-400">${money.toLocaleString()}</p>
              <p className="text-slate-600 text-xs mt-1">This is your starting money for the spelling game!</p>
            </div>
          </div>

          {/* Review Box (always visible) */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-4">
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>📋 Review Box</span>
              <span className="text-slate-500 font-mono">{reviewList.length}</span>
            </h3>
            {reviewList.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-2xl mb-1 opacity-30">✨</div>
                <p className="text-slate-600 text-sm">No missed words yet!</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
