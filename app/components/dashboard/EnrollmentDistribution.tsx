"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EnrollmentDistributionProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6", "#8b5cf6"];

export function EnrollmentDistribution({ data }: EnrollmentDistributionProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(15, 23, 42, 0.9)", 
              borderRadius: "8px", 
              border: "none",
              color: "#fff"
            }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
