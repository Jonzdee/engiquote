import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuickActions from "@/components/QuickActions";
import StatsCards from "@/components/StatsCards";
import RecentQuotations from "@/components/RecentQuotations";
import VerificationBanner from "@/components/VerificationBanner";

export default function Dashboard({ children, quotations = [] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isGuest = role === "guest";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Manage and generate engineering quotations
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6 overflow-auto space-y-6 pb-32">
          {/* VERIFICATION BANNER (soft enforcement) */}
          <VerificationBanner />

          {/* GUEST UPGRADE BANNER */}
          {isGuest && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg flex justify-between items-center">
              <p className="text-sm font-medium">
                Create an account to save & export quotations
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
              >
                Create Account
              </button>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <QuickActions isGuest={isGuest} />

          {/* STATS */}
          <StatsCards
            stats={[
              { label: "Total Quotations", value: quotations.length },
              { label: "Drafts", value: 3 },
              { label: "Pending", value: 2 },
            ]}
          />

          {/* RECENT QUOTATIONS */}
          {quotations.length > 0 ? (
            <RecentQuotations quotations={quotations} />
          ) : (
            <div className="bg-white border rounded-lg p-8 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                No quotations yet
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Start by creating your first engineering quotation
              </p>
              <button
                onClick={() => navigate("/createquotation")}
                className="bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800"
              >
                Create Quotation
              </button>
            </div>
          )}

          {/* SLOT FOR CHILD COMPONENTS */}
          {children}
        </main>
      </div>
    </div>
  );
}
