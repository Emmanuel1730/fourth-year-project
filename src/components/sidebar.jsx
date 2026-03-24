 import { NavLink } from "react-router-dom";
 import logo from "../assets/logo.png";

const Sidebar = () => {
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

    {badge && (
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
          <img
  src={logo}
  alt="Logo"
  className="w-9 h-9 object-contain rounded-md"
/>
          <div>
            <div className="text-[#e6edf3] font-serif text-lg">EduLib</div>
            <div className="text-[10px] text-[#6e7681] uppercase tracking-wider">
              Malawi · Admin
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-2">
        
        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-2">
         
        </div>
        {menuItem("/", "🏠", "Dashboard")}

        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">
          Library
        </div>
        {menuItem("/resources", "📄", "Resources", { value: 142, color: "blue" })}
        {menuItem("/upload", "⬆️", "Upload Materials")}
        {menuItem("/quizzes", "❓", "Quizzes & Exams", {
          value: 28,
          color: "green",
        })}

        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">
          Users
        </div>
        {menuItem("/students", "🎓", "Students")}
        {menuItem("/teachers", "👩‍🏫", "Teachers")}
        {menuItem("/schools", "🏫", "Schools")}

        <div className="text-[10px] text-[#6e7681] uppercase px-2 mt-4">
          System
        </div>
         
        {menuItem("/requests", "🔔", "Requests", { value: 5 })}
        {menuItem("/settings", "⚙️", "Settings")}
      </div>
    </div>
  );
};

export default Sidebar;