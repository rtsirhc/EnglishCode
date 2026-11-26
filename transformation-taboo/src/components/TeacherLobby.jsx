import { useState } from 'react';
import socket from '../socket';

const TENSES = [
  { id: 'simple_present',           label: 'Simple Present' },
  { id: 'simple_past',              label: 'Simple Past' },
  { id: 'present_continuous',       label: 'Present Continuous' },
  { id: 'past_continuous',          label: 'Past Continuous' },
  { id: 'present_perfect',          label: 'Present Perfect' },
  { id: 'past_perfect',             label: 'Past Perfect' },
  { id: 'future_simple',            label: 'Future Simple' },
  { id: 'present_perfect_continuous', label: 'Present Perfect Continuous' },
  { id: 'past_perfect_continuous',  label: 'Past Perfect Continuous' },
];

export default function TeacherLobby() {
  const [choice, setChoice] = useState(null); // null | 'game1'
  const [selectedTenses, setSelectedTenses] = useState([]);

  const toggleTense = (id) => {
    setSelectedTenses(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTenses(TENSES.map(t => t.id));
  const clearAll  = () => setSelectedTenses([]);

  const handleStartGame1 = () => {
    if (selectedTenses.length === 0) return;
    socket.emit('teacher_start_game1', { tenses: selectedTenses });
  };

  const handleStartGame2 = () => {
    socket.emit('teacher_start_game2');
  };

  return (
    <div className="flex items-start justify-center min-h-[70vh] p-6">
      <div className="w-full max-w-xl animate-fade-in">
        {socket.pack && <button className="btn-primary w-full p-4 mb-4 bg-violet-600 text-white" onClick={() => socket.emit('teacher_start_game1', { custom: true })}>Play sentence pack · {socket.pack.title} ({Math.min(socket.pack.items.length, 20)} cards)</button>}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎮</div>
          <h2 className="text-3xl font-black text-slate-800">Choose a Game</h2>
          <p className="text-slate-500 mt-1">Select which game to start for your class</p>
        </div>

        {/* Game choice cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setChoice(choice === 'game1' ? null : 'game1')}
            className={`rounded-3xl p-6 text-left border-2 transition-all duration-200 active:scale-95 ${
              choice === 'game1'
                ? 'border-sky-400 bg-sky-50 shadow-md shadow-sky-100'
                : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50'
            }`}
          >
            <div className="text-4xl mb-3">⚡</div>
            <div className="font-black text-slate-800 text-lg leading-tight">Transformation</div>
            <div className="font-black text-slate-800 text-lg leading-tight mb-2">Drill</div>
            <div className="text-slate-500 text-xs">20 questions · oral grammar</div>
            {choice === 'game1' && (
              <div className="mt-3 inline-block bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Selected ✓
              </div>
            )}
          </button>

          <button
            onClick={handleStartGame2}
            className="rounded-3xl p-6 text-left border-2 border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 active:scale-95"
          >
            <div className="text-4xl mb-3">🃏</div>
            <div className="font-black text-slate-800 text-lg leading-tight">Taboo /</div>
            <div className="font-black text-slate-800 text-lg leading-tight mb-2">Circumlocution</div>
            <div className="text-slate-500 text-xs">15 rounds · vocabulary</div>
            <div className="mt-3 inline-block bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Start Now →
            </div>
          </button>
        </div>

        {/* Tense selection panel */}
        {choice === 'game1' && (
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-800 text-lg">Select Tenses</h3>
                <p className="text-slate-500 text-sm">
                  20 questions split equally across {selectedTenses.length || '…'} tense{selectedTenses.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 rounded-full transition-colors"
                >
                  All
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-6">
              {TENSES.map(tense => {
                const checked = selectedTenses.includes(tense.id);
                return (
                  <label
                    key={tense.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all duration-150 select-none ${
                      checked
                        ? 'border-sky-400 bg-sky-50'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      checked ? 'bg-sky-500 border-sky-500' : 'border-slate-300'
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTense(tense.id)}
                      className="sr-only"
                    />
                    <span className={`font-semibold text-sm ${checked ? 'text-sky-800' : 'text-slate-700'}`}>
                      {tense.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              id="teacher-start-game1-btn"
              onClick={handleStartGame1}
              disabled={selectedTenses.length === 0}
              className={`btn-primary w-full py-5 text-xl rounded-2xl gap-2 transition-all ${
                selectedTenses.length > 0
                  ? 'bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 shadow-lg shadow-sky-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>⚡</span>
              <span>
                {selectedTenses.length > 0
                  ? `Start Game 1 — ${selectedTenses.length} tense${selectedTenses.length !== 1 ? 's' : ''}`
                  : 'Select at least one tense'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
