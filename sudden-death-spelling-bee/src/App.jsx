import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SetupScreen from './views/SetupScreen';
import TeacherPanel from './views/TeacherPanel';
import StudentDisplay from './views/StudentDisplay';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SetupScreen />} />
        <Route path="/teacher" element={<TeacherPanel />} />
        <Route path="/student" element={<StudentDisplay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
