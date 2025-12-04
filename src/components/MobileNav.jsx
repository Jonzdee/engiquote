// src/components/MobileNav.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  Settings,
} from "lucide-react";

export default function MobileNav() {
  const items = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    { to: "/createquotation", label: "Create", icon: <FilePlus size={22} /> },
    { to: "/quotationhistory", label: "History", icon: <History size={22} /> },
    { to: "/clients", label: "Clients", icon: <Users size={22} /> },
    { to: "/settings", label: "Settings", icon: <Settings size={22} /> },
  ];

  return (
    <nav
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 
        md:hidden z-50
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        shadow-xl rounded-2xl 
        px-4 py-2 w-[92%] max-w-md 
        backdrop-blur-lg
      "
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
      }}
    >
      <div className="flex justify-between items-center">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1
               gap-1 py-2 transition-all
               ${
                 isActive
                   ? "text-blue-600 scale-110 font-medium"
                   : "text-gray-600 dark:text-gray-300"
               }`
            }
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
