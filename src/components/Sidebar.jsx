import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import ProfilePanel from "./Profile";
import api from "../api/api";

const Sidebar = ({ isDarkMode = true }) => {
  const [resourceCount, setResourceCount] = useState(null);
  const [pendingCount, setPendingCount]   = useState(null);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [me, setMe]                       = useState(null);

  const t = {
    bg:          isDarkMode ? '#161b22' : '#ffffff',
    border:      isDarkMode ? '#21262d' : '#e2e8f0',
    text:        isDarkMode ? '#e6edf3' : '#0f172a',
    muted:       isDarkMode ? '#8b949e' : '#64748b',
    dim:         isDarkMode ? '#6e7681' : '#94a3b8',
    logoSub:     isDarkMode ? '#6e7681' : '#94a3b8',
    activeLink:  isDarkMode ? 'rgba(46,160,67,0.12)' : 'rgba(46,160,67,0.08)',
    activeBorder:isDarkMode ? 'rgba(46,160,67,0.2)'  : 'rgba(46,160,67,0.25)',
    hoverBg:     isDarkMode ? '#1c2330' : '#f1f5f9',
    profileBtn:  isDarkMode ? '#21262d' : '#e2e8f0',
  }

  useEffect(() => {
    api.get("/resources")
      .then(({ data }) => {
        if (data?.total !== undefined) setResourceCount(data.total);
        else if (Array.isArray(data))  setResourceCount(data.length);
      })
      .catch(() => setResourceCount(null));

    api.get("/request")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setPendingCount(list.filter((r) => r.status?.toLowerCase() === "pending").length);
      })
      .catch(() => setPendingCount(null));

    api.get("/profiles/me")
      .then(({ data }) => setMe(data))
      .catch(() => {});
  }, []);

  const menuItem = (to, icon, label, badge = null, end = false) => (
    <NavLink
      to={to}
      end={end}
    >
      {({ isActive }) => (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition cursor-pointer"
          style={{
            backgroundColor: isActive ? t.activeLink  : 'transparent',
            border:          isActive ? `1px solid ${t.activeBorder}` : '1px solid transparent',
            color:           isActive ? '#2ea043' : t.muted,
            fontWeight:      isActive ? 600 : 400,
          }}
          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = t.hoverBg; e.currentTarget.style.color = t.text; } }}
          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = t.muted; } }}
        >
          <span className="w-5 text-center">{icon}</span>
          {label}
          {badge !== null && badge !== undefined && (
            <span
              className="ml-auto text-[10px] px-2 py-[2px] rounded-full font-semibold text-white"
              style={{
                backgroundColor: badge.color === 'green' ? '#2ea043' : badge.color === 'blue' ? '#388bfd' : '#da3633'
              }}
            >
              {badge.value}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );

  const initials = me
    ? `${me.firstName?.[0] ?? ''}${me.lastName?.[0] ?? ''}`.toUpperCase()
    : 'A';

  return (
    <>
      <div
        className="w-[240px] h-[100vh] fixed left-0 top-0 flex flex-col"
        style={{ backgroundColor: t.bg, borderRight: `1px solid ${t.border}` }}
      >
        {/* LOGO */}
        <div className="p-5" style={{ borderBottom: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-9 h-9 object-contain rounded-md" />
            <div>
              <div className="font-serif text-lg" style={{ color: t.text }}>EduLib</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: t.logoSub }}>
                Malawi · Admin
              </div>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-2">
          {menuItem("/", "🏠", "Dashboard", null, true)}

          <div className="text-[10px] uppercase px-2 mt-4" style={{ color: t.dim }}>Library</div>
          {menuItem("/resources", "📄", "Resources", resourceCount !== null ? { value: resourceCount, color: "blue" } : null)}
          {menuItem("/upload", "⬆️", "Upload Materials")}
          {menuItem("/quizzes", "❓", "Quizzes & Exams")}

          <div className="text-[10px] uppercase px-2 mt-4" style={{ color: t.dim }}>Users</div>
          {menuItem("/students", "🎓", "Students")}
          {menuItem("/teachers", "👩‍🏫", "Teachers")}
          {menuItem("/schools", "🏫", "Schools")}
          {menuItem("/admins", "🛡️", "Admins")}

          <div className="text-[10px] uppercase px-2 mt-4" style={{ color: t.dim }}>System</div>
          {menuItem("/requests", "🔔", "Requests", pendingCount !== null ? { value: pendingCount, color: "red" } : null)}
          {menuItem("/settings", "⚙️", "Settings")}
        </div>

        {/* PROFILE */}
        <div className="p-4" style={{ borderTop: `1px solid ${t.border}` }}>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition"
            style={{ border: `1px solid ${t.border}`, color: t.muted, backgroundColor: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.hoverBg; e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = t.dim; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = t.border; }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #388bfd, #2ea043)' }}
            >
              {initials}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[13px] font-medium truncate w-full">
                {me ? `${me.firstName} ${me.lastName}` : 'Admin'}
              </span>
              <span className="text-[10px]" style={{ color: t.dim }}>View profile</span>
            </div>
            <span className="ml-auto text-xs" style={{ color: t.dim }}>→</span>
          </button>
        </div>
      </div>

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default Sidebar;