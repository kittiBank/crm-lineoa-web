"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AudienceGrowthData } from "../lib/mockData";

interface AudienceGrowthChartProps {
  data: AudienceGrowthData[];
}

/**
 * Audience Growth Chart using Recharts
 * Shows new vs returning audience for 4 weeks with bar chart
 */
export function AudienceGrowthChart({ data }: AudienceGrowthChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Audience Growth
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-700"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">New</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Returning
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="week"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            label={{ value: "Audience", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            cursor={{ fill: "#f3f4f6", fillOpacity: 0.1 }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Bar
            dataKey="new"
            fill="#1e40af"
            name="New"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
          />
          <Bar
            dataKey="returning"
            fill="#93c5fd"
            name="Returning"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
