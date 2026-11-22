import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Eye, XCircle, SkipForward, Play, Pause, RotateCcw, CheckCircle, Shield, Swords, Dices, UserCircle2 } from 'lucide-react';
import { questionsDay1, questionsDay2, questionsDay3 } from '../data/questions';

export default function TeacherScreen({ initialTeamRosters, day }) {
  const channelRef = useRef(null);

  const shuffledQuestions = useMemo(() => {
    let qBase = questionsDay1;
    if (day === 2) qBase = questionsDay2;
    if (day === 3) qBase = questionsDay3;
    return [...qBase];
  }, [day]);

  // Game State
  const [teams, setTeams] = useState(() => {
    const rosters = initialTeamRosters || [["Student A", "Student B"], ["Student C", "Student D"]];
    return rosters.map((roster, i) => {
      const r_shuffled = [...roster].sort(() => 0.5 - Math.random());
      const active = r_shuffled.length > 0 ? r_shuffled.pop() : "No Name";
      return {
        id: i + 1,
        score: 0,
        students: roster,
        availableStudents: r_shuffled,
        activeStudent: active
      };
    });
  });
  
  const [championId, setChampionId] = useState(1);
  const [challengerId, setChallengerId] = useState(teams.length > 1 ? 2 : 1);
  const [activeTalkerId, setActiveTalkerId] = useState(1);
  
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [fuzzyText, setFuzzyText] = useState("");

  const [timerRemaining, setTimerRemaining] = useState(15);
  const [timerIsPlaying, setTimerIsPlaying] = useState(false);

  const currentQ = shuffledQuestions[qIndex];

  const broadcastState = useCallback((
    actionDetails = null, 
    localTeams = teams, 
    localChamp = championId, 
    localChall = challengerId, 
    localTalker = activeTalkerId,
    localTimer = timerRemaining
  ) => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'STATE_UPDATE',
        payload: {
          teams: localTeams,
          championId: localChamp,
          challengerId: localChall,
          activeTalkerId: localTalker,
          question: currentQ,
          revealed,
          timerRemaining: localTimer,
          action: actionDetails
        }
      });
    }
  }, [teams, championId, challengerId, activeTalkerId, currentQ, revealed, timerRemaining]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('classroom-feud');
    broadcastState();
    
    const handleFocus = () => broadcastState();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      channelRef.current.close();
    };
  }, [broadcastState]);

  const handleStrikeState = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'STRIKE' });
    }

    const nextTalker = activeTalkerId === championId ? challengerId : championId;
    setActiveTalkerId(nextTalker);
    
    setTimerRemaining(15);
    setTimerIsPlaying(true);
  }, [activeTalkerId, championId, challengerId]);

  // Timer Tick
  useEffect(() => {
    let interval;
    if (timerIsPlaying && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          const newTime = prev - 1;
          broadcastState(null, teams, championId, challengerId, activeTalkerId, newTime);
          return newTime;
        });
      }, 1000);
    } else if (timerIsPlaying && timerRemaining <= 0) {
      setTimerIsPlaying(false);
      handleStrikeState();
    }
    return () => clearInterval(interval);
  }, [timerIsPlaying, timerRemaining, broadcastState, handleStrikeState, teams, championId, challengerId, activeTalkerId]);

  const drawStudent = (teamId) => {
    const newTeams = teams.map(t => {
      if (t.id === teamId) {
        let pool = [...t.availableStudents];
        if (pool.length === 0) {
          pool = [...t.students].filter(s => s !== t.activeStudent);
          if (pool.length === 0) pool = [...t.students];
          pool.sort(() => 0.5 - Math.random());
        }
        const nextStudent = pool.pop();
        return { ...t, availableStudents: pool, activeStudent: nextStudent || "No Name" };
      }
      return t;
    });
    setTeams(newTeams);
    broadcastState('DRAW_PLAYER', newTeams);
  };

  const handleReveal = (idx) => {
    if (!revealed.includes(idx)) {
      const newRevealed = [...revealed, idx];
      setRevealed(newRevealed);
      
      const points = currentQ.answers[idx].points;
      const newTeams = teams.map(t => t.id === activeTalkerId ? { ...t, score: t.score + points } : t);
      setTeams(newTeams);

      const nextTalker = activeTalkerId === championId ? challengerId : championId;
      setActiveTalkerId(nextTalker);

      setTimerRemaining(15);
      setTimerIsPlaying(true);

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'STATE_UPDATE',
          payload: { teams: newTeams, championId, challengerId, activeTalkerId: nextTalker, question: currentQ, revealed: newRevealed, timerRemaining: 15, action: 'REVEAL' }
        });
      }
    }
  };

  const handleSetChampion = (e) => {
    const newId = parseInt(e.target.value);
    setChampionId(newId);
    if (activeTalkerId === championId) setActiveTalkerId(newId);
  };
  
  const handleSetChallenger = (e) => {
    const newId = parseInt(e.target.value);
    setChallengerId(newId);
    if (activeTalkerId === challengerId) setActiveTalkerId(newId);
  };

  const handleRandomizeMatchup = () => {
    if (teams.length < 2) return;
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const champ = shuffled[0].id;
    const chall = shuffled[1].id;
    
    setChampionId(champ);
    setChallengerId(chall);
    setActiveTalkerId(champ);
    setTimerRemaining(15);
    setTimerIsPlaying(false);

    broadcastState('ANIMATE_MATCHUP', teams, champ, chall, champ, 15);
  };

  const nextQuestion = () => {
    setQIndex(prev => (prev + 1) % shuffledQuestions.length);
    setRevealed([]);
    setFuzzyText("");
    setActiveTalkerId(challengerId);
    setTimerRemaining(15);
    setTimerIsPlaying(false);
  };

  const toggleTimer = () => setTimerIsPlaying(!timerIsPlaying);
  const resetTimer = () => {
    setTimerRemaining(15);
    setTimerIsPlaying(false);
  };

  const pointWinner = teams.find(t => t.score >= 1000);
  const winner = pointWinner ? pointWinner.id : null;

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-6 border-t-8 border-indigo-600">
        
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black text-indigo-900 tracking-tight">Teacher Control Panel</h1>
            <p className="text-slate-500 font-medium text-sm">Theme Day {day} • Question {qIndex + 1}/{shuffledQuestions.length}</p>
          </div>
          <div className="flex gap-2">
           <button 
             onClick={() => window.open(window.location.origin + window.location.pathname + '?role=projector', '_blank')}
             className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-bold text-sm tracking-wide hover:bg-indigo-200 transition"
           >
             Re-open Projector
           </button>
          </div>
        </header>

        {winner && (
          <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg border-2 border-green-500 text-center font-bold text-xl flex justify-center items-center gap-2">
            <CheckCircle className="w-8 h-8" />
            TEAM {winner} WINS THE GAME!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            
            {/* Active Face-Off Info */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-inner text-white relative">
              
              <div className="flex justify-end mb-4">
                 <button 
                  onClick={handleRandomizeMatchup}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-bold shadow-md transition"
                 >
                   <Dices className="w-5 h-5"/>
                   Randomize Matchup
                 </button>
              </div>

              <div className="flex justify-between items-center mb-4">
                 <div className={`p-4 rounded-xl flex-1 text-center transition ${activeTalkerId === championId ? 'bg-indigo-600 ring-4 ring-indigo-300' : 'bg-slate-700 opacity-80'}`}>
                    <span className="block text-xs uppercase tracking-widest text-indigo-200 mb-2 font-bold">Champion Player</span>
                    <select 
                      value={championId} 
                      onChange={handleSetChampion}
                      className="bg-white text-indigo-900 font-black text-lg w-full rounded-md p-2 shadow-sm border-2 border-indigo-400 cursor-pointer text-center mb-4"
                    >
                      {teams.map(t => <option key={t.id} value={t.id}>Team {t.id}</option>)}
                    </select>

                    <div className="bg-indigo-900/50 rounded-lg p-3 flex flex-col gap-2 border border-indigo-500/30">
                       <span className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 uppercase tracking-wider"><UserCircle2 className="w-3 h-3"/> Active Student</span>
                       <span className="text-2xl font-black text-white">{teams.find(t=>t.id===championId)?.activeStudent}</span>
                       <button 
                         onClick={() => drawStudent(championId)}
                         className="mt-2 w-full bg-indigo-500 hover:bg-indigo-400 text-indigo-950 font-black py-2 px-2 rounded-md flex items-center justify-center gap-2 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all"
                       >
                         <Dices className="w-5 h-5"/> Next Student
                       </button>
                    </div>

                 </div>
                 
                 <div className="px-4 font-black italic text-amber-400 text-2xl flex items-center gap-1">
                   <Swords className="w-5 h-5"/> VS
                 </div>

                 <div className={`p-4 rounded-xl flex-1 text-center transition ${activeTalkerId === challengerId ? 'bg-emerald-600 ring-4 ring-emerald-300' : 'bg-slate-700 opacity-80'}`}>
                    <span className="block text-xs uppercase tracking-widest text-emerald-200 mb-2 font-bold">Challenger Player</span>
                    <select 
                      value={challengerId} 
                      onChange={handleSetChallenger}
                      className="bg-white text-emerald-900 font-black text-lg w-full rounded-md p-2 shadow-sm border-2 border-emerald-400 cursor-pointer text-center mb-4"
                    >
                      {teams.map(t => <option key={t.id} value={t.id}>Team {t.id}</option>)}
                    </select>

                    <div className="bg-emerald-900/50 rounded-lg p-3 flex flex-col gap-2 border border-emerald-500/30">
                       <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1 uppercase tracking-wider"><UserCircle2 className="w-3 h-3"/> Active Student</span>
                       <span className="text-2xl font-black text-white">{teams.find(t=>t.id===challengerId)?.activeStudent}</span>
                       <button 
                         onClick={() => drawStudent(challengerId)}
                         className="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-2 px-2 rounded-md flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all"
                       >
                         <Dices className="w-5 h-5"/> Next Student
                       </button>
                    </div>
                 </div>
              </div>

              <div className="text-center font-bold text-sm bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 shadow flex justify-center items-center gap-3">
                <span className="text-slate-300">Whose Turn Is It Next?</span> 
                <select 
                  value={activeTalkerId} 
                  onChange={(e) => {
                    setActiveTalkerId(parseInt(e.target.value));
                    setTimerRemaining(15);
                    setTimerIsPlaying(false);
                  }}
                  className="bg-white text-slate-900 font-black border-2 border-amber-400 rounded-md outline-none px-3 py-1 cursor-pointer text-center"
                >
                  <option value={championId}>Team {championId}</option>
                  {championId !== challengerId && <option value={challengerId}>Team {challengerId}</option>}
                </select>
              </div>

              {/* Timer Controls */}
              <div className="mt-4 flex items-center justify-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-600">
                <span className={`font-mono text-3xl font-black ${timerRemaining <= 5 ? 'text-red-500' : 'text-white'}`}>
                  00:{timerRemaining.toString().padStart(2, '0')}
                </span>
                
                <button 
                  onClick={toggleTimer}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition ${timerIsPlaying ? 'bg-amber-500 hover:bg-amber-600 text-amber-950' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  {timerIsPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                  {timerIsPlaying ? 'Pause Timer' : 'Play Timer'}
                </button>
                
                <button 
                  onClick={resetTimer}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md font-bold text-sm transition"
                >
                  <RotateCcw className="w-4 h-4"/>
                  Reset
                </button>
              </div>
              
              <h2 className="text-3xl font-bold leading-tight mt-6 text-center text-amber-300">
                "{currentQ.question}"
              </h2>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Answers to Reveal</h3>
              {currentQ.answers.map((ans, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-slate-200 text-slate-500 font-bold rounded-full flex items-center justify-center text-lg shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-xl font-bold text-slate-800 truncate">
                    {ans.text} <span className="text-slate-400 text-base font-normal ml-2">({ans.points} pts)</span>
                  </div>
                  <button 
                    disabled={revealed.includes(idx)}
                    onClick={() => handleReveal(idx)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${revealed.includes(idx) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow-md active:scale-95'}`}
                  >
                    <Eye className="w-5 h-5" />
                    Reveal
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between gap-4">
              <button 
                onClick={handleStrikeState}
                disabled={winner}
                className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xl py-4 rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-8 h-8" />
                STRIKE (SKIP TURN)
              </button>
              
              <button 
                onClick={nextQuestion}
                className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg active:scale-95 transition"
              >
                Next Question
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-bold text-slate-500 mb-1">Check Answer (Optional fuzzy search)</label>
              <input 
                type="text" 
                value={fuzzyText}
                onChange={(e) => setFuzzyText(e.target.value)}
                placeholder="Type to quickly check if an answer matches..."
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 focus:bg-white transition"
              />
              {fuzzyText.length > 1 && (
                <div className="mt-2 text-sm font-semibold">
                  {currentQ.answers.some(a => a.text.toLowerCase().includes(fuzzyText.toLowerCase())) ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Match found!</span>
                  ) : (
                    <span className="text-red-500">No match on the board.</span>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
            <h3 className="font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Team Roster
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-tight">Edit the scores directly in the boxes below to manually override points.</p>
            <div className="space-y-3">
              {teams.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border-2 bg-white border-slate-200">
                  <div className="font-black text-lg text-slate-800 flex flex-col items-start truncate pr-2">
                    <span>TEAM {t.id}</span>
                    <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded mt-1">UP: {t.activeStudent}</span>
                  </div>
                  <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded px-2 shrink-0">
                    <span className="text-indigo-700 font-bold text-sm">pts:</span>
                    <input 
                      type="number"
                      value={t.score}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setTeams(teams.map(team => team.id === t.id ? { ...team, score: val } : team));
                      }}
                      className="w-16 text-right bg-transparent text-indigo-900 font-black px-1 py-1 text-lg outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
