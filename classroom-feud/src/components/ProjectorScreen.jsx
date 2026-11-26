import { useState, useEffect, useRef } from 'react';
import { X, Swords } from 'lucide-react';
import { tone } from '../../../gallery/shared/sound.js';

export default function ProjectorScreen({ room }) {
  const [gameState, setGameState] = useState(null);
  const [closed, setClosed] = useState(false);
  const [showX, setShowX] = useState(false);
  const sound = useRef(false);

  useEffect(() => {
    if (!room || !/^[0-9a-f-]{36}$/.test(room)) return;
    const channel = new BroadcastChannel('classroom-feud:' + room);
    let lastEvent, timeout;
    channel.onmessage = ({ data }) => {
      if (data?.type === 'closed') {
        setClosed(true);
        setGameState(null);
        setShowX(false);
        clearTimeout(timeout);
      }
      if (data?.type !== 'state') return;
      const payload = data.payload;
      setClosed(false);
      setGameState(payload);
      if (lastEvent !== undefined && lastEvent !== payload.eventId && payload.event) {
        if (sound.current) tone(payload.event === 'reveal' ? 'correct' : 'wrong');
        if (payload.event === 'strike') {
          setShowX(true);
          clearTimeout(timeout);
          timeout = setTimeout(() => setShowX(false), 1200);
        }
      }
      lastEvent = payload.eventId;
    };
    channel.postMessage({ type: 'request' });
    return () => { clearTimeout(timeout); channel.close(); };
  }, [room]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-2xl sm:text-4xl font-black tracking-widest text-center p-5">
        {closed ? 'The teacher closed this room.' : room ? 'Waiting for the teacher…' : 'Open the projector from the teacher screen.'}
      </div>
    );
  }

  const { teams, championId, challengerId, activeTalkerId, question, winners, timerRemaining = 15 } = gameState;
  
  const champObj = teams.find(t => t.id === championId) || {};
  const challObj = teams.find(t => t.id === challengerId) || {};

  return (
    <div className="min-h-[100dvh] md:h-[100dvh] bg-slate-950 bg-[radial-gradient(ellipse_at_center,#1e3a8a_0%,#0f172a_58%,#020617_100%)] text-white relative flex flex-col font-sans overflow-x-hidden md:overflow-hidden">
      
      {/* Giant Red X Overlay */}
      <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${showX ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <X className="w-[60vw] h-[60vw] text-red-600 drop-shadow-[0_0_100px_rgba(220,38,38,0.8)] animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite]" strokeWidth={3} />
      </div>

      {winners.length > 0 && (
         <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-green-900/90 backdrop-blur-sm animate-in fade-in zoom-in duration-700">
           <h1 className="text-5xl md:text-[8rem] font-black text-amber-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mb-8 tracking-tighter text-center px-3">
             {winners.length > 1 ? `TIE · TEAMS ${winners.join(', ')}` : `TEAM ${winners[0]} WINS!`}
           </h1>

         </div>
      )}

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-4 relative z-10 w-full max-w-6xl mx-auto md:overflow-hidden">
        
        {/* Floating Timer */}
        <div className="flex gap-3 items-center self-start mb-3 z-30 md:absolute md:top-4 md:left-4">
          <div className={`w-12 h-12 md:w-24 md:h-24 rounded-full border-[6px] md:border-8 flex items-center justify-center font-black text-xl md:text-5xl tabular-nums bg-black/50 backdrop-blur-md shadow-2xl transition-all duration-300 ${timerRemaining <= 5 ? 'text-red-500 border-red-500 animate-[pulse_0.5s_ease-in-out_infinite] scale-110' : 'text-amber-400 border-amber-400'}`}>
            {timerRemaining}
          </div>
          <button className="text-xs text-white underline" onClick={event => { sound.current = !sound.current; event.currentTarget.textContent = sound.current ? 'Mute sound' : 'Enable sound'; if (sound.current) tone(); }}>Enable sound</button>
        </div>

        {/* Face-Off Banner */}
        <div className="flex items-center justify-center gap-2 md:gap-8 mb-4 w-full">
          <div className={`px-2 py-2 md:px-8 md:py-3 rounded-full border-4 text-sm sm:text-xl md:text-3xl font-black min-w-0 break-words transition-all duration-300 ${activeTalkerId === championId ? 'bg-indigo-600 border-indigo-200 text-white shadow-[0_0_30px_rgba(79,70,229,0.8)] scale-110 z-20' : 'bg-slate-800/80 border-slate-600 text-slate-400 scale-95 z-10'}`}>
             <span className="opacity-80 text-xs md:text-xl font-bold">TEAM {championId}</span> <span className="text-white ml-2">{champObj.activeStudent?.toUpperCase()}</span>
          </div>
          <div className="text-3xl md:text-5xl font-black italic text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] flex items-center gap-2">
            <Swords className="w-5 h-5 md:w-12 md:h-12"/> VS
          </div>
          <div className={`px-2 py-2 md:px-8 md:py-3 rounded-full border-4 text-sm sm:text-xl md:text-3xl font-black min-w-0 break-words transition-all duration-300 ${activeTalkerId === challengerId ? 'bg-emerald-600 border-emerald-200 text-white shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-110 z-20' : 'bg-slate-800/80 border-slate-600 text-slate-400 scale-95 z-10'}`}>
             <span className="opacity-80 text-xs md:text-xl font-bold">TEAM {challengerId}</span> <span className="text-white ml-2">{challObj.activeStudent?.toUpperCase()}</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="w-full bg-gradient-to-b from-blue-600 to-blue-800 border-4 border-yellow-400 rounded-2xl p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6 z-20">
          <h2 className="text-2xl md:text-4xl font-black text-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] leading-tight">
            {question.question}
          </h2>
        </div>

        {/* Answer Board Grid - scales nicely up to 7 items */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:flex-1 content-start md:overflow-y-auto pr-2 pb-2">
          {question.answers.map((ans, idx) => {
            const isRevealed = Boolean(ans);
            return (
              <div key={idx} data-revealed={isRevealed} className="relative h-16 md:h-20 perspective-[1000px] w-full group">
                <div 
                  className={`w-full h-full absolute top-0 left-0 transition-all duration-700 [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateX(180deg)]' : ''}`}
                >
                  {/* Front: Covered State */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-700 to-blue-900 border-4 border-blue-400 rounded-2xl flex items-center justify-center shadow-lg [backface-visibility:hidden]">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-950 rounded-full border-2 border-blue-300 flex items-center justify-center shadow-inner">
                      <span className="text-xl md:text-2xl font-black text-blue-200">{idx + 1}</span>
                    </div>
                  </div>

                  {/* Back: Revealed State */}
                  {ans && <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-gray-200 border-4 border-yellow-400 rounded-2xl flex items-center shadow-[0_0_30px_rgba(250,204,21,0.3)] [backface-visibility:hidden] [transform:rotateX(180deg)] px-4">
                    <span className="flex-1 text-xl md:text-3xl font-black text-blue-900 uppercase tracking-wide truncate pr-4">
                      {ans.text}
                    </span>
                    <span className="text-xl md:text-3xl font-black text-blue-600 border-l-4 border-blue-200 pl-4 shrink-0 bg-gray-50 h-full flex items-center justify-center rounded-r-xl w-20 md:w-28">
                      {ans.points}
                    </span>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Roster / Scoreboard footer */}
      <footer className="w-full bg-black/60 backdrop-blur-md border-t-2 border-white/10 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-2 py-3 flex flex-wrap justify-center gap-3">
          {teams.map(t => {
            const isMatchup = (t.id === championId || t.id === challengerId);
            return (
              <div 
                key={t.id} 
                className={`flex flex-col items-center justify-center w-20 h-16 md:w-40 md:h-24 rounded-xl border-[3px] transition-all duration-300 transform relative overflow-hidden
                    ${isMatchup 
                      ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20 opacity-100 scale-[1.05]' 
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-600 opacity-80' 
                    }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  <div className={`text-xs md:text-sm font-bold tracking-widest leading-none ${isMatchup ? 'text-blue-200' : 'text-slate-400'}`}>
                    TEAM {t.id}
                  </div>
                  <div className={`text-3xl md:text-4xl font-black drop-shadow-md leading-none my-1 ${isMatchup ? 'text-white' : 'text-slate-500'}`}>
                    {t.score || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </footer>

    </div>
  );
}
