import { useEffect, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import socket from '../socket';
import TeacherLobby from '../components/TeacherLobby';
import Game1Teacher from '../components/Game1Teacher';
import Game2Teacher from '../components/Game2Teacher';
import FinalScore from '../components/FinalScore';

export default function TeacherView() {
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

  const handleReset = () => {
    socket.emit('teacher_reset');
  };

  if (!roomInfo || (!socket.connected && !state)) return <Navigate to="/" replace />;
  if (!connected && state) return <main className="p-8"><h1>Room closed</h1><Link to="/">Return to room setup</Link></main>;
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-slate-500 text-xl font-semibold">Connecting to game server…</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const phaseLabel = {
    lobby: 'Lobby — Choose a Game',
    game1: 'Game 1 · Transformation Drill',
    game2: 'Game 2 · Taboo / Circumlocution',
    finished: 'Session Complete',
  }[state.phase] ?? '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400" />

      {/* Teacher Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="text-slate-800 font-black text-lg leading-none">Teacher Panel</h1>
            <p className="text-slate-400 text-xs">{phaseLabel}</p><p className="font-bold">Room {roomInfo.room} · {roomInfo.mode === 'local' ? 'Same browser' : 'Separate devices'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-500'}`} title={connected ? 'Connected' : 'Disconnected'} />
          <button
            id="teacher-reset-btn"
            onClick={handleReset}
            className="btn-primary px-4 py-2 text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl gap-2"
          >
            <span>🔄</span> Reset
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {state.phase === 'lobby'    && <TeacherLobby />}
        {state.phase === 'game1'    && <Game1Teacher state={state} />}
        {state.phase === 'game2'    && <Game2Teacher state={state} />}
        {state.phase === 'finished' && <FinalScore state={state} role="teacher" />}
      </main>
    </div>
  );
}
