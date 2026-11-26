import { useEffect, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import socket from '../socket';
import Game1Student from '../components/Game1Student';
import Game2Student from '../components/Game2Student';
import FinalScore from '../components/FinalScore';

export default function StudentView() {
  const { state: roomInfo } = useLocation();
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('state_update', (s) => setState(s));

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('state_update');
    };
  }, []);

  if (!roomInfo || (!socket.connected && !state)) return <Navigate to="/" replace />;
  if (!connected && state) return <main className="p-8"><h1>Room closed</h1><Link to="/">Return to room setup</Link></main>;
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-slate-500 text-xl font-semibold">Connecting to game server…</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center animate-fade-in px-6">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Waiting for Teacher</h2>
          <p className="text-slate-500 text-lg">The teacher is setting up the game…</p>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'game1')    return <Game1Student state={state} />;
  if (state.phase === 'game2')    return <Game2Student state={state} />;
  if (state.phase === 'finished') return <FinalScore state={state} role="student" />;

  return null;
}
