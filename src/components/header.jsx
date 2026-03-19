 import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
const Header = () => {
  return (
    <header className="flex items-center gap-4 px-7 h-[60px] border-b border-[#21262d] bg-[#161b22]">
 
        <div className="flex items-center gap-3">

        <h1 className="text-[20px] font-semibold text-[#e6edf3]">
          Dashboard
          <span className="text-[13px] text-[#6e7681] ml-2 font-normal">
            Overview
          </span>
        </h1>
      </div>

      {/* Search */}
 <div className="ml-auto flex items-center gap-4">
        <input
          type="text"
          placeholder="Search resources..."
          className="bg-transparent outline-none text-sm text-[#e6edf3] w-full placeholder-[#6e7681]"
        />
      </div>

      {/* Add Resource */}
       <Link
  to="/upload"
  className="px-4 py-1 bg-[#2ea043] text-white rounded-md hover:opacity-90 transition"
>
  + Add Resource
</Link>

      {/* Notification */}
      <button className="w-[36px] h-[36px] bg-[#1c2330] border border-[#21262d] rounded-md">
        🔔
      </button>

    </header>
  );
};

export default Header;