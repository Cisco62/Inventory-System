"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ActivityPoint {
  week: string;
  received: number;
  sold: number;
}

export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="week"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            width={36}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            labelFormatter={(label) => `Week of ${label}`}
            formatter={(value, name) => [`${value} units`, name]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              boxShadow: "0 4px 12px -2px rgba(15, 23, 42, 0.08)",
              fontSize: 13,
            }}
            labelStyle={{ color: "#0f172a", fontWeight: 600, marginBottom: 2 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingBottom: 8, color: "#475569" }}
          />
          <Bar dataKey="received" name="Received" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="sold" name="Sold" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
