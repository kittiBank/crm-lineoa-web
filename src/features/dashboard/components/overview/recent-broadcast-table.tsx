import Link from "next/link";
import { formatBaht, formatDateTime, formatNumber, formatPercent } from "../../lib/format";
import { DashboardBroadcastStatus, RecentBroadcast } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const STATUS_STYLES: Record<
  DashboardBroadcastStatus,
  { badge: string; dot: string }
> = {
  Sent: { badge: "bg-[#EFF5FF] text-[#1D4ED8]", dot: "bg-chart-blue-600" },
  Scheduled: { badge: "bg-[#F3F8FF] text-[#1E40AF]", dot: "bg-chart-blue-300" },
  "In Progress": { badge: "bg-[#F3F8FF] text-[#1E40AF]", dot: "bg-chart-blue-400" },
  Failed: { badge: "bg-[#FFF4ED] text-[#B93815]", dot: "bg-[#EA580C]" },
  Draft: { badge: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
};

const th = "border-b border-neutral-100 px-2.5 py-2 font-medium dark:border-neutral-800";
const td = "border-b border-neutral-100 px-2.5 py-3 dark:border-neutral-800";

export function RecentBroadcastTable({ broadcasts }: { broadcasts: RecentBroadcast[] }) {
  return (
    <ChartCard
      title="Recent broadcasts"
      action={
        <Link href="/broadcasts" className="text-[13px] font-semibold text-[#047A35] hover:underline">
          View all
        </Link>
      }
    >
      {broadcasts.length === 0 ? (
        <CardEmptyState message="No broadcasts in this period" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-neutral-500 dark:text-neutral-400">
                <th className={th}>Campaign</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Sent</th>
                <th className={th}>Delivered</th>
                <th className={`${th} text-right`}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((broadcast) => {
                const style = STATUS_STYLES[broadcast.status] ?? STATUS_STYLES.Draft;
                return (
                  <tr key={broadcast.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className={td}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-neutral-950 dark:text-white">
                          {broadcast.campaign}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDateTime(broadcast.date)}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
                      >
                        <span className={`size-1.5 rounded-full ${style.dot}`} />
                        {broadcast.status}
                      </span>
                    </td>
                    <td className={`${td} text-right tabular-nums`}>
                      {broadcast.sent ? formatNumber(broadcast.sent) : "—"}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 min-w-[60px] flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div
                            className="h-full bg-chart-blue-600"
                            style={{ width: `${Math.min(broadcast.deliveredRate, 100)}%` }}
                          />
                        </div>
                        <span className="w-11 text-right tabular-nums">
                          {formatPercent(broadcast.deliveredRate)}
                        </span>
                      </div>
                    </td>
                    <td className={`${td} text-right font-semibold tabular-nums`}>
                      {broadcast.revenue ? formatBaht(broadcast.revenue) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
