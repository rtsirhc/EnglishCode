import { useState } from 'react';
import { socket } from '../lib/socket';
import Board from '../components/Board';
import './SetupPhase.css';

const SHIPS = [
    { id: 'carrier', name: 'Carrier', size: 5 },
    { id: 'battleship', name: 'Battleship', size: 4 },
    { id: 'cruiser', name: 'Cruiser', size: 3 },
    { id: 'submarine', name: 'Submarine', size: 3 },
    { id: 'destroyer', name: 'Destroyer', size: 2 },
];

export default function SetupPhase({ gameState, roomId }) {
    const [placedShips, setPlacedShips] = useState([]); // [{x, y}] coords of all placed ship segments
    const [currentShipIndex, setCurrentShipIndex] = useState(0);
    const [isHorizontal, setIsHorizontal] = useState(true);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);

    // Derive board size from gameState axes
    const width = gameState.axes.x.length;
    const height = gameState.axes.y.length;

    const currentShipToPlace = SHIPS[currentShipIndex];

    const handleCellClick = (x, y) => {
        if (ready || !currentShipToPlace) return;
        setError('');

        const size = currentShipToPlace.size;

        // Check boundaries
        if (isHorizontal) {
            if (x + size > width) {
                setError('Ship does not fit horizontally here!');
                return;
            }
        } else {
            if (y + size > height) {
                setError('Ship does not fit vertically here!');
                return;
            }
        }

        // Generate new coordinates
        const newCoords = [];
        for (let i = 0; i < size; i++) {
            newCoords.push({
                x: isHorizontal ? x + i : x,
                y: isHorizontal ? y : y + i
            });
        }

        // Check collision
        const collision = newCoords.some(coord =>
            placedShips.some(placed => placed.x === coord.x && placed.y === coord.y)
        );

        if (collision) {
            setError('Ships cannot overlap!');
            return;
        }

        setPlacedShips(prev => [...prev, ...newCoords]);
        setCurrentShipIndex(prev => prev + 1);
    };

    const handleReset = () => {
        setPlacedShips([]);
        setCurrentShipIndex(0);
        setError('');
        setReady(false);
    };

    const handleReady = () => {
        setReady(true);
        socket.emit('place_ships', { roomId, ships: placedShips }, (response) => {
            if (!response.success) {
                setError(response.message);
                setReady(false);
            }
        });
    };

    // Convert placedShips array to board grid prop (1 = ship, 0 = empty)
    const shipGrid = Array(height).fill(null).map(() => Array(width).fill(0));
    placedShips.forEach(({ x, y }) => {
        shipGrid[y][x] = 1; // 1 represents a ship segment
    });

    return (
        <div className="container animate-fade-in setup-container">
            <div className="setup-header glass-panel">
                <div className="setup-info">
                    <h2>Deploy Your Fleet</h2>
                    <p>Room Code: <strong>{roomId}</strong></p>
                    <div className="players-status">
                        {Object.values(gameState.players).map(p => (
                            <span key={p.id} className={`player-badge ${p.ready ? 'ready' : ''}`}>
                                {p.name}: {p.ready ? 'Ready' : 'Placing Ships'}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="setup-controls">
                    {!ready ? (
                        <>
                            <div className="ship-status">
                                {currentShipToPlace ? (
                                    <>
                                        <h3>Placing: {currentShipToPlace.name} (Length: {currentShipToPlace.size})</h3>
                                        <button className="btn secondary" onClick={() => setIsHorizontal(!isHorizontal)}>
                                            Rotate: {isHorizontal ? 'Horizontal ↔️' : 'Vertical ↕️'}
                                        </button>
                                    </>
                                ) : (
                                    <h3>All ships placed!</h3>
                                )}
                            </div>

                            {error && <div className="error-text">{error}</div>}

                            <div className="action-row" style={{ marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <button className="btn danger" onClick={handleReset}>Reset Board</button>
                                <button
                                    className="btn success"
                                    onClick={handleReady}
                                    disabled={currentShipIndex < SHIPS.length}
                                >
                                    Confirm Placement
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="waiting-status">
                            <h3>Waiting for opponent...</h3>
                        </div>
                    )}
                </div>
            </div>

            <div className="board-wrapper glass-panel">
                <Board
                    axes={gameState.axes}
                    grid={shipGrid}
                    onCellClick={handleCellClick}
                    interactive={!ready && currentShipIndex < SHIPS.length}
                    previewShip={currentShipToPlace ? { size: currentShipToPlace.size, isHorizontal } : null}
                />
            </div>
        </div>
    );
}
