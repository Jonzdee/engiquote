import React from 'react'
import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  FilePlus,
  History,
  GlobeLock,
  Users,
} from "lucide-react";

function DashboardSidebar() {
  return (
    <aside
      className={`
              fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 
              border-r p-4 hidden md:block
            `}
    >
      <h1 className="font-bold text-xl mb-6">EngiQuote</h1>

      <nav className="space-y-3">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/createquotation" className="flex items-center gap-3">
          <FilePlus size={18} /> Create Quotation
        </NavLink>

        <NavLink to="/quotationhistory" className="flex items-center gap-3">
          <History size={18} /> Quotation History
        </NavLink>

        <NavLink to="/browsetemplate" className="flex items-center gap-3">
          <GlobeLock size={18} /> Browse Template
        </NavLink>

        <NavLink to="/profile" className="flex items-center gap-3">
          <Users size={18} /> Profile
        </NavLink>
      </nav>
    </aside>
  );
}

export default DashboardSidebar