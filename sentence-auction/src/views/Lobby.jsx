import { useState } from 'react';


export default function Lobby({ onJoin, notice }) {
    const [roomId, setRoomId] = useState(() => crypto.randomUUID().slice(0, 6).toUpperCase());
    const [role, setRole] = useState('Dealer');
    const [isLoading, setIsLoading] = useState(false);

    const [mode, setMode] = useState('local');
    const [error, setError] = useState('');
    async function handleJoin(event) {
        event.preventDefault();
        setIsLoading(true); setError('');
        try { await onJoin({ roomId: roomId.trim(), role, mode }); }
        catch (reason) { setError(reason.message); }
        finally { setIsLoading(false); }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-accent-gold">
                    Sentence Auction
                </h2>

                <form onSubmit={handleJoin} className="space-y-6"><fieldset disabled={isLoading} className="space-y-6">
                    <label className="block">Connection
                        <select className="block w-full bg-slate-900 p-3 rounded" value={mode} onChange={e => setMode(e.target.value)}>
                            <option value="local">Same browser</option><option value="online">Separate devices</option>
                        </select>
                    </label>
                    <p>{mode === 'local' ? 'Start as dealer. For a bidder screen, open another tab in this browser and enter the same code.' : 'Start the dealer first. The bidder opens this game on another device and enters the same code. Both devices need internet.'}</p>
                    {(error || notice) && <p role="alert">{error || notice}</p>}
                    <div>
                        <label className="block text-slate-300 mb-2 font-medium" htmlFor="room-code">Room Code</label>
                        <input
                            id="room-code" type="text" pattern="[A-Z0-9]{4,12}" maxLength={12} title="4–12 letters or digits"
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
                </fieldset></form>
            </div>
        </div>
    );
}
