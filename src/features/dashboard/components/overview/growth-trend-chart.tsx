"use client";

import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatBaht, formatCompact, formatNumber } from "../../lib/format";
import { GrowthMetric, GrowthTrendPoint } from "../../types";
import { ChartCard } from "../chart-card";

const METRICS: Array<{
  value: GrowthMetric;
  label: string;
  unit: string;
  color: string;
  money: boolean;
}> = [
    { value: "newFollowers", label: "New followers", unit: "new followers", color: "#2563EB", money: false },
    { value: "revenue", label: "Revenue", unit: "revenue", color: "#1E3A8A", money: true },
    { value: "orders", label: "Orders", unit: "orders", color: "#3B82F6", money: false },
    { value: "messagesSent", label: "Messages sent", unit: "messages sent", color: "#60A5FA", money: false },
  ];

interface GrowthTrendChartProps {
  data: GrowthTrendPoint[];
  /** Data cut-off; buckets that start after it are not drawn for "this period". */
  rangeEnd: string;
  periodName: string;
}

export function GrowthTrendChart({ data, rangeEnd, periodName }: GrowthTrendChartProps) {
  const [metricValue, setMetricValue] = useState<GrowthMetric>("newFollowers");
  const metric = METRICS.find((m) => m.value === metricValue) ?? METRICS[0];
  const cutoff = new Date(rangeEnd).getTime();

  const points = data.map((point) => ({
    label: point.label,
    current: new Date(point.start).getTime() > cutoff ? null : point[metric.value],
    previous: point.previous[metric.value],
  }));
  const total = data.reduce((sum, point) => sum + point[metric.value], 0);
  const formatValue = (value: number) =>
    metric.money ? formatBaht(value) : formatNumber(value);
  const tickInterval = points.length > 12 ? Math.ceil(points.length / 6) - 1 : 0;

  return (
    <ChartCard
      title="Growth trend"
      subtitle={`${formatValue(total)} ${metric.unit} in ${periodName}`}
      action={
        <div role="group" aria-label="Metric" className="flex flex-wrap gap-1.5">
          {METRICS.map((m) => {
            const active = m.value === metric.value;
            return (
              <button
                key={m.value}
                type="button"
                aria-pressed={active}
                onClick={() => setMetricValue(m.value)}
                className={cn(
                  "flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium",
                  active
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
                )}
              >
                <span className="size-2 rounded-full" style={{ background: m.color }} />
                {m.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={metric.color} stopOpacity={0.22} />
                <stop offset="1" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EDEDED" className="dark:stroke-neutral-800" />
            <XAxis
              dataKey="label"
              interval={tickInterval}
              tickLine={false}
              axisLine={{ stroke: "#D4D4D4" }}
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
            />
            <YAxis
              width={48}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              tickFormatter={(v: number) => (metric.money ? "฿" : "") + formatCompact(v)}
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? formatValue(value) : "—",
                name === "current" ? "This period" : "Previous period",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#A3A3A3"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke={metric.color}
              strokeWidth={2.5}
              fill="url(#growthArea)"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 text-xs text-neutral-600 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3.5 rounded-sm" style={{ background: metric.color }} />
          This period
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 border-t-2 border-dashed border-neutral-400" />
          Previous period
        </span>
      </div>
    </ChartCard>
  );
}
