"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCompact, formatNumber, formatPercent } from "../../lib/format";
import { DashboardUserFilters, DashboardUsers } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const TIER_COLORS: Record<string, string> = {
  Platinum: "#1E3A8A",
  Gold: "#2563EB",
  Silver: "#60A5FA",
  Member: "#BFDBFE",
};

const TIER_LABELS: Record<string, string> = {
  Member: "Member (no tier)",
};

const DIMMED = 0.25;

type Part = { key: string; label: string; count: number; color: string; selected: boolean };

function share(count: number, total: number): string {
  return total > 0 ? formatPercent((count / total) * 100, 0) : "—";
}

function StackedBar({ title, parts }: { title: string; parts: Part[] }) {
  const total = parts.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
        {title}
      </span>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        {total > 0 &&
          parts.map((part) => (
            <div
              key={part.key}
              title={`${part.label}: ${formatNumber(part.count)}`}
              style={{
                width: `${(part.count / total) * 100}%`,
                background: part.color,
                opacity: part.selected ? 1 : DIMMED,
              }}
            />
          ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        {parts.map((part) => (
          <span key={part.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: part.color }} />
            {part.label}
            <strong className="tabular-nums text-neutral-950 dark:text-white">
              {share(part.count, total)}
            </strong>
          </span>
        ))}
      </div>
    </div>
  );
}

interface MembersBreakdownProps {
  breakdown: DashboardUsers["breakdown"];
  filters: DashboardUserFilters;
}

export function MembersBreakdown({ breakdown, filters }: MembersBreakdownProps) {
  const isSelected = (value: string | undefined, key: string) => !value || value === key;

  const tiers = breakdown.tiers.map((row) => ({
    key: row.tier,
    label: TIER_LABELS[row.tier] ?? row.tier,
    count: row.count,
    color: TIER_COLORS[row.tier],
    selected: isSelected(filters.tier, row.tier),
  }));
  const selectedMembers = tiers
    .filter((t) => t.selected)
    .reduce((sum, t) => sum + t.count, 0);

  const userTypes: Part[] = breakdown.userType.map((row) => ({
    key: row.userType,
    label: row.userType,
    count: row.count,
    color: row.userType === "Member" ? "#2563EB" : "#D4D4D4",
    selected: isSelected(filters.userType, row.userType),
  }));
  const statuses: Part[] = breakdown.status.map((row) => ({
    key: row.status,
    label: row.status === "following" ? "Following" : "Unfollowed / blocked",
    count: row.count,
    color: row.status === "following" ? "#2563EB" : "#93C5FD",
    selected: isSelected(filters.status, row.status),
  }));

  return (
    <ChartCard
      title="Members by tier"
      subtitle="Effective tier (12-month spend or assigned)"
      size="narrow"
    >
      {breakdown.members > 0 ? (
        <div className="flex items-center gap-5">
          <div className="relative size-[132px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tiers}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {tiers.map((tier) => (
                    <Cell
                      key={tier.key}
                      fill={tier.color}
                      fillOpacity={tier.selected ? 1 : DIMMED}
                    />
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
                {formatCompact(selectedMembers)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">members</span>
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-[13px]">
            {tiers.map((tier) => (
              <li
                key={tier.key}
                className="flex items-center gap-2"
                style={{ opacity: tier.selected ? 1 : 0.5 }}
              >
                <span className="size-2.5 rounded-full" style={{ background: tier.color }} />
                <span className="flex-1 text-neutral-700 dark:text-neutral-300">{tier.label}</span>
                <span className="font-semibold tabular-nums text-neutral-950 dark:text-white">
                  {share(tier.count, breakdown.members)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <CardEmptyState message="No members match these filters" />
      )}

      <div className="flex flex-col gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <StackedBar title="User type" parts={userTypes} />
        <StackedBar title="Status" parts={statuses} />
      </div>
    </ChartCard>
  );
}
