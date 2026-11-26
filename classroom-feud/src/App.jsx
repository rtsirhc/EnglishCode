import { useState } from 'react';
import TeacherScreen from './components/TeacherScreen';
import ProjectorScreen from './components/ProjectorScreen';
import { projectorUrl } from './game';
import { validatePack } from '../../gallery/shared/content.js';
import { read } from '../../gallery/shared/storage.js';

function App() {
  const [room, setRoom] = useState(null);
  const [teamCount, setTeamCount] = useState(2);
  const [teamRosters, setTeamRosters] = useState(['', '']);
  const [day, setDay] = useState(1);
  const [pack] = useState(() => {
    try { return validatePack(read('pack:classroom-feud', null), 'survey'); }
    catch { return null; }
  });

  const params = new URLSearchParams(location.search);
  if (params.get('role') === 'projector') return <ProjectorScreen room={params.get('room')} />;
  if (room) {
    const parsed = teamRosters.map((roster, index) => {
      const nicknames = [...new Set(roster.split(',').map(name => name.trim().slice(0, 32)).filter(Boolean))];
      for (let i = nicknames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nicknames[i], nicknames[j]] = [nicknames[j], nicknames[i]];
      }
      return nicknames.length ? nicknames : [`Player ${index + 1}`];
    });
    return <TeacherScreen room={room} initialTeamRosters={parsed} day={day} pack={day === 0 ? pack : null}
      onSetup={() => setRoom(null)} />;
  }
  function startGame() {
    const id = crypto.randomUUID();
    window.open(projectorUrl(id), '_blank', 'noopener');
    setRoom(id);
  }

  const handleTeamCountChange = (e) => {
    const count = parseInt(e.target.value);
    setTeamCount(count);
    setTeamRosters(prev => {
      const newRosters = [...prev];
      while(newRosters.length < count) {
        newRosters.push('');
      }
      return newRosters.slice(0, count);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-black text-center text-indigo-900 mb-8 tracking-tight">
          CLASSROOM FEUD
        </h1>

        <div className="space-y-6">
            <div className="mb-6">
              <label htmlFor="team-count" className="block text-sm font-bold text-slate-700 mb-2">Number of Teams (2-5)</label>
              <select 
                id="team-count" value={teamCount}
                onChange={handleTeamCountChange}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 font-bold text-slate-800 transition"
              >
                <option value={2}>2 Teams</option>
                <option value={3}>3 Teams</option>
                <option value={4}>4 Teams</option>
                <option value={5}>5 Teams</option>
              </select>
            </div>

            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <label className="block text-sm font-bold text-slate-700">Team nicknames (optional, separated by commas)</label>
              {teamRosters.map((roster, i) => (
                <div key={i}>
                  <label htmlFor={`roster-${i}`} className="block text-xs font-bold text-slate-500 mb-1">Team {i + 1} nicknames</label>
                  <textarea 
                    rows={2} id={`roster-${i}`} maxLength={480}
                    value={roster}
                    onChange={(e) => {
                      const newRosters = [...teamRosters];
                      newRosters[i] = e.target.value;
                      setTeamRosters(newRosters);
                    }}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 font-bold focus:border-indigo-500 outline-none transition resize-y"
                    placeholder="Player A, Player B"
                  ></textarea>
                </div>
              ))}
            </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-bold text-slate-700 mb-2">Select Theme</label>
            <select 
              id="theme" value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full border-2 border-slate-200 rounded-lg p-3 text-lg font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              {pack && <option value={0}>{pack.title}</option>}
              <option value={1}>Sports & Everyday Topics</option>
              <option value={2}>Cowboys & Animals</option>
              <option value={3}>Heroes & Everyday Topics</option>
            </select>
          </div>

          <button 
            onClick={startGame}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform transition-all active:scale-95 text-lg"
          >
            Start Game & Open Projector
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
