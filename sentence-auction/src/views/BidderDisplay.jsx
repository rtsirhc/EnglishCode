import { useEffect, useState } from 'react';

export default function BidderDisplay({ gameState, updateState }) {
    const bankroll = gameState?.bankroll ?? 1000;
    const isRevealed = gameState?.isRevealed;
    const currentQuestion = gameState.currentQuestion;
    const streak = gameState?.streak || 0;
    const multiplier = streak >= 3 ? 3 : 1;

    const [prevBankroll, setPrevBankroll] = useState(bankroll);
    const [flashClass, setFlashClass] = useState('');
    const [localBid, setLocalBid] = useState(50);

    useEffect(() => {
        if (!gameState?.hasBid) {
            setLocalBid(Math.min(50, bankroll));
        }
    }, [gameState?.hasBid, bankroll]);

    const handleSubmitBid = (e) => {
        e.preventDefault();
        updateState({ currentBid: localBid });
    };

    useEffect(() => {
        if (bankroll > prevBankroll) {
            setFlashClass('text-green-400 scale-110');
            setTimeout(() => setFlashClass('text-green-400'), 500);
        } else if (bankroll < prevBankroll) {
            setFlashClass('text-red-500 scale-90');
            setTimeout(() => setFlashClass('text-green-400'), 500);
        }
        setPrevBankroll(bankroll);
    }, [bankroll, prevBankroll]);

    return (
        <div className="auction-bidder w-full flex justify-center items-center h-[85vh]">
            <div className="max-w-4xl w-full flex flex-col gap-6">

                {/* Top Row: Bankroll + Streak */}
                <div className="flex gap-4">
                    {/* Bankroll */}
                    <div className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 flex w-full justify-center">
                            <div className="w-32 h-1 bg-accent-gold shadow-[0_0_15px_rgba(251,191,36,0.8)]"></div>
                        </div>
                        <h2 className="text-slate-400 font-bold tracking-[0.2em] mb-2 text-sm">TOTAL ASSETS</h2>
                        <div className={`text-6xl md:text-7xl font-mono font-bold transition-all duration-300 ${flashClass || 'text-green-400'}`}>
                            ${bankroll.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Goal: $1,000,000</div>
                    </div>

                    {/* Streak */}
                    <div className={`w-36 border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center ${streak >= 3 ? 'bg-amber-900/30 border-amber-500 shadow-lg shadow-amber-900/30' : 'bg-slate-800 border-slate-700'}`}>
                        <div className="text-3xl mb-1">🔥</div>
                        <div className={`text-4xl font-mono font-bold ${streak >= 3 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                            {streak}
                        </div>
                        {streak >= 3 ? (
                            <div className="text-amber-300 text-xs font-bold mt-1">3x MULTI!</div>
                        ) : (
                            <div className="text-slate-500 text-xs mt-1">Streak</div>
                        )}
                    </div>
                </div>

                {/* Sentence & Betting Display Area */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-10 md:p-12 min-h-[300px] flex flex-col items-center justify-center text-center relative shadow-black/40 shadow-2xl">
                    {isRevealed && currentQuestion ? (
                        <div className="w-full animate-[fade-in_0.3s_ease-out]">
                            {/* Tense badge */}
                            <div className="mb-6">
                                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    {currentQuestion.tense}
                                </span>
                            </div>

                            {/* Sentence */}
                            <h1 className="text-3xl md:text-5xl font-medium leading-tight text-white mb-10">{currentQuestion.sentence}</h1>

                            {/* Betting Interface */}
                            {gameState.settled ? <p role="status">Verdict recorded. Balance: ${bankroll.toLocaleString()}.</p> : !gameState?.hasBid ? (
                                <div className="border border-slate-600 bg-slate-900 p-8 rounded-xl max-w-xl mx-auto shadow-inner">
                                    <h3 className="text-accent-gold font-bold mb-4 tracking-wider">PLACE YOUR BID</h3>
                                    {multiplier > 1 && (
                                        <div className="text-amber-400 text-sm font-bold mb-3 animate-pulse">🔥 3x MULTIPLIER ACTIVE — BET BIG!</div>
                                    )}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-center gap-2 mb-2">
                                            <button onClick={() => setLocalBid(Math.min(bankroll, 50))} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-bold">$50</button>
                                            <button onClick={() => setLocalBid(Math.min(bankroll, localBid + 100))} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-bold">+ $100</button>
                                            <button onClick={() => setLocalBid(Math.min(bankroll, localBid + 250))} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-bold">+ $250</button>
                                            <button onClick={() => setLocalBid(bankroll)} className="bg-red-900/50 hover:bg-red-800 text-red-300 border border-red-700/50 px-4 py-2 rounded text-sm font-bold">ALL IN</button>
                                        </div>
                                        <form onSubmit={handleSubmitBid} className="flex gap-4 items-center">
                                            <div className="relative w-full">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    min={Math.min(50, bankroll)}
                                                    max={bankroll}
                                                    value={localBid}
                                                    onChange={e => setLocalBid(Math.max(Math.min(50, bankroll), Math.min(bankroll, parseInt(e.target.value) || 50)))}
                                                    className="w-full bg-slate-800 text-3xl text-white font-mono p-4 pl-10 rounded-lg outline-none border focus:border-accent-gold transition-colors"
                                                />
                                            </div>
                                            <button data-game-action="confirm" type="submit" disabled={bankroll === 0} className="bg-green-600 hover:bg-green-500 whitespace-nowrap text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg shadow-green-900/20">
                                                Confirm
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-green-500/30 bg-green-900/20 p-6 rounded-xl inline-block mt-4">
                                    <p className="text-green-400 font-bold tracking-widest text-sm mb-2">BID CONFIRMED</p>
                                    <div className="text-4xl font-mono text-white">${gameState.currentBid}</div>
                                    {multiplier > 1 && (
                                        <div className="text-amber-400 text-sm font-bold mt-2">🔥 Potential win: ${gameState.currentBid * multiplier}</div>
                                    )}
                                    <div className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
                                        <span className="animate-pulse h-2 w-2 bg-accent-gold rounded-full"></span>
                                        Waiting for Dealer...
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-slate-500 flex flex-col items-center">
                            <svg className="w-16 h-16 mb-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-2xl font-light tracking-wider">LOADING...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
