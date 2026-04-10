import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import logo from "../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const Sidebar = () => {
  const navigate = useNavigate();
  const [resourceCount, setResourceCount] = useState(null);
  const [pendingCount, setPendingCount]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Fetch total resources count
    fetch(`${API_BASE}/resources`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (data?.total !== undefined) setResourceCount(data.total);
        else if (Array.isArray(data)) setResourceCount(data.length);
      })
      .catch(() => setResourceCount(null));

    // Fetch pending requests count
    fetch(`${API_BASE}/request`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pending = data.filter((r) => r.status === "PENDING").length;
          setPendingCount(pending);
        }
      })
      .catch(() => setPendingCount(null));
  }, []);

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        await api.post("/auth/logout", { userId: user.id });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const menuItem = (to, icon, label, badge = null, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition border
        ${
          isActive
            ? "bg-[rgba(46,160,67,0.12)] text-[#2ea043] border-[rgba(46,160,67,0.2)] font-medium"
            : "text-[#8b949e] border-transparent hover:bg-[#1c2330] hover:text-[#e6edf3]"
        }`
      }
    >
      <span className="w-5 text-center">{icon}</span>
      {label}
      {badge !== null && badge !== undefined && (
        <span
          className={`ml-auto text-[10px] px-2 py-[2px] rounded-full font-semibold text-white ${
            badge.color === "green"
              ? "bg-[#2ea043]"
              : badge.color === "blue"
              ? "bg-[#388bfd]"
              : "bg-[#da3633]"
          }`}
        >
          {badge.value}
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="w-[240px] h-[100vh] fixed left-0 top-0 bg-[#161b22] border-r border-[#21262d] flex flex-col">

      {/* LOGO */}
      <div className="p-5 border-b border-[#21262d]">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-9 h-9 object-contain rounded-md" />
          <div>
            <div className="text-[#e6edf3] font-serif text-lg">EduLib</div>
            <div className="text-[10px] text-[#6e7681] uppercase tracking-wider">
              Malawi · Admin
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-2">

        {menuItem("/", "🏠", "Dashboard", null, true)}

        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">Library</div>
        {menuItem(
          "/resources",
          "📄",
          "Resources",
          resourceCount !== null ? { value: resourceCount, color: "blue" } : null
        )}
        {menuItem("/upload", "⬆️", "Upload Materials")}
        {menuItem("/quizzes", "❓", "Quizzes & Exams")}

        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">Users</div>
        {menuItem("/students", "🎓", "Students")}
        {menuItem("/teachers", "👩‍🏫", "Teachers")}
        {menuItem("/schools", "🏫", "Schools")}

        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">System</div>
        {menuItem(
          "/requests",
          "🔔",
          "Requests",
          pendingCount !== null ? { value: pendingCount, color: "red" } : null
        )}
        {menuItem("/settings", "⚙️", "Settings")}
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t border-[#21262d]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-[#da3633] hover:bg-[#f85149] text-white py-2 rounded-md text-sm font-medium transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;