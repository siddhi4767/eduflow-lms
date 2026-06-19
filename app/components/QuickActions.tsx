"use client";

import Link from "next/link";

import { UserPlus, BookPlus, ClipboardList, Settings } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// QuickActions
//
// A row of shortcut buttons linking to key pages.
// Styled with gradient borders and hover effects.
// ─────────────────────────────────────────────────────────────────────────────

interface Action {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
}

const ACTIONS: Action[] = [
  {
    label: "Add Student",
    href: "/students",
    icon: UserPlus,
    description: "Register a new student",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    label: "Add Course",
    href: "/courses",
    icon: BookPlus,
    description: "Create a new course",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    label: "New Enrollment",
    href: "/enrollment",
    icon: ClipboardList,
    description: "Enroll student in course",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure your LMS",
    gradient: "from-amber-500 to-orange-600",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 transition-all duration-300 hover:border-primary/30 hover:bg-surface-muted hover:scale-[1.02] shadow-card hover:shadow-card-dark"
        >
          {/* Background glow on hover */}
          <div
            className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
          />

          <div className="relative z-10 min-w-0 flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-3 shadow-lg`}
            >
              <action.icon size={20} />
            </div>
            <p className="font-bold text-foreground text-sm w-full leading-tight">{action.label}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 w-full font-medium leading-tight">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
