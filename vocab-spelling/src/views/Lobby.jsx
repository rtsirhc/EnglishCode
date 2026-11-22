import { useState } from 'react';
import { socket } from '../lib/socket';

export default function Lobby({ onJoin }) {
  const [roomId, setRoomId] = useState('SPELLING');
  const [role, setRole] = useState('Teacher');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!socket.connected) socket.connect();

    socket.emit('join_room', { roomId, role }, (response) => {
      setIsLoading(false);
      if (response.success) {
        onJoin(roomId, role);
      } else {
        alert('Failed to join room.');
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full fade-in">
      <div className="bg-card-bg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-card-border">
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

        <form onSubmit={handleJoin} className="space-y-6">
          {/* Room Code */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm font-medium uppercase tracking-wider">
              Room Code
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full bg-deep-bg border border-card-border rounded-xl p-3.5 text-white text-lg text-center font-bold tracking-widest focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold uppercase"
              required
            />
          </div>

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

          {/* Join Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-green-900/30 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Connecting…' : 'Enter Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
