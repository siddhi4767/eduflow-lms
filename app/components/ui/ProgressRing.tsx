"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  trackColorClass?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  colorClass = "text-indigo-500",
  trackColorClass = "text-slate-200 dark:text-slate-800",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          className={`stroke-current ${trackColorClass}`}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          className={`stroke-current ${colorClass}`}
        />
      </svg>
      {/* Percentage Text inside ring */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 dark:text-white">
          {progress}%
        </span>
      </div>
    </div>
  );
}
