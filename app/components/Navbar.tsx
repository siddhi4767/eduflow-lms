"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES: Record<string, string> = {
  "/":           "Home",
  "/dashboard":  "Dashboard",
  "/students":   "Students",
  "/courses":    "Courses",
  "/enrollment": "Enrollment",
  "/settings":   "Settings",
};

interface Props {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: Props) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || "EduFlow";
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          aria-label="Toggle sidebar"
        >
          <span className="text-lg">☰</span>
        </button>
        <div>
          <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg uppercase">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
