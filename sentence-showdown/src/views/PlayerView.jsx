import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import socket from '../lib/socket';

// Mobile countdown timer
function PlayerTimer({ startTime, seconds }) {
    const [remaining, setRemaining] = useState(seconds);

    useEffect(() => {
        const tick = () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setRemaining(Math.max(0, seconds - elapsed));
        };
        tick();
        const id = setInterval(tick, 500);
        return () => clearInterval(id);
    }, [startTime, seconds]);

    const pct = (remaining / seconds) * 100;
    const color = remaining <= 5 ? 'var(--accent-red)' : remaining <= 10 ? 'var(--gold)' : 'var(--accent-cyan)';
    const isUrgent = remaining <= 5;

    return (
        <div style={{ width: '100%', marginBottom: '16px' }}>
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 900,
                color, textAlign: 'center', marginBottom: '6px',
            }} className={isUrgent ? 'animate-pulse-scale' : ''}>
                ⏱ {remaining}s
            </div>
            <div style={{
                width: '100%', height: '6px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
            }}>
                <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: '3px',
                    background: color, transition: 'width 0.5s linear',
                }} />
            </div>
        </div>
    );
}

export default function PlayerView() {
    const [searchParams] = useSearchParams();
    const codeFromUrl = searchParams.get('code');

    const [joined, setJoined] = useState(false);
    const [roomCode, setRoomCode] = useState(codeFromUrl || '');
    const [playerName, setPlayerName] = useState('');
    const [playerKey, setPlayerKey] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState('');
    const [betAmount, setBetAmount] = useState(100);
    const [answer, setAnswer] = useState('');
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [stealSent, setStealSent] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [lastPhase, setLastPhase] = useState(null);
    const [buzzerTapped, setBuzzerTapped] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        socket.on('game_state', (state) => {
            setGameState(state);

            // Reset per-round state on phase transitions
            if (state.phase !== lastPhase) {
                if (state.phase === 'betting') {
                    setAnswerSubmitted(false);
                    setAnswer('');
                    setStealSent(false);
                    setBuzzerTapped(false);
                    setShowResult(false);
                    setBetAmount(Math.min(100, state.myBalance || 100));
                }
                if (state.phase === 'buzzer_active') {
                    setBuzzerTapped(false);
                }
                if (state.phase === 'listening_active') {
                    setAnswer('');
                    setAnswerSubmitted(false);
                }
                if (state.phase === 'speaking_active') {
                    setStealSent(false);
                }
                if (state.phase === 'round_result') {
                    setShowResult(true);
                }
                setLastPhase(state.phase);
            }
        });

        socket.on('host_disconnected', () => {
            setJoined(false);
            setGameState(null);
            setError('Host disconnected. The room has been closed.');
        });

        return () => {
            socket.off('game_state');
            socket.off('host_disconnected');
        };
    }, [lastPhase]);

    const joinRoom = useCallback(() => {
        if (!roomCode.trim() || !playerName.trim()) {
            setError('Please enter both a room code and your name');
            return;
        }
        setError('');
        socket.emit('join_room', { roomCode: roomCode.trim(), playerName: playerName.trim() }, (res) => {
            if (res.success) {
                setJoined(true);
                setPlayerKey(res.playerKey);
            } else {
                setError(res.error || 'Could not join');
            }
        });
    }, [roomCode, playerName]);

    const placeBet = () => {
        const gs = gameState;
        const maxBet = gs?.myBalance || 1000;
        const finalBet = Math.min(Math.max(1, betAmount), maxBet);
        socket.emit('place_bet', { roomCode, playerKey, amount: finalBet });
    };

    const tapBuzzer = () => {
        if (buzzerTapped) return;
        setBuzzerTapped(true);
        socket.emit('buzzer_tap', { roomCode, playerKey });
    };

    const submitAnswer = () => {
        if (!answer.trim() || answerSubmitted) return;
        setAnswerSubmitted(true);
        socket.emit('submit_answer', { roomCode, playerKey, answer: answer.trim() }, (res) => {
            if (!res?.isCorrect) {
                // Wrong — server handles the turn switch
                setAnswerSubmitted(false);
                setAnswer('');
            }
        });
    };

    const requestSteal = () => {
        if (stealSent) return;
        setStealSent(true);
        socket.emit('request_steal', { roomCode, playerKey });
    };

    const gs = gameState;
    const formatMoney = (n) => `$${(n || 0).toLocaleString()}`;

    // ─── JOIN SCREEN ───
    if (!joined) {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} className="animate-slide-up">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🎮</span>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '1.8rem', marginBottom: '4px',
                        color: 'var(--gold)',
                    }}>
                        Join Game
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>
                        Enter the code from your teacher's screen
                    </p>

                    {error && (
                        <div style={{
                            padding: '12px', marginBottom: '16px', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: 'var(--accent-red)', fontSize: '0.85rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <input
                        className="input-field"
                        type="text"
                        placeholder="Room Code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        maxLength={4}
                        style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '8px', marginBottom: '12px' }}
                    />

                    <input
                        className="input-field"
                        type="text"
                        placeholder="Your Name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={20}
                        style={{ marginBottom: '20px' }}
                    />

                    <button className="btn btn-gold btn-lg btn-block" onClick={joinRoom}>
                        Join
                    </button>
                </div>
            </div>
        );
    }

    const phase = gs?.phase || 'lobby';
    const myBalance = gs?.myBalance ?? 1000;
    const opponentName = gs?.opponentName || 'Opponent';

    // ─── WAITING / LOBBY ───
    if (phase === 'lobby' || phase === 'select_question') {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ textAlign: 'center' }} className="animate-slide-up">
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>⏳</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                        {phase === 'lobby' ? 'Waiting for Players...' : 'Waiting for Host...'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        {phase === 'lobby' ? 'The host will start the game soon' : 'The host is selecting a question'}
                    </p>
                    <div className="balance-chip large">💰 {formatMoney(myBalance)}</div>
                </div>
            </div>
        );
    }

    // ─── BETTING ───
    if (phase === 'betting') {
        const maxBet = myBalance;
        const betLocked = gs?.myBetLocked;

        if (betLocked) {
            return (
                <div style={mobileStyles.fullPage}>
                    <div style={{ textAlign: 'center' }} className="animate-slide-up">
                        <div className={`phase-badge ${gs.questionType}`} style={{ marginBottom: '16px' }}>
                            {gs.questionType === 'listening' ? '🎧 Listening' : '🗣️ Speaking'}
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                            Bet Locked!
                        </h2>
                        <div className="balance-chip large" style={{ marginBottom: '12px' }}>
                            🎰 {formatMoney(gs.myBet)}
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            {gs.opponentBetLocked ? 'Both bets are in!' : `Waiting for ${opponentName}...`}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} className="animate-slide-up">
                    <div className={`phase-badge ${gs.questionType}`} style={{ marginBottom: '16px' }}>
                        {gs.questionType === 'listening' ? '🎧 Listening Round' : '🗣️ Speaking Round'}
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: '4px' }}>
                        Place Your Bet
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem' }}>
                        Balance: {formatMoney(myBalance)}
                    </p>

                    <div className="glass" style={{ padding: '24px', marginBottom: '20px' }}>
                        <p style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '2.5rem',
                            color: 'var(--gold)', marginBottom: '16px',
                        }}>
                            {formatMoney(betAmount)}
                        </p>
                        <input
                            type="range"
                            className="bet-slider"
                            min={1}
                            max={maxBet}
                            value={betAmount}
                            onChange={(e) => setBetAmount(parseInt(e.target.value))}
                            style={{ marginBottom: '12px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            <span>$1</span>
                            <span>{formatMoney(maxBet)}</span>
                        </div>

                        {/* Quick bet buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            {[0.1, 0.25, 0.5, 1].map(frac => (
                                <button
                                    key={frac}
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem' }}
                                    onClick={() => setBetAmount(Math.max(1, Math.floor(maxBet * frac)))}
                                >
                                    {frac === 1 ? 'ALL IN' : `${frac * 100}%`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-gold btn-lg btn-block" onClick={placeBet}>
                        🔒 Lock Bet
                    </button>
                </div>
            </div>
        );
    }

    // ─── BUZZER ───
    if (phase === 'buzzer_ready') {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ textAlign: 'center' }} className="animate-fade-in">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                        Get Ready...
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Wait for the buzzer!</p>
                </div>
            </div>
        );
    }

    if (phase === 'buzzer_active') {
        return (
            <div style={{
                ...mobileStyles.fullPage,
                background: buzzerTapped
                    ? 'radial-gradient(ellipse at center, #1a3a1a 0%, #0a0e1a 60%)'
                    : 'radial-gradient(ellipse at center, #3a1a1a 0%, #0a0e1a 60%)',
            }}>
                {buzzerTapped ? (
                    <div style={{ textAlign: 'center' }} className="animate-fade-in">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>⚡</span>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>BUZZED!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Waiting for result...</p>
                    </div>
                ) : (
                    <button className="buzzer-btn" onClick={tapBuzzer}>
                        BUZZ!
                    </button>
                )}
            </div>
        );
    }

    // ─── LISTENING: ACTIVE PLAYER ───
    if (phase === 'listening_active' && gs?.isActivePlayer) {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} className="animate-slide-up">
                    <div className="phase-badge listening" style={{ marginBottom: '16px' }}>🎧 Your Turn!</div>

                    {gs.listeningTimerStart && (
                        <PlayerTimer startTime={gs.listeningTimerStart} seconds={gs.listeningTimerSeconds} />
                    )}

                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px' }}>
                        Listen & Type
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem' }}>
                        Type exactly what the teacher says
                    </p>

                    <div className="glass" style={{ padding: '20px', marginBottom: '16px' }}>
                        <input
                            ref={inputRef}
                            className="input-field"
                            type="text"
                            placeholder="Type what you hear..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            style={{ fontSize: '1.1rem', marginBottom: '12px' }}
                        />
                        <button
                            className="btn btn-green btn-block"
                            onClick={submitAnswer}
                            disabled={!answer.trim() || answerSubmitted}
                        >
                            {answerSubmitted ? '⏳ Checking...' : '✅ Submit Answer'}
                        </button>
                    </div>

                    <div className="balance-chip">💰 {formatMoney(myBalance)} · Bet: {formatMoney(gs.myBet)}</div>
                </div>
            </div>
        );
    }

    // ─── LISTENING: INACTIVE PLAYER ───
    if (phase === 'listening_active' && !gs?.isActivePlayer) {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ textAlign: 'center' }} className="animate-fade-in">
                    <div className="phase-badge listening" style={{ marginBottom: '16px' }}>🎧 Listening Round</div>

                    {gs.listeningTimerStart && (
                        <PlayerTimer startTime={gs.listeningTimerStart} seconds={gs.listeningTimerSeconds} />
                    )}

                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                        {opponentName}'s Turn
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Wait for your opponent to answer...
                    </p>
                    <div className="balance-chip large">💰 {formatMoney(myBalance)}</div>
                </div>
            </div>
        );
    }

    // ─── SPEAKING: ACTIVE PLAYER ───
    if (phase === 'speaking_active' && gs?.isActivePlayer) {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} className="animate-slide-up">
                    <div className="phase-badge speaking" style={{ marginBottom: '16px' }}>🗣️ Your Turn!</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px' }}>
                        Read This Aloud
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem' }}>
                        Speak clearly and correctly!
                    </p>

                    <div className="glass gold-glow" style={{
                        padding: '28px', marginBottom: '20px',
                        border: '2px solid rgba(245, 158, 11, 0.3)',
                    }}>
                        <p style={{
                            fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.6,
                            color: 'var(--text-primary)',
                        }}>
                            "{gs.currentQuestion?.sentence}"
                        </p>
                    </div>

                    <div className="balance-chip">💰 {formatMoney(myBalance)} · Bet: {formatMoney(gs.myBet)}</div>

                    {gs.stealRequest?.pending && gs.stealRequest?.from !== playerKey && (
                        <div style={{
                            marginTop: '16px', padding: '12px', borderRadius: '12px',
                            background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)',
                            color: '#ff6b00', fontSize: '0.85rem',
                        }}>
                            ⚠️ {opponentName} hit STEAL! Waiting for host...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── SPEAKING: INACTIVE PLAYER (STEAL BUTTON) ───
    if (phase === 'speaking_active' && !gs?.isActivePlayer) {
        return (
            <div style={mobileStyles.fullPage}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} className="animate-slide-up">
                    <div className="phase-badge speaking" style={{ marginBottom: '16px' }}>🗣️ Speaking Round</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px' }}>
                        {opponentName} is Speaking
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.85rem' }}>
                        Listen carefully for mistakes!
                    </p>

                    {stealSent ? (
                        <div className="glass" style={{
                            padding: '24px',
                            background: 'rgba(255,107,0,0.1)',
                            border: '2px solid rgba(255,107,0,0.3)',
                        }}>
                            <p style={{ color: '#ff6b00', fontWeight: 700, fontSize: '1.1rem' }}>
                                🏴‍☠️ STEAL Sent!
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                                Waiting for host decision...
                            </p>
                        </div>
                    ) : (
                        <button className="steal-btn" onClick={requestSteal}>
                            🏴‍☠️ STEAL!
                        </button>
                    )}

                    <div className="balance-chip" style={{ marginTop: '20px' }}>💰 {formatMoney(myBalance)}</div>
                </div>
            </div>
        );
    }

    // ─── ROUND RESULT ───
    if (phase === 'round_result') {
        const r = gs?.lastResult;
        const isSkipped = r?.skipped;

        if (isSkipped) {
            return (
                <div style={mobileStyles.fullPage}>
                    <div style={{ textAlign: 'center' }} className="animate-slide-up">
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>⏭️</span>
                        <h2 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem',
                            color: 'var(--text-secondary)', marginBottom: '8px',
                        }}>
                            Question Skipped
                        </h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '16px' }}>No money was transferred.</p>
                        <div className="balance-chip large">💰 {formatMoney(myBalance)}</div>
                        <p style={{ color: 'var(--text-dim)', marginTop: '16px', fontSize: '0.85rem' }}>
                            Waiting for next round...
                        </p>
                    </div>
                </div>
            );
        }

        const iWon = r?.winner === playerKey;
        return (
            <div style={{
                ...mobileStyles.fullPage,
                background: iWon
                    ? 'radial-gradient(ellipse at center, #1a3a1a 0%, #0a0e1a 60%)'
                    : 'radial-gradient(ellipse at center, #3a1a1a 0%, #0a0e1a 60%)',
            }}>
                <div style={{ textAlign: 'center' }} className="animate-slide-up">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>
                        {iWon ? '🎉' : '😔'}
                    </span>
                    <h2 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem',
                        color: iWon ? 'var(--accent-green)' : 'var(--accent-red)',
                        marginBottom: '8px',
                    }}>
                        {iWon ? 'You Win This Round!' : 'You Lost This Round'}
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '2rem',
                        color: iWon ? 'var(--accent-green)' : 'var(--accent-red)',
                        marginBottom: '16px',
                    }}>
                        {iWon ? '+' : '-'}{formatMoney(r?.amount || 0)}
                    </p>
                    <div className="balance-chip large">💰 {formatMoney(myBalance)}</div>
                    <p style={{ color: 'var(--text-dim)', marginTop: '16px', fontSize: '0.85rem' }}>
                        Waiting for next round...
                    </p>
                </div>
            </div>
        );
    }

    // ─── GAME OVER ───
    if (phase === 'game_over') {
        const iWon = gs?.winner === playerKey;
        return (
            <div style={{
                ...mobileStyles.fullPage,
                background: iWon
                    ? 'radial-gradient(ellipse at center, #2a1a00 0%, #0a0e1a 60%)'
                    : 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0e1a 60%)',
            }}>
                <div style={{ textAlign: 'center' }} className="animate-slide-up">
                    <span style={{ fontSize: '4rem', display: 'block', marginBottom: '12px' }}>
                        {iWon ? '👑' : '💀'}
                    </span>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: '2rem',
                        color: iWon ? 'var(--gold)' : 'var(--accent-red)',
                        marginBottom: '8px',
                    }} className={iWon ? 'animate-winner-glow' : ''}>
                        {iWon ? 'YOU WIN!' : 'GAME OVER'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        {iWon ? 'Congratulations! You dominated the showdown!' : 'Better luck next time!'}
                    </p>
                    <div className="balance-chip large">
                        💰 Final: {formatMoney(myBalance)}
                    </div>
                </div>
            </div>
        );
    }

    // ─── FALLBACK ───
    return (
        <div style={mobileStyles.fullPage}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)' }}>⏳ Syncing...</p>
            </div>
        </div>
    );
}

const mobileStyles = {
    fullPage: {
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0e1a 60%)',
        padding: '24px',
    },
};
