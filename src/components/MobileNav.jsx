import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  GlobeLock,
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
    { to: "/browsetemplate", label: "Template", icon: <GlobeLock size={22} /> },
    { to: "/profile", label: "Profile", icon: <Users size={22} /> },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      className="
        fixed bottom-0 left-0 right-0 md:hidden z-50
        bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-700
        shadow-md
        px-2
      "
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
      }}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
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
