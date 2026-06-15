"use client";

// =============================================================================
// CoursePopularityBar.tsx  — EduFlow LMS  |  Horizontal Bar Chart
//
// CHANGES:
//   • Now accepts courses and enrollments as props (from dashboard context)
//   • No longer imports directly from store.ts
// =============================================================================

import Link from "next/link";
import type { Course, Enrollment } from "../data/types";

const BAR_COLORS = [
  "bg-gradient-to-r from-indigo-500 to-indigo-400",
  "bg-gradient-to-r from-emerald-500 to-emerald-400",
  "bg-gradient-to-r from-violet-500 to-violet-400",
  "bg-gradient-to-r from-amber-500 to-amber-400",
  "bg-gradient-to-r from-rose-500 to-rose-400",
];

interface Props {
  courses: Course[];
  enrollments: Enrollment[];
}

export default function CoursePopularityBar({ courses, enrollments }: Props) {
  // Compute popularity from enrollments
  const countMap: Record<string, number> = {};
  for (const e of enrollments) {
    countMap[e.courseName] = (countMap[e.courseName] || 0) + 1;
  }
  const data = Object.entries(countMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-2xl mb-2">📊</p>
        <p className="text-sm">No enrollment data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const course = courses.find((c) => c.name === item.name);
        const widthPct = (item.count / maxCount) * 100;

        return (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {item.name}
                </span>
                {course && (
                  <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                    {course.category}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-300 tabular-nums">
                {item.count}
              </span>
            </div>

            <div className="h-2.5 bg-slate-200 dark:bg-slate-700/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-1000 ease-out`}
                style={{
                  width: `${widthPct}%`,
                  transitionDelay: `${600 + i * 150}ms`,
                }}
              />
            </div>
          </div>
        );
      })}

      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mt-2"
      >
        View all courses →
      </Link>
    </div>
  );
}
