import { useState } from 'react';
import { socket } from '../lib/socket';

export default function Lobby({ onJoin }) {
    const [roomId, setRoomId] = useState('AUCTION');
    const [role, setRole] = useState('Dealer');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('join_room', { roomId, role }, (response) => {
            setIsLoading(false);
            if (response.success) {
                onJoin(roomId, role, response.state);
            } else {
                alert(response.message || 'Failed to join');
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-accent-gold">
                    Sentence Auction
                </h2>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 mb-2 font-medium">Room Code</label>
                        <input
                            type="text"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value.toUpperCase())}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-lg focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold uppercase"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2 font-medium">Select Role</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className={`py-3 rounded-lg font-bold transition-colors ${role === 'Dealer' ? 'bg-accent-gold text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                onClick={() => setRole('Dealer')}
                            >
                                Teacher / Dealer
                            </button>
                            <button
                                type="button"
                                className={`py-3 rounded-lg font-bold transition-colors ${role === 'Bidder' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                onClick={() => setRole('Bidder')}
                            >
                                Student / Bidder
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg text-lg transition-colors mt-4 shadow-lg shadow-green-900/20 disabled:opacity-50"
                    >
                        {isLoading ? 'Connecting...' : 'Enter Auction'}
                    </button>
                </form>
            </div>
        </div>
    );
}
