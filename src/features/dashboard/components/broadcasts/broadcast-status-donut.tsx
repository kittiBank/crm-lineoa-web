"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "../../lib/format";
import { BroadcastStatusKey, DashboardBroadcasts } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";
import { BROADCAST_STATUS_META, BROADCAST_STATUS_ORDER } from "./broadcast-meta";

interface BroadcastStatusDonutProps {
  statusCounts: DashboardBroadcasts["statusCounts"];
  /** Selected status filter; other slices are dimmed. */
  status?: BroadcastStatusKey;
}

export function BroadcastStatusDonut({ statusCounts, status }: BroadcastStatusDonutProps) {
  const slices = BROADCAST_STATUS_ORDER.map((key) => ({
    key,
    label: BROADCAST_STATUS_META[key].label,
    color: BROADCAST_STATUS_META[key].color,
    count: statusCounts.find((row) => row.status === key)?.count ?? 0,
    selected: !status || status === key,
  }));
  const total = slices.reduce((sum, s) => sum + s.count, 0);

  return (
    <ChartCard title="Broadcast status" subtitle="Campaigns in this period" size="narrow">
      {total > 0 ? (
        <div className="flex items-center gap-5">
          <div className="relative size-[132px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} fillOpacity={slice.selected ? 1 : 0.25} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number" ? formatNumber(value) : "—",
                    name,
                  ]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold tabular-nums text-neutral-950 dark:text-white">
                {formatNumber(total)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">campaigns</span>
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-[13px]">
            {slices.map((slice) => (
              <li
                key={slice.key}
                className="flex items-center gap-2"
                style={{ opacity: slice.selected ? 1 : 0.5 }}
              >
                <span className="size-2.5 rounded-full" style={{ background: slice.color }} />
                <span className="flex-1 text-neutral-700 dark:text-neutral-300">{slice.label}</span>
                <span className="font-semibold tabular-nums text-neutral-950 dark:text-white">
                  {formatNumber(slice.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <CardEmptyState message="No campaigns in this period" />
      )}
    </ChartCard>
  );
}
