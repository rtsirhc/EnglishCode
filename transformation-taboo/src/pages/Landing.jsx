import { useEffect, useState } from 'react';
import socket from '../socket';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('local');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { socket.close(); }, []);
  async function enter(role) {
    setError('');
    const room = role === 'teacher' ? crypto.randomUUID().slice(0, 8).toUpperCase() : code.trim().toUpperCase();
    if (!/^[A-F0-9]{8}$/.test(room)) { setError('Enter the eight-character code from the teacher screen.'); return; }
    setBusy(true);
    try {
      await socket.open(role, room, mode);
      navigate('/' + role, { state: { room, mode } });
    } catch (cause) { setError(cause.message); setBusy(false); }
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-lg animate-fade-in">
        <div className="text-center mb-2">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            Grammar Arena
          </h1>
          <p className="mt-3 text-slate-500 text-lg font-medium">
            Real-time ESL Classroom Game
          </p>
        </div>

        <div className="flex gap-4 w-full">
          <div className="flex-1 bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-sky-600 font-bold text-sm">Game 1</div>
            <div className="text-slate-700 font-semibold text-xs mt-1">Transformation Drill</div>
          </div>
          <div className="flex-1 bg-violet-50 border border-violet-200 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">🃏</div>
            <div className="text-violet-600 font-bold text-sm">Game 2</div>
            <div className="text-slate-700 font-semibold text-xs mt-1">Taboo / Circumlocution</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <label className="font-semibold">Connection
            <select className="block w-full p-3 rounded-xl border" value={mode} disabled={busy} onChange={e => setMode(e.target.value)}>
              <option value="local">Same browser · two tabs</option>
              <option value="online">Separate devices · internet</option>
            </select>
          </label>
          <label className="font-semibold">Student room code
            <input className="block w-full p-3 rounded-xl border" value={code} disabled={busy} maxLength={8} autoCapitalize="characters" onChange={e => setCode(e.target.value.toUpperCase())} />
          </label>
          {error && <p role="alert">{error}</p>}
          {busy && <p role="status">Opening room…</p>}
          <button
            id="join-student-btn"
            disabled={busy} onClick={() => enter('student')}
            className="btn-primary w-full py-6 text-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 shadow-lg shadow-sky-200 rounded-2xl gap-3"
          >
            <span>📱</span>
            <span>Join as Student</span>
          </button>

          <button
            id="join-teacher-btn"
            disabled={busy} onClick={() => enter('teacher')}
            className="btn-primary w-full py-6 text-2xl bg-gradient-to-r from-violet-500 to-violet-400 hover:from-violet-400 hover:to-violet-300 shadow-lg shadow-violet-200 rounded-2xl gap-3"
          >
            <span>🖥️</span>
            <span>Join as Teacher</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm text-center">
          Open a teacher room, then enter its code on the student screen.
        </p>
      </div>
    </div>
  );
}
