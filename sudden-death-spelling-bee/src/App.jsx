import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import SetupScreen from './views/SetupScreen';
import TeacherPanel from './views/TeacherPanel';
import StudentDisplay from './views/StudentDisplay';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SetupScreen />} />
        <Route path="/teacher" element={<TeacherPanel />} />
        <Route path="/student" element={<StudentDisplay />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
