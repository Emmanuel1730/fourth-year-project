import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Resources from "./components/Library/Resources";
import Upload from "./components/Library/Upload";
import Quizzes from "./components/Library/Quizzes";
import Login from "./components/Login/Login";
import SettingsPage from "./components/Settings";
import RequestsPage from "./components/Request";
import Schools from "./components/User/Schools";
import Students from "./components/User/Students";
import Teachers from "./components/User/Teachers";
import DashboardOverview from "./components/dashboard";

// 🔐 Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex bg-[#0d1117] text-[#e6edf3]">
              <Sidebar />

              <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
                <Header />

                <div className="p-6">
                  <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/quizzes" element={<Quizzes />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/schools" element={<Schools />} />
                    <Route path="/requests" element={<RequestsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </div>

              </div>
            </div>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;