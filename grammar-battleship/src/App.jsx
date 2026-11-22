import { useState, useEffect } from 'react';
import { socket } from './lib/socket';
import Lobby from './views/Lobby';
import SetupPhase from './views/SetupPhase';
import GamePhase from './views/GamePhase';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGameStateUpdate(state) {
      setGameState(state);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game_state_update', onGameStateUpdate);

    return () => {
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
        <a href="/" className="logo">🔫 Grammar Battleship</a>
        <div style={{ color: isConnected ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {isConnected ? '🟢 Server Connected' : '🔴 Disconnected'}
        </div>
      </header>
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
