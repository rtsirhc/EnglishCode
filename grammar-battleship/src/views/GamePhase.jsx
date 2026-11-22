import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';
import Board from '../components/Board';
import ValidationModal from '../components/ValidationModal';
import './GamePhase.css';

export default function GamePhase({ gameState, roomId }) {
    const [error, setError] = useState('');
    const myId = socket.id;

    const me = gameState.players[myId];
    const opponents = Object.values(gameState.players).filter(p => p.id !== myId);
    const opponent = opponents[0];

    const isMyTurn = gameState.currentTurn === myId;
    const isFinished = gameState.status === 'finished';

    // Derive tracking board (Opponent's board from my perspective, hitting it)
    // Opponent boardStatus: 0 = unknown, 2 = hit, 3 = miss
    const trackingGrid = opponent ? opponent.boardStatus : [];

    // My board (Shows my ships, hits, and misses)
    const myGrid = me ? me.boardStatus : [];

    const handleAttack = (x, y) => {
        if (!isMyTurn || isFinished || gameState.pendingValidation) return;

        // Don't re-attack known hits/misses
        if (trackingGrid[y][x] === 2 || trackingGrid[y][x] === 3) return;

        socket.emit('attack_target', { roomId, x, y }, (response) => {
            if (!response.success) {
                setError(response.message);
            }
        });
    };

    const handleValidate = (isCorrect) => {
        socket.emit('validate_attack', { roomId, correct: isCorrect }, (response) => {
            if (!response.success) {
                setError(response.message);
            }
        });
    };

    if (!me || !opponent) return <div>Loading Match...</div>;

    return (
        <div className="container animate-fade-in game-phase-container">
            {isFinished && (
                <div className="winner-banner animate-fade-in glass-panel">
                    <h1>{gameState.winner === myId ? '🎉 You Won! 🎉' : `💀 You Lost to ${opponent.name}`}</h1>
                    <p>Game Over!</p>
                </div>
            )}

            {!isFinished && (
                <div className="turn-banner glass-panel">
                    <h2 className={isMyTurn ? 'my-turn' : 'opponent-turn'}>
                        {isMyTurn ? 'YOUR TURN TO ATTACK' : `WAITING FOR ${opponent.name.toUpperCase()}...`}
                    </h2>
                    {error && <div className="error-text" style={{ marginTop: '0.5rem' }}>{error}</div>}
                </div>
            )}

            <div className="boards-layout">
                <div className="board-section glass-panel tracking-board">
                    <h3>Target Tracking Board (Attack Here)</h3>
                    <div className="board-scroll-wrapper">
                        <Board
                            axes={gameState.axes}
                            grid={trackingGrid}
                            onCellClick={handleAttack}
                            interactive={isMyTurn && !isFinished && !gameState.pendingValidation}
                        />
                    </div>
                </div>

                <div className="board-section glass-panel my-board">
                    <h3>Your Deployment Board</h3>
                    <div className="board-scroll-wrapper">
                        <Board
                            axes={gameState.axes}
                            grid={myGrid}
                            interactive={false}
                        />
                    </div>
                </div>
            </div>

            {gameState.pendingValidation && (
                <ValidationModal
                    validationData={gameState.pendingValidation}
                    myId={myId}
                    onValidate={handleValidate}
                    validatorName={
                        gameState.pendingValidation.attackerId === myId ? opponent.name : 'You'
                    }
                />
            )}
        </div>
    );
}
