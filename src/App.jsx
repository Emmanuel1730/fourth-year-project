 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Header from "./components/header";

function App() {
  return (
    <Router>
      <div className="flex bg-[#0d1117] text-[#e6edf3]">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
          
          {/* Header */}
          <Header />

          {/* Pages */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<h1>Dashboard</h1>} />
              <Route path="/resources" element={<h1>Resources</h1>} />
              <Route path="/upload" element={<h1>Upload Materials</h1>} />
              <Route path="/quizzes" element={<h1>Quizzes</h1>} />
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
    </Router>
  );
}

export default App;