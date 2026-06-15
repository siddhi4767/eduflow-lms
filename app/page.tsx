"use client";

// =============================================================================
// page.tsx  — EduFlow LMS  |  Landing Page
//
// A branded hero page with feature highlights and CTA.
// Replaces the previous redirect-to-dashboard.
// =============================================================================

import Link from "next/link";

const FEATURES = [
  {
    icon: "🎓",
    title: "Student Management",
    description: "Register, search, and manage student profiles with ease.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: "📚",
    title: "Course Catalog",
    description: "Create and organise courses with fees, durations, and categories.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: "📋",
    title: "Enrollment Tracking",
    description: "Enroll students, track status, and monitor completion rates.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: "📊",
    title: "Live Analytics",
    description: "Real-time dashboard with charts, revenue, and activity feed.",
    gradient: "from-amber-500 to-orange-600",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Built with Next.js 16 + TypeScript
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight max-w-3xl">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Modern Learning
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Management System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
          Manage students, courses, and enrollments with a beautiful dark-themed
          dashboard. Powered by React Context with localStorage persistence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]"
          >
            Go to Dashboard →
          </Link>
          <Link
            href="/students"
            className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all border border-slate-700 hover:border-slate-600"
          >
            View Students
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-800/40 backdrop-blur-md p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-800/70"
            >
              <div
                className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500`}
              />
              <div className="relative z-10">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-lg mb-4 shadow-lg`}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Tech Stack */}
      <section className="px-6 pb-16 sm:pb-24 border-t border-white/[0.04] pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-8">
            Powered by Modern Technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 opacity-70">
            {["Next.js 16 (App Router)", "React Context API", "TypeScript", "Tailwind CSS", "localStorage (Persistence)"].map((tech) => (
              <div key={tech} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm font-medium text-slate-300">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="text-center py-8 border-t border-slate-800 text-slate-600 text-xs">
        EduFlow LMS — Built with Next.js, React Context, TypeScript &amp; Tailwind CSS
      </footer>
    </div>
  );
}
