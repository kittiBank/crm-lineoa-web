"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "../../lib/format";
import { DashboardUsers } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const COLORS = { weekday: "#93C5FD", weekend: "#2563EB" };
const LABELS = { weekday: "Weekdays (Mon–Fri)", weekend: "Weekend (Sat–Sun)" };

const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

function formatAverage(value: number): string {
  return value >= 10 ? formatCompact(value) : value.toFixed(1).replace(/\.0$/, "");
}

export function ActivityByHourChart({
  activity,
}: {
  activity: DashboardUsers["activity"];
}) {
  const { hours, peak } = activity;
  const points = hours.map((point) => ({ ...point, label: hourLabel(point.hour) }));
  const kinds = (["weekday", "weekend"] as const).filter((kind) =>
    hours.some((point) => point[kind] !== null),
  );

  return (
    <ChartCard
      title="When users are active"
      subtitle="Active users by hour (chats and link clicks) — best time to broadcast"
      action={
        peak && (
          <span className="rounded-full bg-[#EFF5FF] px-2.5 py-1 text-xs font-semibold tabular-nums text-chart-blue-900 dark:bg-blue-950/40 dark:text-chart-blue-300">
            Peak: {peak.kind === "weekend" ? "Weekend" : "Weekdays"} {hourLabel(peak.hour)}–
            {hourLabel((peak.hour + 1) % 24)}
          </span>
        )
      }
    >
      {peak ? (
        <>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={COLORS.weekend} stopOpacity={0.18} />
                    <stop offset="1" stopColor={COLORS.weekend} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EDEDED" className="dark:stroke-neutral-800" />
                <XAxis
                  dataKey="label"
                  ticks={["00:00", "06:00", "12:00", "18:00", "23:00"]}
                  tickLine={false}
                  axisLine={{ stroke: "#D4D4D4" }}
                  tick={{ fontSize: 11, fill: "#6B6B6B" }}
                />
                <YAxis
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6B6B6B" }}
                  tickFormatter={formatAverage}
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number" ? formatAverage(value) : "—",
                    LABELS[name as keyof typeof LABELS] ?? name,
                  ]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 }}
                />
                {kinds.includes("weekday") && (
                  <Line
                    type="monotone"
                    dataKey="weekday"
                    stroke={COLORS.weekday}
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {kinds.includes("weekend") && (
                  <Area
                    type="monotone"
                    dataKey="weekend"
                    stroke={COLORS.weekend}
                    strokeWidth={2.5}
                    fill="url(#activityArea)"
                    dot={false}
                  />
                )}
                <ReferenceDot
                  x={hourLabel(peak.hour)}
                  y={peak.users}
                  r={5}
                  fill={COLORS[peak.kind]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            {kinds.map((kind) => (
              <span key={kind} className="flex items-center gap-1.5">
                <span className="h-[3px] w-3.5 rounded-sm" style={{ background: COLORS[kind] }} />
                {LABELS[kind]}
              </span>
            ))}
            <span className="ml-auto">Average active users per hour</span>
          </div>
        </>
      ) : (
        <CardEmptyState message="No chats or link clicks in this period" />
      )}
    </ChartCard>
  );
}
