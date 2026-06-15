"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// QuickActions
//
// A row of shortcut buttons linking to key pages.
// Styled with gradient borders and hover effects.
// ─────────────────────────────────────────────────────────────────────────────

interface Action {
  label: string;
  href: string;
  icon: string;
  description: string;
  gradient: string;
}

const ACTIONS: Action[] = [
  {
    label: "Add Student",
    href: "/students",
    icon: "🎓",
    description: "Register a new student",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    label: "Add Course",
    href: "/courses",
    icon: "📚",
    description: "Create a new course",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    label: "New Enrollment",
    href: "/enrollment",
    icon: "📋",
    description: "Enroll student in course",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "⚙️",
    description: "Configure your LMS",
    gradient: "from-amber-500 to-orange-600",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-800/40 backdrop-blur-md p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:scale-[1.02] shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none"
        >
          {/* Background glow on hover */}
          <div
            className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500`}
          />

          <div className="relative z-10">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-lg mb-3 shadow-lg`}
            >
              {action.icon}
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{action.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
