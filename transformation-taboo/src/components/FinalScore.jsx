export default function FinalScore({ state, role }) {
  const { game2 } = state;
  const score = game2.score;
  const total = 15;
  const pct = Math.round((score / total) * 100);

  const getMessage = () => {
    if (pct === 100) return { emoji: '🏆', title: 'Perfect Score!', sub: 'Absolutely brilliant — a flawless performance!' };
    if (pct >= 80)  return { emoji: '🌟', title: 'Excellent!',      sub: 'Outstanding vocabulary and description skills!' };
    if (pct >= 60)  return { emoji: '👏', title: 'Great Job!',      sub: 'Good work — keep practising circumlocution!' };
    if (pct >= 40)  return { emoji: '💪', title: 'Nice Effort!',    sub: 'Good start — keep building your vocabulary!' };
    return               { emoji: '📚', title: 'Keep Practising!', sub: "Every game makes you better — don't give up!" };
  };

  const { emoji, title, sub } = getMessage();

  const scoreGradient =
    pct === 100 ? 'from-yellow-400 to-amber-400' :
    pct >= 80   ? 'from-emerald-500 to-emerald-400' :
    pct >= 60   ? 'from-sky-500 to-sky-400' :
    pct >= 40   ? 'from-violet-500 to-violet-400' :
                  'from-slate-400 to-slate-300';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-6">
        <div className="text-8xl animate-bounce-in">{emoji}</div>

        <div>
          <h1 className={`text-5xl font-black bg-gradient-to-r ${scoreGradient} bg-clip-text text-transparent`}>
            {title}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">{sub}</p>
        </div>

        <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Final Score — Game 2</p>

          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className={`text-7xl font-black bg-gradient-to-r ${scoreGradient} bg-clip-text text-transparent`}>
              {score}
            </span>
            <span className="text-slate-400 text-3xl font-bold">/ {total}</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-3">
            <div
              className={`bg-gradient-to-r ${scoreGradient} h-4 rounded-full transition-all duration-1000`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-slate-500 font-semibold">{pct}% success rate</p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-slate-800">{total}</div>
            <div className="text-xs text-slate-400">rounds</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-emerald-600">{score}</div>
            <div className="text-xs text-emerald-500">correct</div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-rose-500">{total - score}</div>
            <div className="text-xs text-rose-400">missed</div>
          </div>
        </div>

        {role === 'teacher' && (
          <p className="text-slate-400 text-sm">
            Click <span className="text-slate-700 font-bold">"Reset"</span> in the header to play again!
          </p>
        )}

        {role === 'student' && (
          <div className="text-center">
            <p className="text-slate-700 text-lg font-bold">🎊 Session Complete!</p>
            <p className="text-slate-500 text-sm mt-1">Well done — great effort today!</p>
          </div>
        )}
      </div>
    </div>
  );
}
