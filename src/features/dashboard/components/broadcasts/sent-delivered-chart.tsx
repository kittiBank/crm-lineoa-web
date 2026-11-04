"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatNumber } from "../../lib/format";
import { BroadcastSeriesPoint } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const SERIES = {
  sent: { label: "Sent", color: "#60A5FA" },
  delivered: { label: "Delivered", color: "#2563EB" },
  clicks: { label: "Clicks", color: "#1E3A8A" },
} as const;

interface SentDeliveredChartProps {
  data: BroadcastSeriesPoint[];
  rangeEnd: string;
}

export function SentDeliveredChart({ data, rangeEnd }: SentDeliveredChartProps) {
  const cutoff = new Date(rangeEnd).getTime();
  const points = data.map((point) => {
    const future = new Date(point.start).getTime() > cutoff;
    return {
      label: point.label,
      sent: future ? null : point.sent,
      delivered: future ? null : point.delivered,
      clicks: future ? null : point.clicks,
    };
  });
  const hasData = data.some((p) => p.sent || p.clicks);
  const tickInterval = points.length > 12 ? Math.ceil(points.length / 6) - 1 : 0;

  return (
    <ChartCard
      title="Sent vs. delivered"
      subtitle="Messages per period, with link clicks"
      action={
        <div className="flex gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 border-t-2 border-dashed" style={{ borderColor: SERIES.sent.color }} />
            Sent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-3.5 rounded-sm" style={{ background: SERIES.delivered.color }} />
            Delivered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: SERIES.clicks.color }} />
            Clicks
          </span>
        </div>
      }
    >
      {hasData ? (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EDEDED" className="dark:stroke-neutral-800" />
              <XAxis
                dataKey="label"
                interval={tickInterval}
                tickLine={false}
                axisLine={{ stroke: "#D4D4D4" }}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
              />
              <YAxis
                yAxisId="messages"
                width={44}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                tickFormatter={formatCompact}
              />
              <YAxis
                yAxisId="clicks"
                orientation="right"
                width={36}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                tickFormatter={formatCompact}
              />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number" ? formatNumber(value) : "—",
                  SERIES[name as keyof typeof SERIES]?.label ?? name,
                ]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 }}
              />
              <Bar
                yAxisId="clicks"
                dataKey="clicks"
                fill={SERIES.clicks.color}
                fillOpacity={0.85}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
              <Line
                yAxisId="messages"
                type="monotone"
                dataKey="sent"
                stroke={SERIES.sent.color}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                connectNulls={false}
              />
              <Line
                yAxisId="messages"
                type="monotone"
                dataKey="delivered"
                stroke={SERIES.delivered.color}
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <CardEmptyState message="No broadcasts sent in this period" />
      )}
    </ChartCard>
  );
}
