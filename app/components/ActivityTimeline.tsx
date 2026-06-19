"use client";

import { useEffect, useState } from "react";
import type { Activity } from "../data/types";

// ─────────────────────────────────────────────────────────────────────────────
// ActivityTimeline
//
// A vertical timeline showing recent LMS events.
// Each item fades in with a stagger for a polished entrance.
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  activities: Activity[];
  maxItems?: number;
};

const TYPE_COLORS: Record<string, string> = {
  enrollment: "border-indigo-500 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500",
  course:     "border-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500",
  student:    "border-amber-500 bg-amber-100 dark:bg-amber-500/10 text-amber-500",
  completion: "border-violet-500 bg-violet-100 dark:bg-violet-500/10 text-violet-500",
  assignment: "border-rose-500 bg-rose-100 dark:bg-rose-500/10 text-rose-500",
};

function getColorForType(type: string) {
  return TYPE_COLORS[type] || "border-slate-500 bg-slate-100 dark:bg-slate-500/10 text-slate-500";
}

export default function ActivityTimeline({
  activities,
  maxItems = 6,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const items = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);

  useEffect(() => {
    setCurrentTime(Date.now());
    const clock = setInterval(() => setCurrentTime(Date.now()), 60000);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= items.length) clearInterval(interval);
    }, 120);

    return () => {
      clearInterval(clock);
      clearInterval(interval);
    };
  }, [items.length]);

  function formatRelativeTime(ts: string): string {
    if (currentTime === null) return "";
    const diff = currentTime - new Date(ts).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-start gap-4 py-3 transition-all duration-500 ${
            i < visibleCount
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
        >
          {/* Timeline dot + connector */}
          <div className="relative flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm ${getColorForType(item.type)}`}
            >
              {item.icon}
            </div>
            {i < items.length - 1 && (
              <div className="w-px h-full bg-slate-300 dark:bg-slate-700/60 absolute top-9 left-1/2 -translate-x-1/2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-1">
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
              {item.message}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {formatRelativeTime(item.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
