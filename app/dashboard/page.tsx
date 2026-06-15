"use client";

// =============================================================================
// dashboard/page.tsx  — EduFlow LMS  |  Dynamic Dashboard
//
// CHANGES:
//   • All data read from AppContext via useApp() (not static imports)
//   • Total Revenue computed from enrollments × course fees
//   • All charts and stats update in real-time as data changes
// =============================================================================

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import AnimatedStatsCard from "../components/AnimatedStatsCard";
import DonutChart from "../components/DonutChart";
import ActivityTimeline from "../components/ActivityTimeline";
import QuickActions from "../components/QuickActions";
import CoursePopularityBar from "../components/CoursePopularityBar";
import RevenueTrendChart from "../components/RevenueTrendChart";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { students, courses, enrollments, activities, hydrated } = useApp();
  const { user } = useAuth();
  const [sevenDaysAgo, setSevenDaysAgo] = useState(0);

  useEffect(() => {
    setSevenDaysAgo(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }, []);

  if (!hydrated) {
    return (
      <div className="p-4 sm:p-8 flex-1 max-w-[1400px] animate-pulse">
        <div className="mb-8">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-48 mb-3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-72"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/[0.06]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/[0.06]"></div>
          <div className="h-80 lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/[0.06]"></div>
        </div>
      </div>
    );
  }

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalRevenue = enrollments.reduce((sum, e) => {
    const course = courses.find((c) => c.name === e.courseName);
    return sum + (course ? parseInt(course.fee, 10) : 0);
  }, 0);

  const statusCounts = {
    Active:    enrollments.filter((e) => e.status === "Active").length,
    Pending:   enrollments.filter((e) => e.status === "Pending").length,
    Completed: enrollments.filter((e) => e.status === "Completed").length,
  };

  const donutSegments = [
    { label: "Active",    value: statusCounts.Active,    color: "#22c55e" },
    { label: "Pending",   value: statusCounts.Pending,   color: "#eab308" },
    { label: "Completed", value: statusCounts.Completed, color: "#6366f1" },
  ];

  const newStudentsCount = activities.filter(
    (a) => a.type === "student" && new Date(a.timestamp).getTime() > sevenDaysAgo
  ).length;

  const newEnrollmentsCount = activities.filter(
    (a) => a.type === "enrollment" && new Date(a.timestamp).getTime() > sevenDaysAgo
  ).length;

  return (
    <div className="p-4 sm:p-8 flex-1 max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || "Admin"}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Here's a live overview of your LMS today.
          </p>
        </div>
        
        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-full p-1.5 pr-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Administrator"}</span>
            <span className="text-xs text-indigo-500 dark:text-indigo-300">{user?.role || "Admin"}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
        <AnimatedStatsCard
          title="Total Students"
          value={students.length}
          icon="🎓"
          gradient="from-indigo-500 to-blue-600"
          delay={0}
        />
        <AnimatedStatsCard
          title="New Students"
          value={newStudentsCount}
          icon="✨"
          gradient="from-cyan-500 to-blue-500"
          trend={{ value: 100, label: "last 7 days" }}
          delay={100}
        />
        <AnimatedStatsCard
          title="Total Courses"
          value={courses.length}
          icon="📚"
          gradient="from-emerald-500 to-teal-600"
          delay={200}
        />
        <AnimatedStatsCard
          title="Total Enrollments"
          value={enrollments.length}
          icon="📋"
          gradient="from-violet-500 to-purple-600"
          delay={300}
        />
        <AnimatedStatsCard
          title="New Enrollments"
          value={newEnrollmentsCount}
          icon="🚀"
          gradient="from-fuchsia-500 to-pink-600"
          trend={{ value: 100, label: "last 7 days" }}
          delay={400}
        />
        <AnimatedStatsCard
          title="Total Revenue"
          value={totalRevenue}
          icon="💰"
          prefix="₹"
          gradient="from-amber-500 to-orange-600"
          delay={500}
        />
      </div>

      {/* Charts Row 1: Trend & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-white/20">
          <RevenueTrendChart />
        </div>

        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-white/20">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">
            Enrollment Status
          </h2>
          {enrollments.length > 0 ? (
             <DonutChart segments={donutSegments} />
          ) : (
             <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Popularity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-white/20">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">
            Course Popularity
          </h2>
          <CoursePopularityBar courses={courses} enrollments={enrollments} />
        </div>

        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-white/20">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <QuickActions />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-400/20">
            Live updates
          </span>
        </div>
        {activities.length > 0 ? (
          <ActivityTimeline activities={activities} maxItems={6} />
        ) : (
          <div className="text-slate-500 text-sm py-4">No recent activity.</div>
        )}
      </div>
    </div>
  );
}