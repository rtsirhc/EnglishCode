import { useState, useEffect, useCallback } from 'react';
import socket from '../lib/socket';

// Countdown timer synced to server start time
function TimerDisplay({ startTime, seconds }) {
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

    const color = remaining <= 5 ? 'var(--accent-red)' : remaining <= 10 ? 'var(--gold)' : 'var(--accent-cyan)';
    const isUrgent = remaining <= 5;

    return (
        <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            fontWeight: 900,
            color,
            marginBottom: '12px',
            letterSpacing: '2px',
        }} className={isUrgent ? 'animate-pulse-scale' : ''}>
            ⏱ {remaining}s
        </div>
    );
}

export default function HostView() {
    const [roomCode, setRoomCode] = useState(null);
    const [mode, setMode] = useState('local');
    const [custom, setCustom] = useState(Boolean(socket.pack));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        socket.on('game_state', (state) => {
            setGameState(state);
        });
        return () => { socket.off('game_state'); socket.close(); };
    }, []);

    const createRoom = useCallback(() => {
        setBusy(true);
        setError('');
        socket.emit('create_room', { mode, custom }, (res) => {
            setBusy(false);
            if (res.success) setRoomCode(res.roomCode);
            else setError(res.error);
        });
    }, [mode, custom]);

    const startGame = () => {
        socket.emit('start_game', { roomCode }, (res) => {
            if (!res.success) alert(res.error || 'Cannot start');
        });
    };

    const selectType = (type) => {
        socket.emit('select_question_type', { roomCode, type });
    };

    const releaseBuzzer = () => {
        socket.emit('release_buzzer', { roomCode });
    };

    const hostOverride = () => {
        socket.emit('host_override', { roomCode });
    };

    const approveSt = () => {
        socket.emit('approve_steal', { roomCode });
    };

    const denySt = () => {
        socket.emit('deny_steal', { roomCode });
    };

    const markCorrectSpeaking = () => {
        socket.emit('mark_correct_speaking', { roomCode });
    };

    const nextRound = () => {
        socket.emit('next_round', { roomCode });
    };

    const newGame = () => {
        socket.emit('new_game', { roomCode });
    };

    const skipQuestion = () => {
        socket.emit('skip_question', { roomCode });
    };

    const skipTimer = () => {
        socket.emit('skip_timer', { roomCode });
    };

    const markAllCorrect = () => {
        socket.emit('mark_all_correct', { roomCode });
    };

    // ─── PRE-ROOM ───
    if (!roomCode) {
        return (
            <div style={styles.fullCenter}>
                <div style={{ textAlign: 'center' }} className="animate-slide-up">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🎓</span>
                    <h1 style={styles.title}>Teacher Control Panel</h1>
                    <p style={styles.sub}>Create a room for your students to join</p>
                    <label style={{ display: 'block', marginTop: '16px' }}>Connection
                        <select className="input-field" value={mode} disabled={busy} onChange={e => setMode(e.target.value)}>
                            <option value="local">Same browser · three tabs</option>
                            <option value="online">Separate devices · internet</option>
                        </select>
                    </label>
                    {socket.pack && <label style={{ display: 'block', marginTop: '12px' }}>
                        <input type="checkbox" checked={custom} disabled={busy} onChange={e => setCustom(e.target.checked)} /> Play {socket.pack.title}
                    </label>}
                    {error && <p role="alert">{error}</p>}
                    <button disabled={busy} className="btn btn-gold btn-lg" onClick={createRoom} style={{ marginTop: '24px' }}>
                        Create Room
                    </button>
                </div>
            </div>
        );
    }

    const gs = gameState;
    const p1 = gs?.players?.p1;
    const p2 = gs?.players?.p2;
    const phase = gs?.phase || 'lobby';

    // ─── LOBBY ───
    if (phase === 'lobby') {
        const joinUrl = new URL(location.pathname, location.origin);
        joinUrl.hash = '/play?' + new URLSearchParams({ code: roomCode, mode });
        return (
            <div style={styles.fullCenter}>
                <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }} className="animate-slide-up">
                    <h2 style={styles.sectionTitle}>Room Created!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Share this code with your students
                    </p>

                    <div className="glass" style={{ padding: '32px', marginBottom: '24px' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                            Room Code
                        </p>
                        <div className="room-code">{roomCode}</div>
                    </div>

                    <div className="glass" style={{ padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            Player link
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
                            <a href={joinUrl.href} target="_blank" rel="noopener">{joinUrl.href}</a>
                        </p>
                    </div>

                    {/* Player status */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        <div className="glass" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Player 1</p>
                            {p1 ? (
                                <p style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.1rem' }}>✓ {p1.name}</p>
                            ) : (
                                <p style={{ color: 'var(--text-dim)' }}>Waiting...</p>
                            )}
                        </div>
                        <div className="glass" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Player 2</p>
                            {p2 ? (
                                <p style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.1rem' }}>✓ {p2.name}</p>
                            ) : (
                                <p style={{ color: 'var(--text-dim)' }}>Waiting...</p>
                            )}
                        </div>
                    </div>

                    {p1 && p2 && (
                        <button className="btn btn-gold btn-lg btn-block animate-slide-up" onClick={startGame}>
                            ⚡ Start Game
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ─── GAME PHASES ───
    const playerName = (key) => gs.players[key]?.name || key;
    const playerBalance = (key) => gs.players[key]?.balance ?? 0;
    const formatMoney = (n) => `$${n.toLocaleString()}`;

    // Dashboard header
    const Dashboard = () => (
        <div style={styles.dashboard}>
            <div style={styles.dashRow}>
                {/* P1 */}
                <div className="glass" style={styles.playerCard}>
                    <p style={styles.playerLabel}>Player 1</p>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{playerName('p1')}</p>
                    <div className="balance-chip">💰 {formatMoney(playerBalance('p1'))}</div>
                    {gs.activePlayer === 'p1' && <span style={styles.activeDot}>⚡ ACTIVE</span>}
                </div>
                {/* VS */}
                <div style={{ textAlign: 'center', padding: '8px' }}>
                    <span style={{ fontSize: '1.5rem', color: 'var(--text-dim)' }}>VS</span>
                </div>
                {/* P2 */}
                <div className="glass" style={styles.playerCard}>
                    <p style={styles.playerLabel}>Player 2</p>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{playerName('p2')}</p>
                    <div className="balance-chip">💰 {formatMoney(playerBalance('p2'))}</div>
                    {gs.activePlayer === 'p2' && <span style={styles.activeDot}>⚡ ACTIVE</span>}
                </div>
            </div>
        </div>
    );

    // ─── SELECT QUESTION ───
    if (phase === 'select_question') {
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter} className="animate-slide-up">
                    <h2 style={styles.sectionTitle}>Select Question Type</h2>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="btn btn-cyan btn-lg" onClick={() => selectType('listening')} style={{ minWidth: '200px' }}>
                            🎧 Listening
                        </button>
                        <button className="btn btn-purple btn-lg" onClick={() => selectType('speaking')} style={{ minWidth: '200px' }}>
                            🗣️ Speaking
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── BETTING ───
    if (phase === 'betting') {
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter} className="animate-slide-up">
                    <div className={`phase-badge ${gs.questionType}`} style={{ marginBottom: '16px' }}>
                        {gs.questionType === 'listening' ? '🎧 Listening' : '🗣️ Speaking'}
                    </div>
                    <h2 style={styles.sectionTitle}>Players Are Betting...</h2>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                        <div className="glass" style={{ padding: '24px', flex: 1, textAlign: 'center' }}>
                            <p style={{ fontWeight: 600 }}>{playerName('p1')}</p>
                            {gs.bets.p1 !== null ? (
                                <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, marginTop: '8px' }}>
                                    {formatMoney(gs.bets.p1)} ✓
                                </p>
                            ) : (
                                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Thinking...</p>
                            )}
                        </div>
                        <div className="glass" style={{ padding: '24px', flex: 1, textAlign: 'center' }}>
                            <p style={{ fontWeight: 600 }}>{playerName('p2')}</p>
                            {gs.bets.p2 !== null ? (
                                <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, marginTop: '8px' }}>
                                    {formatMoney(gs.bets.p2)} ✓
                                </p>
                            ) : (
                                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Thinking...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── BUZZER READY ───
    if (phase === 'buzzer_ready') {
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter} className="animate-slide-up">
                    <h2 style={styles.sectionTitle}>All Bets Locked!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        {playerName('p1')} bet {formatMoney(gs.bets.p1)} · {playerName('p2')} bet {formatMoney(gs.bets.p2)}
                    </p>
                    <button
                        className="btn btn-red btn-lg animate-pulse-glow"
                        id="showdown-confirm" onClick={releaseBuzzer}
                        style={{ fontSize: '1.3rem', padding: '20px 48px' }}
                    >
                        🔴 RELEASE BUZZER
                    </button>
                </div>
            </div>
        );
    }

    // ─── BUZZER ACTIVE ───
    if (phase === 'buzzer_active') {
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter}>
                    <h2 style={{ ...styles.sectionTitle, color: 'var(--accent-red)' }} className="animate-pulse-scale">
                        🔴 BUZZER IS LIVE!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Waiting for a player to buzz in...</p>
                </div>
            </div>
        );
    }

    // ─── LISTENING ACTIVE ───
    if (phase === 'listening_active') {
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter} className="animate-slide-up">
                    <div className="phase-badge listening" style={{ marginBottom: '16px' }}>🎧 Listening Round</div>
                    <h2 style={styles.sectionTitle}>
                        {playerName(gs.activePlayer)} is typing...
                    </h2>

                    {/* Timer indicator */}
                    {gs.listeningTimerStart && (
                        <TimerDisplay startTime={gs.listeningTimerStart} seconds={gs.listeningTimerSeconds} />
                    )}

                    <div className="glass" style={{ padding: '24px', marginTop: '16px', marginBottom: '16px', textAlign: 'left', width: '100%', maxWidth: '600px' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            Correct Answer (Only You Can See)
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--accent-green)', lineHeight: 1.6 }}>
                            {gs.currentQuestion?.sentence}
                        </p>
                    </div>

                    {gs.submittedAnswer && (
                        <div className="glass" style={{ padding: '20px', marginBottom: '16px', textAlign: 'left', width: '100%', maxWidth: '600px' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                Submitted Answer
                            </p>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--accent-red)' }}>
                                {gs.submittedAnswer}
                            </p>
                        </div>
                    )}

                    {gs.lastResult?.turnSwitch && (
                        <div className="glass" style={{ padding: '16px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', width: '100%', maxWidth: '600px' }}>
                            <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                                {gs.lastResult.timedOut ? '⏰' : '❌'} {playerName(gs.lastResult.loser)} {gs.lastResult.timedOut ? 'ran out of time!' : 'got it wrong!'} Turn shifts to {playerName(gs.activePlayer)}.
                                ({formatMoney(gs.lastResult.amount)} transferred)
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="btn btn-green btn-lg" onClick={hostOverride}>
                            ✅ Override: Mark Correct
                        </button>
                        <button className="btn btn-gold btn-lg" onClick={markAllCorrect}>
                            🎉 Mark ALL Correct
                        </button>
                        <button className="btn btn-red btn-lg" onClick={skipTimer}>
                            ⏱️ Skip Timer
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={skipQuestion}>
                            ⏭️ Skip Question
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SPEAKING ACTIVE ───
    if (phase === 'speaking_active') {
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter} className="animate-slide-up">
                    <div className="phase-badge speaking" style={{ marginBottom: '16px' }}>🗣️ Speaking Round</div>
                    <h2 style={styles.sectionTitle}>
                        {playerName(gs.activePlayer)} is reading aloud
                    </h2>

                    <div className="glass" style={{ padding: '24px', margin: '16px 0', width: '100%', maxWidth: '600px' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                            Sentence
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            "{gs.currentQuestion?.sentence}"
                        </p>
                    </div>

                    {/* Steal alert */}
                    {gs.stealRequest?.pending && (
                        <div className="glass animate-slide-up" style={{
                            padding: '20px', marginBottom: '20px', width: '100%', maxWidth: '600px',
                            background: 'rgba(255, 107, 0, 0.1)', border: '2px solid rgba(255, 107, 0, 0.4)'
                        }}>
                            <p style={{ color: '#ff6b00', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>
                                🏴‍☠️ STEAL REQUEST from {playerName(gs.stealRequest.from)}!
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-green" onClick={approveSt} style={{ flex: 1 }}>
                                    ✅ Approve Steal
                                </button>
                                <button className="btn btn-red" onClick={denySt} style={{ flex: 1 }}>
                                    ❌ Deny Steal
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="btn btn-green btn-lg" onClick={markCorrectSpeaking}>
                            ✅ Mark Correct ({playerName(gs.activePlayer)})
                        </button>
                        <button className="btn btn-gold btn-lg" onClick={markAllCorrect}>
                            🎉 Mark ALL Correct
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={skipQuestion}>
                            ⏭️ Skip Question
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── ROUND RESULT ───
    if (phase === 'round_result') {
        const r = gs.lastResult;
        const isSkipped = r?.skipped;
        return (
            <div style={styles.page}>
                <Dashboard />
                <div style={styles.contentCenter} className="animate-slide-up">
                    <h2 style={{ ...styles.sectionTitle, color: isSkipped ? 'var(--text-secondary)' : 'var(--accent-green)' }}>
                        {isSkipped ? 'Question Skipped' : 'Round Complete!'}
                    </h2>

                    {r?.allCorrect && <p style={{ marginBottom: 24 }}>Both players earned their wagers.</p>}
                    {!isSkipped && !r?.allCorrect && (
                        <div className="glass" style={{ padding: '28px', marginBottom: '24px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{playerName(r?.winner)}</span> wins{' '}
                                <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                    {formatMoney(r?.amount || 0)}
                                </span>
                            </p>

                            {r?.override && (
                                <p style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', marginTop: '8px' }}>
                                    (Host Override)
                                </p>
                            )}
                        </div>
                    )}

                    {isSkipped && (
                        <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>No money was transferred.</p>
                    )}

                    <button className="btn btn-gold btn-lg" id="showdown-next" onClick={nextRound}>
                        Next Round →
                    </button>
                </div>
            </div>
        );
    }

    // ─── GAME OVER ───
    if (phase === 'game_over') {
        return (
            <div style={{
                ...styles.fullCenter,
                background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0e1a 60%)',
            }}>
                <div style={{ textAlign: 'center' }} className="animate-slide-up">
                    <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>👑</span>
                    <h1 style={{ ...styles.title, fontSize: 'clamp(2rem, 5vw, 3rem)' }} className="animate-winner-glow">
                        {playerName(gs.winner)} WINS!
                    </h1>
                    <div className="glass" style={{ padding: '24px', margin: '24px auto', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                            <div>
                                <p style={styles.playerLabel}>{playerName('p1')}</p>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: gs.winner === 'p1' ? 'var(--gold)' : 'var(--text-dim)', fontWeight: 700 }}>
                                    {formatMoney(playerBalance('p1'))}
                                </p>
                            </div>
                            <div>
                                <p style={styles.playerLabel}>{playerName('p2')}</p>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: gs.winner === 'p2' ? 'var(--gold)' : 'var(--text-dim)', fontWeight: 700 }}>
                                    {formatMoney(playerBalance('p2'))}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-gold btn-lg" id="showdown-next" onClick={newGame} style={{ marginTop: '16px' }}>
                        🔄 New Game
                    </button>
                </div>
            </div>
        );
    }

    // ─── FALLBACK ───
    return (
        <div style={styles.fullCenter}>
            <p style={{ color: 'var(--text-dim)' }}>Phase: {phase}</p>
        </div>
    );
}

// ─── Inline Styles ───
const styles = {
    fullCenter: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0e1a 60%)',
        padding: '24px',
    },
    page: {
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0e1a 60%)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    dashboard: {
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto 16px',
    },
    dashRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    playerCard: {
        flex: 1,
        padding: '16px',
        textAlign: 'center',
        maxWidth: '280px',
    },
    playerLabel: {
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '4px',
    },
    activeDot: {
        display: 'inline-block',
        marginTop: '6px',
        padding: '3px 10px',
        background: 'rgba(245, 158, 11, 0.2)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '100px',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: 'var(--gold)',
        letterSpacing: '1px',
    },
    contentCenter: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '16px',
    },
    title: {
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
    },
    sectionTitle: {
        fontFamily: 'var(--font-display)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    sub: {
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        marginBottom: '16px',
    },
};
