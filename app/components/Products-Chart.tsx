"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  week: string;
  products: number;
}

export default function ProductsChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="productsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
            formatter={(value) => [value, "New products"]}
            labelFormatter={(label) => `Week of ${label}`}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              boxShadow: "0 4px 12px -2px rgba(15, 23, 42, 0.08)",
              fontSize: 13,
            }}
            labelStyle={{ color: "#0f172a", fontWeight: 600, marginBottom: 2 }}
          />
          <Area
            type="monotone"
            dataKey="products"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#productsFill)"
            dot={false}
            activeDot={{ fill: "#4f46e5", stroke: "white", strokeWidth: 2, r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
