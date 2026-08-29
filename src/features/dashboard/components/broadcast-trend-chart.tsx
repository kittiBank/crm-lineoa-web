"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BroadcastTrendData } from "../types";

interface BroadcastTrendChartProps {
  data: BroadcastTrendData[];
}

export function BroadcastTrendChart({ data }: BroadcastTrendChartProps) {
  const tickInterval = data.length > 12 ? Math.ceil(data.length / 8) - 1 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Broadcast Trend
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            interval={tickInterval}
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            label={{ value: "Messages", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Line
            type="monotone"
            dataKey="sent"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Sent"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="delivered"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
            name="Delivered"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
