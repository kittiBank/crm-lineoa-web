"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatDateTime, formatNumber } from "../../lib/format";
import { FollowerMovementPoint } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const COLORS = { gained: "#2563EB", lost: "#93C5FD", net: "#1E3A8A" };

const BUCKET_NAMES = { hour: "hour", day: "day", week: "week" } as const;

const SERIES_LABELS: Record<string, string> = {
  gained: "Gained",
  lost: "Lost",
  net: "Net",
};

interface FollowerMovementChartProps {
  data: FollowerMovementPoint[];
  granularity: keyof typeof BUCKET_NAMES;
  /** Data cut-off; later buckets are left empty. */
  rangeEnd: string;
  trackingSince: string | null;
}

export function FollowerMovementChart({
  data,
  granularity,
  rangeEnd,
  trackingSince,
}: FollowerMovementChartProps) {
  const cutoff = new Date(rangeEnd).getTime();
  const points = data.map((point) => {
    const future = new Date(point.start).getTime() > cutoff;
    return {
      label: point.label,
      gained: future ? null : point.gained,
      // Drawn below the axis.
      lost: future ? null : -point.lost,
      net: future ? null : point.net,
    };
  });
  const hasData = data.some((point) => point.gained || point.lost);
  const tickInterval = points.length > 12 ? Math.ceil(points.length / 6) - 1 : 0;

  const lostSince =
    trackingSince && new Date(trackingSince).getTime() > new Date(data[0]?.start ?? 0).getTime()
      ? formatDateTime(trackingSince)
      : null;

  return (
    <ChartCard
      title="Follower movement"
      subtitle={
        <>
          Gained vs. lost (unfollowed or blocked) per {BUCKET_NAMES[granularity]}
          {lostSince && (
            <span className="block text-xs text-neutral-400 dark:text-neutral-500">
              Unfollows tracked since {lostSince}
            </span>
          )}
        </>
      }
      action={
        <div className="flex gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          {(["gained", "lost", "net"] as const).map((key) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className={key === "net" ? "h-[3px] w-3.5 rounded-sm" : "size-2.5 rounded-sm"}
                style={{ background: COLORS[key] }}
              />
              {SERIES_LABELS[key]}
            </span>
          ))}
        </div>
      }
    >
      {hasData ? (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={points}
              stackOffset="sign"
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#EDEDED" className="dark:stroke-neutral-800" />
              <XAxis
                dataKey="label"
                interval={tickInterval}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
              />
              <YAxis
                width={44}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                tickFormatter={(v: number) =>
                  v < 0 ? `−${formatCompact(-v)}` : formatCompact(v)
                }
              />
              <ReferenceLine y={0} stroke="#D4D4D4" />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number"
                    ? formatNumber(name === "lost" ? -value : value)
                    : "—",
                  SERIES_LABELS[String(name)] ?? name,
                ]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 }}
              />
              <Bar dataKey="gained" stackId="movement" fill={COLORS.gained} radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar dataKey="lost" stackId="movement" fill={COLORS.lost} radius={[0, 0, 3, 3]} maxBarSize={24} />
              <Line
                type="monotone"
                dataKey="net"
                stroke={COLORS.net}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <CardEmptyState message="No follows or unfollows in this period" />
      )}
    </ChartCard>
  );
}
