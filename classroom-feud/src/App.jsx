import { useState, useEffect } from 'react';
import TeacherScreen from './components/TeacherScreen';
import ProjectorScreen from './components/ProjectorScreen';

function App() {
  const [role, setRole] = useState("setup");
  const [teamCount, setTeamCount] = useState(2);
  const [teamRosters, setTeamRosters] = useState(["Tom, Mary, Alice", "John, Sarah, Mike"]);
  const [day, setDay] = useState(1);

  // Read URL params to check if this is the projector window
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'projector') {
      setRole('projector');
    }
  }, []);

  const startGame = () => {
    // Open projector in new window
    window.open(window.location.origin + window.location.pathname + '?role=projector', '_blank');
    setRole('teacher');
  };

  if (role === 'projector') return <ProjectorScreen />;
  if (role === 'teacher') {
    // Parse strings into arrays of students
    const parsedRosters = teamRosters.map(r => r.split(',').map(s => s.trim()).filter(s => s.length > 0));
    return <TeacherScreen initialTeamRosters={parsedRosters} day={day} />;
  }

  const handleTeamCountChange = (e) => {
    const count = parseInt(e.target.value);
    setTeamCount(count);
    setTeamRosters(prev => {
      const newRosters = [...prev];
      while(newRosters.length < count) {
        newRosters.push(`Student A, Student B`);
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Number of Teams (2-5)</label>
              <select 
                value={teamCount} 
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
              <label className="block text-sm font-bold text-slate-700">Team Rosters (Comma separated students)</label>
              {teamRosters.map((roster, i) => (
                <div key={i}>
                  <label className="block text-xs font-bold text-slate-500 mb-1">TEAM {i + 1}</label>
                  <textarea 
                    rows={2}
                    value={roster}
                    onChange={(e) => {
                      const newRosters = [...teamRosters];
                      newRosters[i] = e.target.value;
                      setTeamRosters(newRosters);
                    }}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 font-bold focus:border-indigo-500 outline-none transition resize-y"
                    placeholder={`e.g. Tom, Mary, John...`}
                  ></textarea>
                </div>
              ))}
            </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Theme</label>
            <select 
              value={day} 
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full border-2 border-slate-200 rounded-lg p-3 text-lg font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value={1}>Day 1: Sports & General A</option>
              <option value={2}>Day 2: Cowboys & General B</option>
              <option value={3}>Day 3: Heroes & General C</option>
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
