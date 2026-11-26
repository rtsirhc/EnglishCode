import { useState } from 'react';
import { socket } from '../lib/socket';

export default function Lobby({ onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState('Teacher');
  const [mode, setMode] = useState('local');
  const [custom, setCustom] = useState(Boolean(socket.pack));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleJoin(event) {
    event.preventDefault();
    setError('');
    const code = role === 'Teacher' ? crypto.randomUUID().slice(0, 8).toUpperCase() : roomId.trim();
    if (!/^[A-F0-9]{8}$/.test(code)) {
      setError('Enter the eight-character code from the teacher screen.');
      return;
    }
    setIsLoading(true);
    try {
      await socket.join(code, role, mode, custom, onJoin);
    } catch (cause) {
      setError(cause.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full fade-in">
      <div className="bg-card-bg p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-card-border">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📝</div>
          <h1 className="text-3xl font-extrabold text-accent-gold tracking-wide">
            Vocab Spelling Bet
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Real-time spelling challenge
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6"><fieldset disabled={isLoading} className="space-y-5">
          {/* Role Select */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm font-medium uppercase tracking-wider">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  role === 'Teacher'
                    ? 'bg-accent-gold text-slate-900 shadow-lg shadow-accent-gold/20'
                    : 'bg-deep-bg text-slate-400 border border-card-border hover:border-slate-500'
                }`}
                onClick={() => setRole('Teacher')}
              >
                🎤 Teacher
              </button>
              <button
                type="button"
                className={`py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  role === 'Student'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-deep-bg text-slate-400 border border-card-border hover:border-slate-500'
                }`}
                onClick={() => setRole('Student')}
              >
                🎓 Student
              </button>
            </div>
          </div>

          <label className="block text-sm">Connection
            <select className="block w-full p-3 bg-deep-bg rounded-xl" value={mode} onChange={e => setMode(e.target.value)}>
              <option value="local">Same browser · two tabs</option>
              <option value="online">Separate devices · internet</option>
            </select>
          </label>
          {role === 'Student' && <label className="block text-sm">Room code
            <input required maxLength={8} autoComplete="off" className="block w-full p-3 bg-deep-bg rounded-xl"
              value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} />
          </label>}
          {role === 'Teacher' && socket.pack && <label className="block text-sm">
            <input type="checkbox" checked={custom} onChange={e => setCustom(e.target.checked)} /> Play {socket.pack.title} ({socket.pack.items.length} words)
          </label>}
          {error && <p role="alert" className="text-red-300">{error}</p>}
          {/* Join Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-green-900/30 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Connecting…' : role === 'Teacher' ? 'Create Room' : 'Join Room'}
          </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
