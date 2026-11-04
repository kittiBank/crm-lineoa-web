"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBaht, formatCompact, formatNumber } from "../../lib/format";
import { SalesSeriesPoint } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const COLORS = { revenue: "#2563EB", orders: "#93C5FD" };
const TOOLTIP_STYLE = { borderRadius: 8, border: "1px solid #E5E5E5", fontSize: 12 };

interface RevenueOrdersChartProps {
  data: SalesSeriesPoint[];
  /** Data cut-off; later buckets are left empty. */
  rangeEnd: string;
}

export function RevenueOrdersChart({ data, rangeEnd }: RevenueOrdersChartProps) {
  const cutoff = new Date(rangeEnd).getTime();
  const points = data.map((point) => {
    const future = new Date(point.start).getTime() > cutoff;
    return {
      label: point.label,
      revenue: future ? null : point.revenue,
      orders: future ? null : point.orders,
    };
  });
  const revenue = data.reduce((sum, p) => sum + p.revenue, 0);
  const orders = data.reduce((sum, p) => sum + p.orders, 0);
  const tickInterval = points.length > 12 ? Math.ceil(points.length / 6) - 1 : 0;
  const syncId = "sales-revenue-orders";

  return (
    <ChartCard
      title="Revenue & orders"
      subtitle={`${formatBaht(revenue)} from ${formatNumber(orders)} orders`}
      action={
        <div className="flex gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-3.5 rounded-sm" style={{ background: COLORS.revenue }} />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: COLORS.orders }} />
            Orders
          </span>
        </div>
      }
    >
      {orders > 0 ? (
        <div className="flex flex-col">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} syncId={syncId} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={COLORS.revenue} stopOpacity={0.2} />
                    <stop offset="1" stopColor={COLORS.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EDEDED" className="dark:stroke-neutral-800" />
                <XAxis dataKey="label" hide />
                <YAxis
                  width={52}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6B6B6B" }}
                  tickFormatter={(v: number) => `฿${formatCompact(v)}`}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === "number" ? formatBaht(value) : "—",
                    "Revenue",
                  ]}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.revenue}
                  strokeWidth={2.5}
                  fill="url(#salesRevenueArea)"
                  dot={false}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} syncId={syncId} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  interval={tickInterval}
                  tickLine={false}
                  axisLine={{ stroke: "#D4D4D4" }}
                  tick={{ fontSize: 11, fill: "#6B6B6B" }}
                />
                <YAxis
                  width={52}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickCount={2}
                  tick={{ fontSize: 11, fill: "#6B6B6B" }}
                  tickFormatter={formatCompact}
                />
                <Tooltip
                  formatter={(value) => [
                    typeof value === "number" ? formatNumber(value) : "—",
                    "Orders",
                  ]}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="orders" fill={COLORS.orders} radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <CardEmptyState message="No orders in this period" />
      )}
    </ChartCard>
  );
}
