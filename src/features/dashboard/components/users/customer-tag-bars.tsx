import Link from "next/link";
import { CUSTOMER_TAG_DEFINITIONS } from "@/constants/customer-tag";
import { formatNumber } from "../../lib/format";
import { DashboardUsers } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const GROUP_COLORS: Record<string, string> = {
  new: "#93C5FD",
  purchase: "#93C5FD",
  repeat: "#2563EB",
  window: "#2563EB",
  spend: "#1E3A8A",
};

export function CustomerTagBars({ tags }: { tags: DashboardUsers["tags"] }) {
  const max = Math.max(0, ...tags.map((t) => t.count));

  return (
    <ChartCard
      title="Customer tags"
      subtitle="Auto tags from shop orders"
      size="narrow"
      action={
        <Link
          href="/audiences"
          className="text-[13px] font-semibold text-[#047A35] hover:underline"
        >
          Build segment
        </Link>
      }
    >
      {max > 0 ? (
        <ul className="flex flex-col gap-3">
          {tags.map(({ tag, count }) => {
            const definition = CUSTOMER_TAG_DEFINITIONS[tag];
            return (
              <li key={tag} className="flex flex-col gap-1.5" title={definition.description}>
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="text-neutral-700 dark:text-neutral-300">{definition.label}</span>
                  <span className="font-semibold tabular-nums text-neutral-950 dark:text-white">
                    {formatNumber(count)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / max) * 100}%`,
                      background: GROUP_COLORS[definition.group],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <CardEmptyState message="No tagged customers yet" />
      )}
    </ChartCard>
  );
}
