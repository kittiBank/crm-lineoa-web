"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatBaht, formatCompact, formatNumber, formatPercent } from "../../lib/format";
import { DashboardSales, DashboardUserTier } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const TIER_COLORS: Record<DashboardUserTier, string> = {
  Platinum: "#1E3A8A",
  Gold: "#2563EB",
  Silver: "#60A5FA",
  Member: "#BFDBFE",
};

const TIER_LABELS: Partial<Record<DashboardUserTier, string>> = {
  Member: "No tier",
};

interface BuyerTierRevenueProps {
  revenueByTier: DashboardSales["revenueByTier"];
  buyers: DashboardSales["buyers"];
  /** Selected tier filter; other tiers are dimmed. */
  tier?: DashboardUserTier;
}

export function BuyerTierRevenue({ revenueByTier, buyers, tier }: BuyerTierRevenueProps) {
  const total = revenueByTier.reduce((sum, row) => sum + row.revenue, 0);
  const slices = revenueByTier.map((row) => ({
    key: row.tier,
    label: TIER_LABELS[row.tier] ?? row.tier,
    revenue: row.revenue,
    color: TIER_COLORS[row.tier],
    selected: !tier || tier === row.tier,
  }));

  return (
    <ChartCard
      title="Revenue by buyer tier"
      subtitle="Who drives sales (buyer’s current tier)"
      size="narrow"
    >
      {total > 0 ? (
        <div className="flex items-center gap-5">
          <div className="relative size-[132px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="revenue"
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
                    typeof value === "number" ? formatBaht(value) : "—",
                    name,
                  ]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold tabular-nums text-neutral-950 dark:text-white">
                ฿{formatCompact(total)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">revenue</span>
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-[13px]">
            {slices.map((slice) => (
              <li key={slice.key} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: slice.color }} />
                <span className="flex-1 text-neutral-700 dark:text-neutral-300">{slice.label}</span>
                <span className="font-semibold tabular-nums text-neutral-950 dark:text-white">
                  {formatPercent((slice.revenue / total) * 100, 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <CardEmptyState message="No revenue in this period" />
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        {(
          [
            ["New buyers", buyers.new, "first paid order"],
            ["Returning buyers", buyers.returning, "bought before"],
          ] as const
        ).map(([label, value, note]) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
            <span className="text-xl font-bold tabular-nums text-neutral-950 dark:text-white">
              {formatNumber(value)}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{note}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
