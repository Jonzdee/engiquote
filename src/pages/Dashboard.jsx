// src/components/Dashboard.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  Settings,
} from "lucide-react";

import MobileNav from "../components/MobileNav";
import DashboardHeader from "@/components/DashboardHeader";
import QuickActions from "@/components/QuickActions";
import StatsCards from "@/components/StatsCards";
import RecentQuotations from "@/components/RecentQuotations";

export default function Dashboard({
  children,
  quotations = [],
}) {
  const [open, setOpen] = useState(false); // Sidebar only for desktop/tablet if you want

  return (
    <div className="flex h-screen">
      {/* OPTIONAL SIDEBAR OVERLAY (tablet only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR (desktop only) */}
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

          <NavLink to="/clients" className="flex items-center gap-3">
            <Users size={18} /> Clients
          </NavLink>

          <NavLink to="/settings" className="flex items-center gap-3">
            <Settings size={18} /> Settings
          </NavLink>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* HEADER */}
        <DashboardHeader />

        {/* CONTENT AREA */}
        <main className="p-6 overflow-auto pb-32">
          <QuickActions />
          <StatsCards
            stats={[
              { label: "Total Quotations", value: 15 },
              { label: "Drafts", value: 3 },
              { label: "Pending", value: 2 },
            ]}
          />
          <RecentQuotations quotations={quotations.length ? quotations : []} />
          {children}
        </main>
      </div>

      {/* MOBILE NAVIGATION */}
      <MobileNav />
    </div>
  );
}
