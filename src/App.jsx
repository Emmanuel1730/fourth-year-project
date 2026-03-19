import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Resources from './components/Library/Resources';
import Upload from './components/Library/Upload';
import Quizzes from './components/Library/Quizzes';

function App() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <Header />
        <main className="p-7">
          <Routes>
            <Route path="/" element={<Navigate to="/resources" replace />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/quizzes" element={<Quizzes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;