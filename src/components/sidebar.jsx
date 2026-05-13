import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import ProfilePanel from "./Profile";
import api from "../api/api";

<<<<<<< HEAD
const Sidebar = () => {
  const [resourceCount, setResourceCount] = useState(null);
  const [pendingCount, setPendingCount]   = useState(null);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [me, setMe]                       = useState(null);
=======
const Sidebar = ({ isDarkMode }) => {
  const bg = isDarkMode ? 'bg-[#161b22]' : 'bg-white';
  const border = isDarkMode ? 'border-[#21262d]' : 'border-slate-200';
  const text = isDarkMode ? 'text-[#e6edf3]' : 'text-slate-900';
  const muted = isDarkMode ? 'text-[#6e7681]' : 'text-slate-500';
  const defaultText = isDarkMode ? 'text-[#8b949e]' : 'text-slate-600';
  const hoverBase = isDarkMode ? 'hover:bg-[#1c2330] hover:text-[#e6edf3]' : 'hover:bg-slate-100 hover:text-slate-900';
  const activeBase = isDarkMode
    ? 'bg-[rgba(46,160,67,0.12)] text-[#2ea043] border-[rgba(46,160,67,0.2)] font-medium'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium';

  const menuItem = (to, icon, label, badge = null, end = false) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition border ${isActive ? activeBase : `${defaultText} border-transparent ${hoverBase}`}`
    }
  >
    <span className="w-5 text-center">{icon}</span>
    {label}
>>>>>>> 051d1e739beb516c1822988bad638845b494c2fb

  useEffect(() => {
    // Resources count
    api.get("/resources")
      .then(({ data }) => {
        if (data?.total !== undefined) setResourceCount(data.total);
        else if (Array.isArray(data))  setResourceCount(data.length);
      })
      .catch(() => setResourceCount(null));

    // Pending requests count
    api.get("/request")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setPendingCount(list.filter((r) => r.status?.toLowerCase() === "pending").length);
      })
      .catch(() => setPendingCount(null));

    // Own profile (for avatar initials)
    api.get("/profiles/me")
      .then(({ data }) => setMe(data))
      .catch(() => {});
  }, []);

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

  const initials = me
    ? `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase()
    : "A";

  return (
<<<<<<< HEAD
    <>
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
=======
    <div className={`w-[240px] h-[100vh] fixed left-0 top-0 ${bg} border-r ${border} flex flex-col`}>
      
      {/* LOGO */}
      <div className={`p-5 border-b ${border}`}>
        <div className="flex items-center gap-3">
          <img
  src={logo}
  alt="Logo"
  className="w-9 h-9 object-contain rounded-md"
/>
          <div>
            <div className={`font-serif text-lg ${text}`}>EduLib</div>
            <div className={`text-[10px] uppercase tracking-wider ${muted}`}>
              Malawi · Admin
>>>>>>> 051d1e739beb516c1822988bad638845b494c2fb
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-2">
          {menuItem("/", "🏠", "Dashboard", null, true)}

          <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">Library</div>
          {menuItem(
            "/resources", "📄", "Resources",
            resourceCount !== null ? { value: resourceCount, color: "blue" } : null
          )}
          {menuItem("/upload", "⬆️", "Upload Materials")}
          {menuItem("/quizzes", "❓", "Quizzes & Exams")}

          <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">Users</div>
          {menuItem("/students", "🎓", "Students")}
          {menuItem("/teachers", "👩‍🏫", "Teachers")}
          {menuItem("/schools", "🏫", "Schools")}
          {menuItem("/admins", "🛡️", "Admins")}

          <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">System</div>
          {menuItem(
            "/requests", "🔔", "Requests",
            pendingCount !== null ? { value: pendingCount, color: "red" } : null
          )}
          {menuItem("/settings", "⚙️", "Settings")}
        </div>

        {/* PROFILE */}
        <div className="p-4 border-t border-[#21262d]">
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm border border-[#21262d] hover:bg-[#1c2330] hover:border-[#6e7681] transition text-[#8b949e] hover:text-[#e6edf3]"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #388bfd, #2ea043)' }}
            >
              {initials}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[13px] font-medium truncate w-full">
                {me ? `${me.firstName} ${me.lastName}` : "Admin"}
              </span>
              <span className="text-[10px] text-[#6e7681]">View profile</span>
            </div>
            <span className="ml-auto text-[#6e7681] text-xs">→</span>
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Profile slide-in panel */}
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
=======
      
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-2">
        
        <div className={`text-[10px] uppercase px-2 mt-2 ${muted}`}>
         
        </div>
        {menuItem("/", "🏠", "Dashboard")}

        <div className={`text-[10px] uppercase px-2 mt-4 ${muted}`}>
          Library
        </div>
        {menuItem("/resources", "📄", "Resources", { value: 142, color: "blue" })}
        {menuItem("/upload", "⬆️", "Upload Materials")}
        {menuItem("/quizzes", "❓", "Quizzes & Exams", {
          value: 28,
          color: "green",
        })}

        <div className={`text-[10px] uppercase px-2 mt-4 ${muted}`}>
          Users
        </div>
        {menuItem("/students", "🎓", "Students")}
        {menuItem("/teachers", "👩‍🏫", "Teachers")}
        {menuItem("/schools", "🏫", "Schools")}

        <div className={`text-[10px] uppercase px-2 mt-4 ${muted}`}>
          System
        </div>
         
        {menuItem("/requests", "🔔", "Requests", { value: 5 })}
        {menuItem("/settings", "⚙️", "Settings")}
      </div>
    </div>
>>>>>>> 051d1e739beb516c1822988bad638845b494c2fb
  );
};

export default Sidebar;