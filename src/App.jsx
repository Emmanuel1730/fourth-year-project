import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Resources from "./components/Library/Resources";
import Upload from "./components/Library/Upload";
import Quizzes from "./components/Library/Quizzes";
import Login from "./components/Login/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div className="flex bg-[#0d1117] text-[#e6edf3]">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Header />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<h1>Dashboard</h1>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/students" element={<h1>Students</h1>} />
            <Route path="/teachers" element={<h1>Teachers</h1>} />
            <Route path="/schools" element={<h1>Schools</h1>} />
            <Route path="/reports" element={<h1>Reports</h1>} />
            <Route path="/requests" element={<h1>Requests</h1>} />
            <Route path="/settings" element={<h1>Settings</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;