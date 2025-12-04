// src/components/Dashboard.jsx
import React, { useState } from "react";
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
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64">
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

    </div>
  );
}
