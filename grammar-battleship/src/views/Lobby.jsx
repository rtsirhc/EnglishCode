import { read } from '../../../gallery/shared/storage.js';
import { validatePack } from '../../../gallery/shared/content.js';
import { useState } from 'react';
import { socket } from '../lib/socket';
import './Lobby.css';

let teacherPack;
try { teacherPack = validatePack(read('pack:grammar-battleship', null), 'axes'); } catch {}
export default function Lobby({ setRoomId, setGameState, gameState, roomId }) {
    const [view, setView] = useState('menu'); // menu, create, join
    const [joinCode, setJoinCode] = useState('');
    const [playerName, setPlayerName] = useState('');

    const [subjects, setSubjects] = useState(teacherPack?.items.map(item => item.subject).join('\n') || 'The dog\nThe students\nMy teacher\nA mysterious man\nThe old car\nThe broken robot\nOur loud neighbor\nThe sleeping cat\nThe brave knight\nA hungry bear');
    const [participles, setParticiples] = useState(teacherPack?.items.map(item => item.participle).join('\n') || 'eaten\nbroken\nforgotten\nseen\nheard\ndiscovered\nstolen\nhidden\nfixed\nfound');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateGame = () => {
        setLoading(true);
        setError('');

        const vocabLists = {
            subjects: [...new Set(subjects.split('\n').map(item => item.trim()).filter(Boolean))],
            pastParticiples: [...new Set(participles.split('\n').map(item => item.trim()).filter(Boolean))]
        };

        if (vocabLists.subjects.length < 10 || vocabLists.pastParticiples.length < 10) {
            setError('Please provide at least 10 different non-empty items for each list to ensure enough words for a 10x10 board.');
            setLoading(false);
            return;
        }

        socket.emit('create_room', { vocabLists }, (response) => {
            setLoading(false);
            if (response.success) {
                setRoomId(response.roomId);
                setGameState(response.state);
            } else {
                setError(response.message || 'Failed to create room');
            }
        });
    };

    const handleJoinGame = () => {
        if (!joinCode || !playerName) {
            setError('Please enter a room code and your name.');
            return;
        }

        setLoading(true);
        setError('');

        socket.emit('join_room', { roomId: joinCode.toUpperCase(), playerName }, (response) => {
            setLoading(false);
            if (response.success) {
                setRoomId(joinCode.toUpperCase());
                setGameState(response.state);
            } else {
                setError(response.message || 'Failed to join room');
            }
        });
    };

    if (roomId && gameState && gameState.status === 'lobby') {
        return (
            <div className="container animate-fade-in">
                <div className="lobby-wrapper glass-panel">
                    <h2>Game Created!</h2>
                    <p className="subtitle">Invite your student using this Room Code:</p>
                    <div style={{ margin: '2rem 0', padding: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Room Code</span>
                        <h1 style={{ fontSize: '4.5rem', letterSpacing: '0.5rem', color: 'var(--accent-primary)', margin: '1rem 0' }}>
                            {roomId}
                        </h1>
                    </div>
                    <div className="loader" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Waiting for student to join...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in">
            <div className="lobby-wrapper glass-panel">
                {view === 'menu' && (
                    <div className="lobby-menu">
                        <h2>Welcome to Grammar Battleship</h2>
                        <p className="subtitle">Practice grammar combinations and blow up some ships!</p>
                        <div className="lobby-actions">
                            <button className="btn" onClick={() => setView('create')}>
                                Create New Game (Teacher)
                            </button>
                            <button className="btn secondary" onClick={() => setView('join')}>
                                Join Existing Game (Student)
                            </button>
                        </div>
                    </div>
                )}

                {view === 'create' && (
                    <div className="lobby-create animate-fade-in">
                        <h2>Teacher Dashboard - Create Game</h2>
                        <p className="subtitle">Enter vocabulary to populate the X and Y axes of the Battlefield (10x10 grid).</p>

                        {error && <div role="alert" className="error-box">{error}</div>}

                        <div className="vocab-grids">
                            <div className="input-group">
                                <label htmlFor="board-subjects">Y-Axis (Nouns/Subjects): One per line</label>
                                <textarea
                                    id="board-subjects" value={subjects}
                                    onChange={(e) => setSubjects(e.target.value)}
                                    placeholder="The boy&#10;The dog&#10;My friends..."
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="board-participles">X-Axis (Verbs/Past Participles): One per line</label>
                                <textarea
                                    id="board-participles" value={participles}
                                    onChange={(e) => setParticiples(e.target.value)}
                                    placeholder="broken&#10;stolen&#10;seen..."
                                />
                            </div>
                        </div>

                        <div className="action-row">
                            <button className="btn secondary" onClick={() => setView('menu')}>Back</button>
                            <button className="btn success" onClick={handleCreateGame} disabled={loading}>
                                {loading ? 'Creating...' : 'Start Game'}
                            </button>
                        </div>
                    </div>
                )}

                {view === 'join' && (
                    <div className="lobby-join animate-fade-in">
                        <h2>Join a Game</h2>

                        {error && <div role="alert" className="error-box">{error}</div>}

                        <div className="input-group" style={{ maxWidth: '400px', margin: '0 auto 1rem auto' }}>
                            <label htmlFor="join-code">Room Code</label>
                            <input
                                type="text"
                                id="join-code" maxLength="8"
                                placeholder="Eight-character code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                style={{ textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.25rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                            <label htmlFor="player-name">Your Name</label>
                            <input
                                type="text"
                                id="player-name" maxLength="60" placeholder="Player 2"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                            />
                        </div>

                        <div className="action-row" style={{ justifyContent: 'center' }}>
                            <button className="btn secondary" onClick={() => setView('menu')}>Back</button>
                            <button className="btn success" onClick={handleJoinGame} disabled={loading}>
                                {loading ? 'Joining...' : 'Enter Game'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
