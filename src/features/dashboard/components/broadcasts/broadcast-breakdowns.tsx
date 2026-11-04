import { formatBaht, formatCompact, formatNumber, formatPercent } from "../../lib/format";
import { DashboardBroadcasts } from "../../types";
import { BarList } from "../bar-list";
import { CardEmptyState, ChartCard } from "../chart-card";
import { MESSAGE_TYPE_LABELS } from "./broadcast-meta";

const TYPE_COLORS = ["#1E3A8A", "#2563EB", "#60A5FA", "#93C5FD", "#BFDBFE"];

export function ClickRateByType({
  rows,
}: {
  rows: DashboardBroadcasts["byMessageType"];
}) {
  const measurable = rows.filter((row) => row.delivered > 0);

  return (
    <ChartCard title="Click rate by message type" subtitle="Clicks ÷ delivered" size="narrow">
      {measurable.length ? (
        <BarList
          items={measurable.map((row, index) => ({
            key: row.messageType,
            label: MESSAGE_TYPE_LABELS[row.messageType] ?? row.messageType,
            value: row.clickRate ?? 0,
            display: formatPercent(row.clickRate ?? 0),
            color: TYPE_COLORS[Math.min(index, TYPE_COLORS.length - 1)],
            hint: `${formatNumber(row.clicks)} clicks / ${formatNumber(row.delivered)} delivered · ${row.broadcasts} broadcasts`,
          }))}
        />
      ) : (
        <CardEmptyState message="No delivered broadcasts in this period" />
      )}
    </ChartCard>
  );
}

export function RevenueBySegment({
  rows,
}: {
  rows: DashboardBroadcasts["bySegment"];
}) {
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);

  return (
    <ChartCard
      title="Revenue by audience segment"
      subtitle="Orders within 72h of a broadcast click"
      size="narrow"
    >
      {total > 0 ? (
        <BarList
          items={rows
            .filter((row) => row.revenue > 0)
            .map((row) => ({
              key: row.segment,
              label: row.label,
              value: row.revenue,
              display: `฿${formatCompact(row.revenue)}`,
              hint: `${formatBaht(row.revenue)} · ${formatNumber(row.orders)} orders · ${row.broadcasts} broadcasts`,
            }))}
        />
      ) : (
        <CardEmptyState message="No attributed orders in this period" />
      )}
    </ChartCard>
  );
}
