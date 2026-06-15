"use client";

// =============================================================================
// RevenueTrendChart.tsx
//
// A beautifully animated SVG sparkline chart with gradient area
// to visualize revenue trend in a modern SaaS style.
// =============================================================================

import { useEffect, useState } from "react";

// Mock data: normally you'd compute this from actual enrollments over time
const DATA_POINTS = [30, 45, 40, 60, 50, 75, 65, 90, 85, 110, 100, 130];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RevenueTrendChart() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxVal = Math.max(...DATA_POINTS, 1);
  
  // SVG viewBox size
  const width = 800;
  const height = 300;
  
  // Create smooth curved path using bezier controls
  const createPath = (points: number[]) => {
    if (points.length === 0) return "";
    
    const stepX = width / (points.length - 1);
    const getY = (val: number) => height - (val / maxVal) * (height - 40) - 20;
    
    let d = `M 0 ${getY(points[0])}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = i * stepX;
      const y1 = getY(points[i]);
      const x2 = (i + 1) * stepX;
      const y2 = getY(points[i + 1]);
      
      const cx = (x1 + x2) / 2;
      
      d += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    }
    
    return d;
  };

  const linePath = createPath(DATA_POINTS);
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Revenue Trend</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last 12 Months</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600 dark:bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+24.5%</span>
        </div>
      </div>

      <div className="relative w-full h-64">
        {/* Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full border-b border-slate-200 dark:border-white/[0.04] h-0 flex items-center">
            </div>
          ))}
        </div>

        {/* SVG Chart */}
        <svg 
          className="w-full h-full relative z-10 overflow-visible" 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            className={`transition-all duration-[1500ms] ease-in-out ${animated ? 'opacity-100' : 'opacity-0 translate-y-8'}`}
          />
          
          <path
            d={linePath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="4"
            filter="url(#glow)"
            strokeLinecap="round"
            className={`transition-all duration-[1500ms] ease-out`}
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: animated ? 0 : 3000,
            }}
          />
          
          {/* Data points */}
          {DATA_POINTS.map((val, i) => {
            const x = i * (width / (DATA_POINTS.length - 1));
            const y = height - (val / maxVal) * (height - 40) - 20;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="6"
                className={`fill-white dark:fill-slate-900 stroke-indigo-500 dark:stroke-indigo-400 stroke-2 transition-all duration-700 hover:r-8 hover:stroke-indigo-700 dark:hover:stroke-white cursor-pointer ${
                  animated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{ transitionDelay: `${500 + i * 50}ms` }}
              >
                <title>{MONTHS[i]}: ₹{val}k</title>
              </circle>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-slate-500 font-medium">
          {MONTHS.map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
