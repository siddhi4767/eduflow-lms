"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedStatsCard
//
// A premium stat card with:
//  • Count-up animation on mount
//  • Gradient icon background
//  • Subtle trend indicator
//  • Glassmorphism styling
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  title: string;
  value: number;
  icon: string;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; label: string };
  gradient: string;        // Tailwind gradient classes e.g. "from-indigo-500 to-purple-600"
  delay?: number;          // stagger animation in ms
};

export default function AnimatedStatsCard({
  title,
  value,
  icon,
  prefix = "",
  suffix = "",
  trend,
  gradient,
  delay = 0,
}: Props) {
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);

  // Count-up animation
  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay);

    const duration = 1200; // ms
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const countTimer = setTimeout(() => {
      const interval = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), value);
        setDisplayed(current);
        if (step >= steps) clearInterval(interval);
      }, duration / steps);
    }, delay + 200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(countTimer);
    };
  }, [value, delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-800/60 backdrop-blur-xl p-6 transition-all duration-700 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/10 dark:hover:border-white/20 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ minWidth: 220 }}
    >
      {/* Gradient glow behind icon */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            {prefix}
            {displayed.toLocaleString("en-IN")}
            {suffix}
          </p>

          {/* Trend badge */}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-bold ${
                  trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
