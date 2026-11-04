import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatBaht, formatDateTime, formatNumber, formatPercent } from "../../lib/format";
import { CampaignRow } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";
import { BROADCAST_STATUS_META, MESSAGE_TYPE_LABELS } from "./broadcast-meta";

const th = "border-b border-neutral-100 px-2.5 py-2 font-medium dark:border-neutral-800";
const td = "border-b border-neutral-100 px-2.5 py-3 dark:border-neutral-800";

const percent = (value: number | null) => (value === null ? "—" : formatPercent(value));

interface CampaignTableProps {
  campaigns: CampaignRow[];
  total: number;
}

export function CampaignTable({ campaigns, total }: CampaignTableProps) {
  return (
    <ChartCard
      title="Campaign performance"
      subtitle={
        total > campaigns.length
          ? `Showing ${formatNumber(campaigns.length)} of ${formatNumber(total)} campaigns`
          : `${formatNumber(total)} campaign${total === 1 ? "" : "s"}`
      }
      className="flex-[1_1_100%]"
      action={
        <Link href="/broadcasts" className="text-[13px] font-semibold text-[#047A35] hover:underline">
          Open Broadcasts
        </Link>
      }
    >
      {campaigns.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-neutral-500 dark:text-neutral-400">
                <th className={th}>Campaign</th>
                <th className={th}>Audience</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Sent</th>
                <th className={th}>Delivered</th>
                <th className={`${th} text-right`}>Click rate</th>
                <th className={`${th} text-right`}>Orders</th>
                <th className={`${th} text-right`}>Revenue</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700 dark:text-neutral-300">
              {campaigns.map((campaign) => {
                const status = BROADCAST_STATUS_META[campaign.status];
                return (
                  <tr key={campaign.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className={td}>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/broadcasts/${campaign.id}`}
                          className="font-semibold text-neutral-950 hover:underline dark:text-white"
                        >
                          {campaign.name}
                        </Link>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {MESSAGE_TYPE_LABELS[campaign.messageType] ?? campaign.messageType} ·{" "}
                          {formatDateTime(campaign.date)}
                        </span>
                      </div>
                    </td>
                    <td className={td}>{campaign.segment.label}</td>
                    <td className={td}>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          status?.badge,
                        )}
                      >
                        <span className="size-1.5 rounded-full" style={{ background: status?.color }} />
                        {status?.label ?? campaign.status}
                      </span>
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{formatNumber(campaign.sent)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 min-w-[60px] flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div
                            className="h-full bg-chart-blue-600"
                            style={{ width: `${campaign.deliveryRate ?? 0}%` }}
                          />
                        </div>
                        <span className="w-12 text-right tabular-nums">{percent(campaign.deliveryRate)}</span>
                      </div>
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{percent(campaign.clickRate)}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatNumber(campaign.orders)}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-neutral-950 dark:text-white`}>
                      {formatBaht(campaign.revenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <CardEmptyState message="No campaigns match these filters" />
      )}
    </ChartCard>
  );
}
