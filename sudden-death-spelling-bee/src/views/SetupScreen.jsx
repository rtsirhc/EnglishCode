import React, { useState } from 'react';
import { Users, BookOpen, UserPlus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetupScreen = () => {
  const [grade, setGrade] = useState('A1');
  const [students, setStudents] = useState(['', '', '', '']); // start with 4 inputs
  const navigate = useNavigate();

  const handleStudentChange = (index, value) => {
    const newStudents = [...students];
    newStudents[index] = value;
    setStudents(newStudents);
  };

  const addStudentField = () => {
    setStudents([...students, '']);
  };

  const names = students.map(name => name.trim()).filter(Boolean);
  const duplicate = new Set(names.map(name => name.toLowerCase())).size !== names.length;
  const startGame = () => {
    navigate('/teacher', { state: { grade, students: names } });
  };

  return (
    <div className="screen-container">
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <div className="text-center mb-4">
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>Sudden Death Spelling Bee</h1>
          <p>Enter at least two nicknames. Each player gets one turn per cycle.</p>
        </div>

        <div className="mb-4">
          <h3 className="flex items-center gap-2 mb-2">
            <BookOpen size={24} color="var(--primary)" /> Select English Level
          </h3>
          <div className="flex gap-4">
            <button 
              className={`flex-1 ${grade === 'A1' ? 'btn-primary' : 'btn-accent'}`}
              onClick={() => setGrade('A1')}
            >
              A1 · Everyday words
            </button>
            <button 
              className={`flex-1 ${grade === 'A2' ? 'btn-primary' : 'btn-accent'}`}
              onClick={() => setGrade('A2')}
            >
              A2 · Expanding vocabulary
            </button>
          </div>
        </div>

        <div className="mb-4 mt-4">
          <h3 className="flex items-center gap-2 mb-2">
            <Users size={24} color="var(--primary)" /> Participants
          </h3>
          <div className="flex flex-col gap-2">
            {students.map((student, idx) => (
              <input 
                key={idx}
                type="text" 
                placeholder={`Student ${idx + 1} Name`}
                value={student}
                onChange={(e) => handleStudentChange(idx, e.target.value)}
              />
            ))}
            <button 
              onClick={addStudentField}
              style={{ background: 'transparent', border: '2px dashed var(--primary)', color: 'var(--primary)' }}
            >
              <UserPlus size={20} /> Add Student
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          {duplicate && <p role="alert">Each player needs a different nickname.</p>}
          <button disabled={duplicate || names.length < 2} className="btn-primary w-full" style={{ padding: '16px', fontSize: '1.2rem' }} onClick={startGame}>
            <Play size={24} /> Create Room & Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
