import React from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileNav from "@/components/MobileNav";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <DashboardHeader className="w-full bg-white z-20 shadow" />
        <MobileNav />

        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
