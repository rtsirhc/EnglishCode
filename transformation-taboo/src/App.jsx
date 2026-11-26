import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentView from './pages/StudentView';
import TeacherView from './pages/TeacherView';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student" element={<StudentView />} />
        <Route path="/teacher" element={<TeacherView />} />
      </Routes>
    </HashRouter>
  );
}
