import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentView from './pages/StudentView';
import TeacherView from './pages/TeacherView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student" element={<StudentView />} />
        <Route path="/teacher" element={<TeacherView />} />
      </Routes>
    </BrowserRouter>
  );
}
