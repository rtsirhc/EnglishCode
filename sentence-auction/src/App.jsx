import { useState, useEffect } from 'react';
import { socket } from './lib/socket';
import Lobby from './views/Lobby';
import DealerDashboard from './views/DealerDashboard';
import BidderDisplay from './views/BidderDisplay';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      setGameState(null); // Return to lobby on disconnect
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

  const handleJoinLobby = (joinedRoomId, selectedRole, state) => {
    setRoomId(joinedRoomId);
    setRole(selectedRole);
    setGameState(state);
  };

  const renderView = () => {
    if (!gameState) {
      return <Lobby onJoin={handleJoinLobby} />;
    }

    if (role === 'Dealer') {
      return <DealerDashboard roomId={roomId} gameState={gameState} />;
    }

    if (role === 'Bidder') {
      return <BidderDisplay roomId={roomId} gameState={gameState} />;
    }

    return null;
  };

  return (
    <div className="app-container">
      <header className="header">
        <a href="/" className="logo cursor-pointer tracking-wider">⚖️ THE SENTENCE AUCTION</a>

        <div className="flex gap-6 items-center">
          {role && (
            <div className="text-slate-300 font-bold px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <span className="text-slate-500 mr-2">ROLE:</span>
              <span className={role === 'Dealer' ? 'text-accent-gold' : 'text-indigo-400'}>
                {role.toUpperCase()}
              </span>
            </div>
          )}
          {roomId && (
            <div className="text-slate-300 font-bold px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <span className="text-slate-500 mr-2">ROOM:</span>
              <span className="text-white">{roomId}</span>
            </div>
          )}
          <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </header>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
