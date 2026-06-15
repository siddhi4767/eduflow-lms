"use client";

// =============================================================================
// sidebar.tsx  — EduFlow LMS  |  Responsive Sidebar Navigation
//
// CHANGES FROM ORIGINAL:
//   • Reads LMS name from SettingsContext (instead of hardcoded)
//   • Responsive: hidden on mobile, toggled via hamburger in Navbar
//   • Overlay backdrop on mobile
//   • Closes on route navigation (mobile)
// =============================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard",  icon: "🏠" },
  { href: "/students",   label: "Students",   icon: "🎓" },
  { href: "/courses",    label: "Courses",    icon: "📚" },
  { href: "/enrollment", label: "Enrollment", icon: "📋" },
  { href: "/settings",   label: "Settings",   icon: "⚙️"  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { settings } = useSettings();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800 flex-shrink-0 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-7 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight">
            <span className="text-indigo-400">
              {settings.lmsName.split(" ")[0] || "Edu"}
            </span>
            {settings.lmsName.split(" ").slice(1).join(" ") || "Flow LMS"}
          </h1>
          <p className="text-slate-500 text-xs mt-1">Learning Management System</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-800 text-slate-500 text-xs">
          {settings.lmsName} v1.0
        </div>
      </div>
    </>
  );
}