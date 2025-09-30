import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium block ${
        active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
};

const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden md:block w-64 bg-white border-r min-h-screen sticky top-0">
          <div className="p-4 border-b">
            <div className="text-lg font-bold text-blue-700">DaLean</div>
            <div className="text-xs text-gray-500">Smart Data Cleaning</div>
          </div>
          <nav className="p-3 flex flex-col gap-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/upload">Upload</NavLink>
            <NavLink to="/preview">Preview</NavLink>
            <NavLink to="/clean">Clean</NavLink>
            <NavLink to="/report">Report</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
