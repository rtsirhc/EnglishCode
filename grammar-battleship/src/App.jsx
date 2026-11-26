import { bindGameControls } from '../../gallery/shared/runtime.js';
import { useState, useEffect } from 'react';
import { socket } from './lib/socket';
import Lobby from './views/Lobby';
import SetupPhase from './views/SetupPhase';
import GamePhase from './views/GamePhase';
import './App.css';

function App() {
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState('local');
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => bindGameControls('grammar-battleship', Object.fromEntries(
    ['answer1', 'answer2', 'confirm'].map(action => [action, () => document.querySelector('[data-game-action="' + action + '"]')?.click()])
  )), []);
  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      setGameState(null);
      setRoomId('');
    }

    function onGameStateUpdate(state) {
      setGameState(state);
    }

    function onRoomClosed(message) { setGameState(null); setRoomId(''); setNotice(message); }
    socket.on('room_closed', onRoomClosed);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game_state_update', onGameStateUpdate);

    return () => {
      socket.off('room_closed', onRoomClosed);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game_state_update', onGameStateUpdate);
      socket.disconnect();
    };
  }, []);

  const renderView = () => {
    if (!gameState || gameState.status === 'lobby') {
      return <Lobby setRoomId={setRoomId} setGameState={setGameState} gameState={gameState} roomId={roomId} />;
    }

    if (gameState.status === 'setup') {
      return <SetupPhase gameState={gameState} roomId={roomId} />;
    }

    if (gameState.status === 'playing' || gameState.status === 'finished') {
      return <GamePhase gameState={gameState} roomId={roomId} />;
    }

    return null;
  };

  return (
    <div className="app-container">
      <header className="header">
        <a href="/" target="_top" className="logo">🔫 Grammar Battleship</a>
        <div style={{ color: isConnected ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {isConnected ? 'Ready' : 'Disconnected'}
        </div>
      </header>
      <main className="main-content">
        {!gameState && <div className="connection-options glass-panel">
          <label>Connection <select value={mode} onChange={event => { setMode(event.target.value); socket.setMode(event.target.value); }}>
            <option value="local">Same browser</option><option value="online">Separate devices</option>
          </select></label>
          <p>{mode === 'local' ? 'Open the opponent in another tab in this browser. Both screens use Same browser.' : 'Both devices need internet. Start the host first and use Separate devices on both screens.'}</p>
          {notice && <p role="alert">{notice}</p>}
        </div>}
        {gameState && <button className="btn secondary" onClick={() => { socket.disconnect(); socket.connect(); setGameState(null); setRoomId(''); }}>Leave room</button>}
        {renderView()}
      </main>
    </div>
  );
}

export default App;
