import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';
import { getRandomGameSet } from '../data/questions';

export default function DealerDashboard({ roomId, gameState }) {
    const [manualAdjustment, setManualAdjustment] = useState('');

    const bankroll = gameState?.bankroll || 1000;
    const questionsList = gameState?.questions || [];
    const currentIndex = gameState?.currentQuestionIndex ?? 0;
    const currentQuestion = questionsList.length > 0 ? questionsList[currentIndex] : null;
    const currentBid = gameState?.currentBid || 50;
    const streak = gameState?.streak || 0;
    const multiplier = streak >= 3 ? 3 : 1;
    const questionNumber = currentIndex + 1;
    const totalQuestions = questionsList.length;

    const updateState = (newState) => {
        socket.emit('update_state', { roomId, newState });
    };

    useEffect(() => {
        if (!gameState?.questions) {
            updateState({ questions: getRandomGameSet(), currentQuestionIndex: 0, isRevealed: true, streak: 0 });
        }
    }, [gameState?.questions, roomId]);

    // Auto-reveal when question changes
    useEffect(() => {
        if (gameState?.questions && gameState?.currentQuestionIndex !== undefined) {
            if (!gameState?.isRevealed) {
                updateState({ isRevealed: true });
            }
        }
    }, [gameState?.currentQuestionIndex]);

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            updateState({ currentQuestionIndex: currentIndex + 1, isRevealed: true, hasBid: false, currentBid: 50 });
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            updateState({ currentQuestionIndex: currentIndex - 1, isRevealed: true, hasBid: false, currentBid: 50 });
        }
    };

    const handleCorrect = () => {
        const bid = parseInt(currentBid, 10) || 0;
        const payout = bid * multiplier;
        const newStreak = streak + 1;
        updateState({ bankroll: bankroll + payout, streak: newStreak });
    };

    const handleIncorrect = () => {
        const bid = parseInt(currentBid, 10) || 0;
        updateState({ bankroll: bankroll - bid, streak: 0 });
    };

    const handleExplainCorrect = () => {
        const bid = parseInt(currentBid, 10) || 0;
        const payout = bid * multiplier * 2; // double for explaining
        const newStreak = streak + 1;
        updateState({ bankroll: bankroll + payout, streak: newStreak });
    };

    const handleExplainFail = () => {
        // They got the answer right but couldn't explain it — base payout only
        const bid = parseInt(currentBid, 10) || 0;
        const newStreak = streak + 1;
        updateState({ bankroll: bankroll + bid, streak: newStreak });
    };

    const handleManualAdjust = (amount) => {
        updateState({ bankroll: bankroll + amount });
    };

    const handleManualCustom = (e) => {
        e.preventDefault();
        const amt = parseInt(manualAdjustment, 10);
        if (!isNaN(amt)) {
            updateState({ bankroll: bankroll + amt });
            setManualAdjustment('');
        }
    };

    const handleBidChange = (e) => {
        updateState({ currentBid: parseInt(e.target.value, 10) || 0 });
    };

    return (
        <div className="flex w-full gap-6">
            {/* Left side: Info Panel */}
            <div className="w-1/3 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col h-[85vh] overflow-hidden">
                {/* Bankroll */}
                <div className="bg-slate-900 p-4 rounded-lg mb-4 text-center border border-slate-700">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Bidder's Bankroll</div>
                    <div className="text-4xl font-mono text-green-400">${bankroll.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-2">Goal: $1,000,000 to win</div>
                </div>

                {/* Streak */}
                <div className={`p-4 rounded-lg mb-4 text-center border ${streak >= 3 ? 'bg-amber-900/30 border-amber-500 shadow-lg shadow-amber-900/20' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="text-sm font-bold uppercase tracking-wider mb-1 text-slate-400">🔥 Streak</div>
                    <div className={`text-3xl font-mono font-bold ${streak >= 3 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                        {streak}
                    </div>
                    {streak >= 3 && (
                        <div className="text-amber-300 text-sm font-bold mt-1">3x MULTIPLIER ACTIVE!</div>
                    )}
                    {streak > 0 && streak < 3 && (
                        <div className="text-slate-500 text-sm mt-1">{3 - streak} more for 3x</div>
                    )}
                </div>

                {/* Progress */}
                <div className="bg-slate-900 p-4 rounded-lg mb-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm font-bold">Progress</span>
                        <span className="text-white font-mono text-sm">{questionNumber} / {totalQuestions}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                        ></div>
                    </div>
                    {currentQuestion && (
                        <div className="text-xs text-slate-500 mt-2 text-center">{currentQuestion.tense}</div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-2 mb-4">
                    <button onClick={handlePrev} disabled={currentIndex === 0}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors">
                        ← Prev
                    </button>
                    <button onClick={handleNext} disabled={currentIndex >= totalQuestions - 1}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors">
                        Next →
                    </button>
                </div>

                {/* Manual Adjustment */}
                <div className="mt-auto bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider">MANUAL ADJUSTMENT</h3>
                    <div className="flex gap-2">
                        <button onClick={() => handleManualAdjust(300)} className="flex-1 bg-slate-700 hover:bg-slate-600 px-2 py-2 rounded text-sm font-bold text-green-400">+$300</button>
                        <button onClick={() => handleManualAdjust(-100)} className="flex-1 bg-slate-700 hover:bg-slate-600 px-2 py-2 rounded text-sm font-bold text-red-400">-$100</button>
                    </div>
                    <form onSubmit={handleManualCustom} className="flex gap-2">
                        <input
                            type="number"
                            placeholder="±Amount"
                            value={manualAdjustment}
                            onChange={e => setManualAdjustment(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-accent-gold text-sm"
                        />
                        <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold text-sm">Apply</button>
                    </form>
                </div>
            </div>

            {/* Right side: Active Question & Controls */}
            <div className="w-2/3 flex flex-col gap-6">
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl flex-1">
                    {currentQuestion ? (
                        <div className="h-full flex flex-col">
                            {/* Header badges */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">
                                        Q{questionNumber}
                                    </span>
                                    <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                        {currentQuestion.tense}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {streak >= 3 && (
                                        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                            🔥 3x MULTI
                                        </span>
                                    )}
                                    <span className={`px-4 py-1 rounded-full font-bold text-sm ${currentQuestion.status === 'Perfect' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {currentQuestion.status}
                                    </span>
                                </div>
                            </div>

                            {/* Sentence */}
                            <h2 className="text-3xl font-bold mb-8 leading-tight">{currentQuestion.sentence}</h2>

                            {/* Teacher-only: Explanation */}
                            <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 mb-8">
                                <h4 className="text-slate-400 text-sm font-bold mb-2">EXPECTED ANSWER / EXPLANATION:</h4>
                                <p className="text-lg text-slate-200">{currentQuestion.explanation}</p>
                            </div>

                            {/* Controls */}
                            <div className="mt-auto space-y-6">
                                {/* Bid display */}
                                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
                                    <div className="flex flex-col">
                                        <label className="text-slate-300 font-bold whitespace-nowrap mb-1">Current Bid: $</label>
                                        {gameState?.hasBid && (
                                            <span className="text-green-400 text-xs font-bold animate-pulse">BIDDER LOCKED</span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        min="50"
                                        step="10"
                                        value={currentBid}
                                        onChange={handleBidChange}
                                        className={`bg-slate-800 font-mono text-xl p-2 rounded border w-32 focus:outline-none ${gameState?.hasBid ? 'text-green-400 border-green-500' : 'text-white border-slate-600 focus:border-accent-gold'}`}
                                    />
                                    {multiplier > 1 && (
                                        <span className="text-amber-400 text-lg font-bold ml-2">× {multiplier} = ${currentBid * multiplier}</span>
                                    )}
                                </div>

                                {/* Verdict Buttons — 3 columns */}
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={handleCorrect}
                                        className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-900/20"
                                    >
                                        ✅ Correct
                                        <div className="text-xs opacity-80 mt-1">+${currentBid * multiplier}</div>
                                    </button>
                                    <button
                                        onClick={handleExplainCorrect}
                                        className="bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-amber-900/20 border-2 border-amber-400/30"
                                    >
                                        🧠 Explain It!
                                        <div className="text-xs opacity-80 mt-1">+${currentBid * multiplier * 2} (2x)</div>
                                    </button>
                                    <button
                                        onClick={handleIncorrect}
                                        className="bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-red-900/20"
                                    >
                                        ❌ Incorrect
                                        <div className="text-xs opacity-80 mt-1">-${currentBid}</div>
                                    </button>
                                </div>

                                {/* Explain Fail (subtle) */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleExplainFail}
                                        className="text-slate-500 hover:text-slate-300 text-sm underline transition-colors"
                                    >
                                        Correct answer but couldn't explain → base payout only (+${currentBid})
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-xl font-medium">
                            Loading questions...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
