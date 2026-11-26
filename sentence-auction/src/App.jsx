import { useState, useEffect, useRef } from 'react';
import { bindGameControls } from '../../gallery/shared/runtime.js';
import { openRoom } from './lib/room';
import Lobby from './views/Lobby';
import DealerDashboard from './views/DealerDashboard';
import BidderDisplay from './views/BidderDisplay';
import './App.css';

export default function App() {
  const [state, setState] = useState(null);
  const [session, setSession] = useState(null);
  const [notice, setNotice] = useState('');
  const room = useRef(null);
  useEffect(() => () => room.current?.close(), []);
  useEffect(() => {
    if (!session) return;
    const keys = session.role === 'Dealer' ? ['answer1', 'answer2', 'answer3', 'next'] : ['confirm'];
    const actions = Object.fromEntries(keys.map(key => [key, () => {
      document.querySelector('[data-game-action="' + key + '"]')?.click();
    }]));
    return bindGameControls('sentence-auction', actions);
  }, [session]);
  function leave(message = '') {
    room.current?.close(); room.current = null;
    setSession(null); setState(null); setNotice(message);
  }
  async function join(options) {
    setNotice('');
    room.current = await openRoom({ ...options, onState: setState, onClose: leave });
    setState(room.current.state); setSession(options);
  }
  const View = session?.role === 'Dealer' ? DealerDashboard : BidderDisplay;
  return <div className="app-container">
    <header className="header">
      <a href="/" target="_top" className="logo">⚖ Sentence Auction</a>
      {session && <div>{session.role} · Room <strong>{session.roomId}</strong>
        <button className="ml-4 underline" onClick={() => leave()}>Leave room</button></div>}
    </header>
    <main className="main-content">
      {session && state ? <View gameState={state} updateState={patch => room.current?.update(patch)} />
        : <Lobby onJoin={join} notice={notice} />}
    </main>
  </div>;
}
