"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BroadcastStatusData } from "../lib/mockData";

interface BroadcastStatusChartProps {
  data: BroadcastStatusData[];
}

/**
 * Broadcast Status Chart using Recharts
 * Shows distribution of broadcasts by status using pie chart
 */
export function BroadcastStatusChart({ data }: BroadcastStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Broadcast Status
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value: any) => {
              if (!value) return ["0%", "Percentage"];
              return [
                `${((value / total) * 100).toFixed(1)}%`,
                "Percentage",
              ];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {value}
              </span>
            )}
            wrapperStyle={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              paddingTop: "16px",
            }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
