import { useState, useEffect, useReducer, useRef } from 'react';
import { Eye, XCircle, SkipForward, Play, Pause, RotateCcw, CheckCircle, Shield, Swords, Dices, UserCircle2 } from 'lucide-react';
import { questionsDay1, questionsDay2, questionsDay3 } from '../data/questions';
import { createGame, reduceGame, turnSeconds, projectorState, projectorUrl, winners } from '../game';
import { bindGameControls } from '../../../gallery/shared/runtime.js';

const banks = [null, questionsDay1, questionsDay2, questionsDay3];
const themes = ['', 'Sports & Everyday Topics', 'Cowboys & Animals', 'Heroes & Everyday Topics'];

export default function TeacherScreen({ initialTeamRosters, day, pack, room, onSetup }) {
  const [state, dispatch] = useReducer(reduceGame, initialTeamRosters, createGame);
  const [now, setNow] = useState(Date.now);
  const [fuzzyText, setFuzzyText] = useState('');
  const latest = useRef(null);
  const channel = useRef(null);
  const questions = pack?.items ?? banks[day];
  const { championId, challengerId, activeTalkerId, qIndex, revealed } = state;
  const teams = state.teams.map(team => ({ ...team, activeStudent: team.students[team.speaker] }));
  const currentQ = questions[qIndex];
  const winner = winners(state);
  const hasWinner = winner.length > 0;
  const result = winner.length > 1 ? `Tie · teams ${winner.join(', ')}` : `Team ${winner[0]} wins!`;
  const timerRemaining = turnSeconds(state, now);
  const timerIsPlaying = state.deadline !== null;
  const roundComplete = revealed.length === currentQ.answers.length;

  latest.current = projectorState(state, currentQ, now);
  useEffect(() => {
    const transport = new BroadcastChannel('classroom-feud:' + room);
    channel.current = transport;
    const send = () => transport.postMessage({ type: 'state', payload: latest.current });
    transport.onmessage = ({ data }) => { if (data?.type === 'request') send(); };
    const close = () => transport.postMessage({ type: 'closed' });
    window.addEventListener('pagehide', close);
    send();
    return () => {
      window.removeEventListener('pagehide', close);
      close();
      transport.close();
      channel.current = null;
    };
  }, [room]);
  useEffect(() => {
    channel.current?.postMessage({ type: 'state', payload: latest.current });
  }, [state, timerRemaining]);
  useEffect(() => {
    if (!timerIsPlaying) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      dispatch({ type: 'tick', now: time });
    }, 100);
    return () => clearInterval(timer);
  }, [timerIsPlaying]);
  useEffect(() => {
    const actions = {
      next: () => document.getElementById('feud-next')?.click(),
      confirm: () => document.getElementById('feud-timer')?.click(),
      buzzer: () => document.getElementById('feud-strike')?.click()
    };
    for (let i = 0; i < Math.min(8, currentQ.answers.length); i++) {
      actions['answer' + (i + 1)] = () => document.getElementById('feud-answer-' + i)?.click();
    }
    return bindGameControls('classroom-feud', hasWinner ? { next: () => document.getElementById('feud-replay')?.click() } : actions);
  }, [hasWinner, currentQ.answers.length]);

  function send(type, data) {
    const time = Date.now();
    setNow(time);
    dispatch({ type, now: time, ...data });
  }
  function handleMatch(side, id) {
    const nextChampion = side === 'champion' ? id : championId;
    const nextChallenger = side === 'challenger' ? id : challengerId;
    const active = activeTalkerId === championId ? nextChampion : nextChallenger;
    send('match', { championId: nextChampion, challengerId: nextChallenger, activeTalkerId: active });
  }
  function handleRandomizeMatchup() {
    const first = Math.floor(Math.random() * teams.length);
    const remaining = teams.filter((_, index) => index !== first);
    send('match', { championId: teams[first].id, challengerId: remaining[Math.floor(Math.random() * remaining.length)].id });
  }
  function nextQuestion() {
    setFuzzyText('');
    send('next', { total: questions.length });
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-md p-3 sm:p-6 border-t-8 border-indigo-600">
        
        <header className="flex flex-wrap gap-3 justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black text-indigo-900 tracking-tight">Teacher Control Panel</h1>
            <p className="text-slate-500 font-medium text-sm">{pack?.title ?? themes[day]} · Question {qIndex + 1}/{questions.length}</p>
          </div>
          <div className="flex gap-2">
           <button 
             onClick={() => window.open(projectorUrl(room), '_blank', 'noopener')}
             className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-bold text-sm tracking-wide hover:bg-indigo-200 transition"
           >
             Re-open Projector
           </button>
          </div>
        </header>

        <button className="text-indigo-800 font-bold mb-3" onClick={onSetup}>Back to setup</button>

        {hasWinner && (
          <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-lg border-2 border-green-500 text-center font-bold text-xl flex flex-wrap justify-center items-center gap-2">
            <CheckCircle className="w-8 h-8" />
            <span role="status">{result}</span>
            <button id="feud-replay" onClick={() => { setFuzzyText(''); send('replay'); }} className="rounded bg-green-700 text-white px-3 py-2">Play Again</button>
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

              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center mb-4">
                 <div className={`p-2 sm:p-4 rounded-xl min-w-0 text-center transition ${activeTalkerId === championId ? 'bg-indigo-600 ring-4 ring-indigo-300' : 'bg-slate-700 opacity-80'}`}>
                    <span className="block text-xs uppercase tracking-widest text-indigo-200 mb-2 font-bold">Champion Player</span>
                    <select 
                      value={championId} 
                      aria-label="Champion team" onChange={e => handleMatch('champion', Number(e.target.value))}
                      className="bg-white text-indigo-900 font-black text-lg w-full rounded-md p-2 shadow-sm border-2 border-indigo-400 cursor-pointer text-center mb-4"
                    >
                      {teams.map(t => <option key={t.id} value={t.id} disabled={t.id === challengerId}>Team {t.id}</option>)}
                    </select>

                    <div className="bg-indigo-900/50 rounded-lg p-3 flex flex-col gap-2 border border-indigo-500/30">
                       <span className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 uppercase tracking-wider"><UserCircle2 className="w-3 h-3"/> Active Student</span>
                       <span className="text-lg sm:text-2xl font-black text-white break-words">{teams.find(t=>t.id===championId)?.activeStudent}</span>
                       <button 
                         onClick={() => send('draw', { id: championId })}
                         className="mt-2 w-full bg-indigo-500 hover:bg-indigo-400 text-indigo-950 font-black py-2 px-2 rounded-md flex items-center justify-center gap-2 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all"
                       >
                         <Dices className="w-5 h-5"/> Next Student
                       </button>
                    </div>

                 </div>
                 
                 <div className="px-1 sm:px-4 font-black italic text-amber-400 text-2xl flex items-center gap-1">
                   <Swords className="w-5 h-5"/> VS
                 </div>

                 <div className={`p-2 sm:p-4 rounded-xl min-w-0 text-center transition ${activeTalkerId === challengerId ? 'bg-emerald-600 ring-4 ring-emerald-300' : 'bg-slate-700 opacity-80'}`}>
                    <span className="block text-xs uppercase tracking-widest text-emerald-200 mb-2 font-bold">Challenger Player</span>
                    <select 
                      value={challengerId} 
                      aria-label="Challenger team" onChange={e => handleMatch('challenger', Number(e.target.value))}
                      className="bg-white text-emerald-900 font-black text-lg w-full rounded-md p-2 shadow-sm border-2 border-emerald-400 cursor-pointer text-center mb-4"
                    >
                      {teams.map(t => <option key={t.id} value={t.id} disabled={t.id === championId}>Team {t.id}</option>)}
                    </select>

                    <div className="bg-emerald-900/50 rounded-lg p-3 flex flex-col gap-2 border border-emerald-500/30">
                       <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1 uppercase tracking-wider"><UserCircle2 className="w-3 h-3"/> Active Student</span>
                       <span className="text-lg sm:text-2xl font-black text-white break-words">{teams.find(t=>t.id===challengerId)?.activeStudent}</span>
                       <button 
                         onClick={() => send('draw', { id: challengerId })}
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
                  aria-label="Speaking team" onChange={e => send('talker', { id: Number(e.target.value) })}
                  className="bg-white text-slate-900 font-black border-2 border-amber-400 rounded-md outline-none px-3 py-1 cursor-pointer text-center"
                >
                  <option value={championId}>Team {championId}</option>
                  {championId !== challengerId && <option value={challengerId}>Team {challengerId}</option>}
                </select>
              </div>

              {/* Timer Controls */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-600">
                <span className={`font-mono text-3xl font-black ${timerRemaining <= 5 ? 'text-red-500' : 'text-white'}`}>
                  00:{timerRemaining.toString().padStart(2, '0')}
                </span>
                
                <button 
                  id="feud-timer" disabled={hasWinner || roundComplete} onClick={() => send('toggle')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition ${timerIsPlaying ? 'bg-amber-500 hover:bg-amber-600 text-amber-950' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  {timerIsPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                  {timerIsPlaying ? 'Pause Timer' : 'Play Timer'}
                </button>
                
                <button 
                  disabled={hasWinner} onClick={() => send('reset')}
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
                    id={`feud-answer-${idx}`} disabled={hasWinner || revealed.includes(idx)}
                    onClick={() => send('reveal', { index: idx, points: ans.points, total: currentQ.answers.length })}
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
                id="feud-strike" onClick={() => send('strike')}
                disabled={hasWinner || roundComplete}
                className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xl py-4 rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-8 h-8" />
                STRIKE (SKIP TURN)
              </button>
              
              <button 
                id="feud-next" onClick={nextQuestion} disabled={hasWinner}
                className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg active:scale-95 transition"
              >
                {qIndex + 1 < questions.length ? 'Next Question' : 'Final Scores'}
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
                      aria-label={`Team ${t.id} score`} min={0} max={99999} disabled={state.finished} value={t.score}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        send('score', { id: t.id, score: Math.max(0, Math.min(99999, val)) });
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
