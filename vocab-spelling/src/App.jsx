import { useState, useEffect } from 'react';
import { socket } from './lib/socket';
import Lobby from './views/Lobby';
import TeacherScreen from './views/TeacherScreen';
import StudentScreen from './views/StudentScreen';
import ResultsScreen from './views/ResultsScreen';
import './index.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => {
      setIsConnected(false);
      setGameState(null);
    };
    const onStateUpdate = (state) => setGameState(state);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game_state_update', onStateUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game_state_update', onStateUpdate);
      socket.disconnect();
    };
  }, []);

  const handleJoin = (joinedRoomId, selectedRole) => {
    setRoomId(joinedRoomId);
    setRole(selectedRole);
  };

  const renderView = () => {
    if (!gameState) {
      return <Lobby onJoin={handleJoin} />;
    }

    // Finished
    if (gameState.phase === 'finished') {
      return (
        <ResultsScreen
          money={gameState.money}
          reviewList={gameState.reviewList}
          totalWords={gameState.totalWords}
          wordsCompleted={gameState.wordsCompleted}
          roomId={roomId}
          role={role}
          elapsedTime={gameState.elapsedTime}
          timePenalty={gameState.timePenalty}
          finalTime={gameState.finalTime}
        />
      );
    }

    // Spelling phase — active
    if (role === 'Teacher') {
      return <TeacherScreen roomId={roomId} gameState={gameState} />;
    }
    if (role === 'Student') {
      return <StudentScreen roomId={roomId} gameState={gameState} />;
    }

    return null;
  };

  const modeLabel = gameState?.phase === 'finished' ? 'RESULTS' : 'SPELLING';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-card-bg border-b border-card-border">
        <a href="/" className="text-xl font-bold tracking-wider text-accent-gold hover:text-accent-gold-dark transition-colors">
          📝 VOCAB SPELLING BET
        </a>

        <div className="flex gap-3 items-center">
          {gameState && (
            <div className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400">
              {modeLabel}
            </div>
          )}
          {role && (
            <div className="text-sm font-bold px-3 py-1 rounded-full bg-deep-bg border border-card-border">
              <span className="text-slate-500 mr-1">ROLE:</span>
              <span className={role === 'Teacher' ? 'text-accent-gold' : 'text-indigo-400'}>
                {role.toUpperCase()}
              </span>
            </div>
          )}
          {roomId && (
            <div className="text-sm font-bold px-3 py-1 rounded-full bg-deep-bg border border-card-border">
              <span className="text-slate-500 mr-1">ROOM:</span>
              <span className="text-white">{roomId}</span>
            </div>
          )}
          <div className={`px-3 py-1 rounded-full font-bold text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? '● ONLINE' : '○ OFFLINE'}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center p-4 pt-6">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
