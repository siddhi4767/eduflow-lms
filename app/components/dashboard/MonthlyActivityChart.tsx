"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyActivityChartProps {
  data: { name: string; activities: number }[];
}

export function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#94a3b8" }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#94a3b8" }} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(15, 23, 42, 0.9)", 
              borderRadius: "8px", 
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              color: "#fff"
            }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Line 
            type="monotone" 
            dataKey="activities" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
