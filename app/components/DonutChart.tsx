"use client";

import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DonutChart
//
// A pure-CSS / canvas-free donut chart built with conic-gradient.
// Segments animate in from 0 on mount.
// ─────────────────────────────────────────────────────────────────────────────

export interface Segment {
  label: string;
  value: number;
  color: string; // any CSS color
}

type Props = {
  segments: Segment[];
  size?: number;   // px
  thickness?: number; // px
};

export default function DonutChart({
  segments,
  size = 180,
  thickness = 28,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  // Build the conic-gradient string
  useEffect(() => {
    if (!ref.current || total === 0) return;

    // Animate after a brief delay for a smoother entrance
    const timer = setTimeout(() => {
      let accumulated = 0;
      const stops: string[] = [];

      for (const seg of segments) {
        const start = (accumulated / total) * 360;
        accumulated += seg.value;
        const end = (accumulated / total) * 360;
        stops.push(`${seg.color} ${start}deg ${end}deg`);
      }

      ref.current!.style.background = `conic-gradient(${stops.join(", ")})`;
    }, 400);

    return () => clearTimeout(timer);
  }, [segments, total]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Chart ring */}
      <div
        className="relative rounded-full transition-all duration-1000 ease-out"
        style={{
          width: size,
          height: size,
          background: "rgba(51,65,85,0.4)",
        }}
      >
        <div
          ref={ref}
          className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
          style={{ width: size, height: size }}
        />
        {/* Center hole */}
        <div
          className="absolute rounded-full bg-white dark:bg-slate-800 flex items-center justify-center"
          style={{
            width: size - thickness * 2,
            height: size - thickness * 2,
            top: thickness,
            left: thickness,
          }}
        >
          <div className="text-center">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {seg.label}{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{seg.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
