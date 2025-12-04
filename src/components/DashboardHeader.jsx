"use client";

import { Bell, Search, ChevronDown } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="w-full sticky top-0 z-40 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
       

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Engineer Dashboard
            </h2>
            <p className="text-sm text-gray-500 -mt-1">
              Create quotations • Manage clients
            </p>
          </div>
        </div>

        {/* RIGHT — Search, bell, profile */}
        <div className="flex items-center gap-4">
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg w-64">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search clients, quotations..."
              className="bg-transparent text-sm ml-2 outline-none w-full"
            />
          </div>


          {/* USER PROFILE */}
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="../assets/"
              alt="User"
              className="w-9 h-9 rounded-full border"
            />
            <span className="hidden sm:flex text-sm font-medium">Johnson</span>
            <ChevronDown size={18} className="text-gray-600 hidden sm:flex" />
          </div>
        </div>
      </div>
    </header>
  );
}
