import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
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
import { refreshAccessToken } from "./utils/AuthUtils";
import AdminsPage from "./components/Admin/Admin";

// ─── helpers ───────────────────────────────────────────────────────────────────
const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

// ─── Protected route — redirects to login if no token ─────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

// ─── Sets up proactive token refresh, logs out on failure ─────────────────────
function AuthProvider({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    let timer = null;

    const scheduleRefresh = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const expiry = getTokenExpiry(token);
      if (!expiry) return;

      const delay = expiry - Date.now() - 60_000;

      if (delay <= 0) {
        handleRefresh();
        return;
      }

      timer = setTimeout(handleRefresh, delay);
    };

    const handleRefresh = async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        scheduleRefresh();
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    scheduleRefresh();

    return () => { if (timer) clearTimeout(timer); };
  }, [navigate]);

  return children;
}

// ─── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className={`flex ${isDarkMode ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-slate-100 text-slate-900'}`}>
                <Sidebar isDarkMode={isDarkMode} />
                <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
                  <Header isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />
                  <div className="p-6">
                    <Routes>
                     <Route path="/"          element={<DashboardOverview isDarkMode={isDarkMode} />} />
                      <Route path="/resources" element={<Resources isDarkMode={isDarkMode} />} />
                      <Route path="/upload"    element={<Upload isDarkMode={isDarkMode} />} />
                      <Route path="/quizzes"   element={<Quizzes isDarkMode={isDarkMode} />} />
                      <Route path="/students"  element={<Students isDarkMode={isDarkMode} />} />
                      <Route path="/teachers"  element={<Teachers isDarkMode={isDarkMode} />} />
                      <Route path="/schools"   element={<Schools isDarkMode={isDarkMode} />} />
                      <Route path="/requests"  element={<RequestsPage isDarkMode={isDarkMode} />} />
                      <Route path="/settings"  element={<SettingsPage isDarkMode={isDarkMode} />} />
                      <Route path="/admins"    element={<AdminsPage isDarkMode={isDarkMode} />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;