import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  History,
  Globe,
  Users,
  LogOut,
} from "lucide-react";

/**
 * DashboardSidebar (non-collapsible)
 *
 * - Always shows full sidebar on md+ screens (no collapse behavior).
 * - Professional spacing, clear active styles, footer with user info and sign out.
 * - Accessible: aria labels, focus styles, semantic NavLink usage.
 *
 * Usage:
 * - Place <DashboardSidebar /> near the root of the app layout.
 * - On small screens (<md) the sidebar is hidden (same behavior as original).
 */

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/createquotation", label: "Create Quotation", Icon: FilePlus },
  { to: "/quotationhistory", label: "Quotation History", Icon: History },
  { to: "/browsetemplate", label: "Browse Template", Icon: Globe },
  { to: "/profile", label: "Profile", Icon: Users },
];

export default function DashboardSidebar({ onSignOut }) {
  const navLinkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      isActive
        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
    ].join(" ");

  return (
    <aside
      className="
        fixed z-50 top-0 left-0 h-full w-64
        bg-white dark:bg-slate-900 border-r
        p-6 hidden md:flex flex-col
      "
      aria-label="Main sidebar"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        
        <div>
          <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
            EngiQuote
          </div>
          <div className="text-xs text-slate-500">Quotations & Clients</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1" aria-label="Primary">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink to={to} className={navLinkClass} title={label}>
                <div className="flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-300">
                  <Icon size={18} />
                </div>
                <span className="truncate">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-200">
              J
            </div>
            <div>
              <div className="text-sm font-semibold">Johnson</div>
              <div className="text-xs text-slate-500">Account</div>
            </div>
          </div>

          <button
            onClick={() =>
              typeof onSignOut === "function"
                ? onSignOut()
                : localStorage.removeItem("role")
            }
            className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
