"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; label: string };
  iconColorClass?: string;
  iconBgClass?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  prefix = "",
  suffix = "",
  trend,
  iconColorClass = "text-primary",
  iconBgClass = "bg-primary/10",
  delay = 0,
}: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1200;
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
    }, delay * 1000 + 200);

    return () => clearTimeout(countTimer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 sm:p-6 shadow-card hover:shadow-card-dark hover:-translate-y-1 transition-all duration-300"
    >
      {/* Removed the cartoonish glowing background */}

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {prefix}
              {displayed.toLocaleString("en-IN")}
              {suffix}
            </p>
            {trend && (
              <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded border", 
                  trend.value >= 0 ? "bg-success-light/30 border-success-light text-success" : "bg-danger-light/30 border-danger-light text-danger"
              )}>
                <span className="text-xs font-bold">
                  {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          {trend && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              vs {trend.label}
            </p>
          )}
        </div>

        <div
          className={cn(
            "w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-500 flex items-center justify-center",
            iconColorClass,
            iconBgClass
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
