import { socket } from '../lib/socket';

export default function TriviaTeacherScreen({ roomId, gameState }) {
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
    studentConnected,
    reviewList = [],
  } = gameState;

  const handleNextQuestion = () => socket.emit('trivia_next', { roomId });

  return (
    <div className="w-full max-w-[1400px] mx-auto fade-in">
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Question</span>
          <span className="text-white font-bold text-lg">{triviaIndex + 1}</span>
          <span className="text-slate-500">/ {triviaTotal}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 font-bold text-xs">
            ✅ {triviaCorrect}/{triviaAnswered} correct
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500/15 text-green-400 font-bold">
            💰 ${money.toLocaleString()}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${studentConnected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
            {studentConnected ? '🎓 Student Online' : '⏳ Waiting'}
          </div>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* LEFT — Question area */}
        <div className="flex-1 min-w-0">
          {/* Phase badge */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 mb-4 text-center">
            <span className="text-indigo-400 font-bold text-sm">🧠 TRIVIA EARNING PHASE</span>
            <span className="text-slate-500 text-xs ml-2">— Student answers, each correct = $100</span>
          </div>

          {/* Question Card */}
          {triviaPhase === 'question' && question && (
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Question {triviaIndex + 1}</p>
              <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                {question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {choices.map((choice, i) => (
                  <div
                    key={i}
                    className="bg-deep-bg border border-card-border text-slate-400 font-medium py-4 px-5 rounded-xl text-left"
                  >
                    <span className="text-accent-gold/40 font-bold mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {choice}
                  </div>
                ))}
              </div>

              <p className="text-slate-600 text-xs text-center mt-4">
                ⏳ Waiting for the student to answer…
              </p>
            </div>
          )}

          {/* Result */}
          {triviaPhase === 'result' && (
            <div className={`rounded-2xl p-6 mb-4 text-center border ${triviaLastResult === 'correct' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-4xl mb-2">{triviaLastResult === 'correct' ? '✅' : '❌'}</div>
              <p className={`text-2xl font-extrabold ${triviaLastResult === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {triviaLastResult === 'correct' ? 'CORRECT! +$100' : 'INCORRECT'}
              </p>
              {triviaLastResult === 'wrong' && (
                <p className="text-slate-400 mt-2">
                  Correct answer: <span className="text-white font-bold">{triviaLastCorrectAnswer}</span>
                </p>
              )}

              <button
                onClick={handleNextQuestion}
                className="mt-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Next Question →
              </button>

              {triviaCanStartSpelling && (
                <p className="text-green-400/60 text-xs mt-3">
                  ✅ Student can choose to start the spelling game at any time
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Stats + Review */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Stats panel */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-4 sticky top-4">
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4">📊 Trivia Progress</h3>

            <div className="bg-deep-bg rounded-xl p-4 mb-3 text-center">
              <p className="text-slate-500 text-xs uppercase mb-1">Earned So Far</p>
              <p className="text-3xl font-extrabold text-green-400">${money.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-deep-bg rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-indigo-400">{triviaCorrect}</p>
                <p className="text-slate-500 text-xs">Correct</p>
              </div>
              <div className="bg-deep-bg rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-400">{triviaAnswered - triviaCorrect}</p>
                <p className="text-slate-500 text-xs">Wrong</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{triviaAnswered}/{triviaTotal}</span>
              </div>
              <div className="w-full h-2 bg-deep-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(triviaAnswered / triviaTotal) * 100}%` }}
                />
              </div>
            </div>

            <div className={`rounded-lg p-3 text-center text-sm ${triviaCanStartSpelling ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-slate-800 border border-card-border text-slate-500'}`}>
              {triviaCanStartSpelling
                ? '✅ Spelling game unlocked!'
                : `🔒 Answer ${Math.max(0, 10 - triviaAnswered)} more to unlock`
              }
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
