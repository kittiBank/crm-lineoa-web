import { CircleCheck, Gauge, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "./metrics-section";
import { MessageQuota } from "../types";

interface QuotaSectionProps {
  quota: MessageQuota | null;
  loading?: boolean;
}

function formatCount(value: number | null, unlimited: boolean) {
  if (unlimited) {
    return "Unlimited";
  }

  if (value == null) {
    return "—";
  }

  return value.toLocaleString();
}

/**
 * Current LINE message quota cards for the Broadcast list page.
 */
export function QuotaSection({ quota, loading = false }: QuotaSectionProps) {
  if (loading) {
    return (
      <section
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-3 flex items-start justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
            <Skeleton className="mb-3 h-9 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </section>
    );
  }

  if (!quota) {
    return (
      <section className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        Connect a LINE Official Account in Settings to see current message
        quota.
      </section>
    );
  }

  const unlimited = quota.quotaType === "none" || quota.quota == null;
  const percentUsed =
    !unlimited && quota.quota && quota.quota > 0
      ? Math.min(100, (quota.used / quota.quota) * 100)
      : 0;
  const percentRemaining = unlimited ? 0 : Math.max(0, 100 - percentUsed);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="Quota"
        value={formatCount(quota.quota, unlimited)}
        footer="Current monthly LINE message quota"
        footerEnd={quota.resetLabel}
        icon={<Gauge className="h-5 w-5" />}
      />
      <MetricCard
        title="Used"
        value={quota.used.toLocaleString()}
        subtext={
          unlimited ? "Messages sent this month" : `${percentUsed.toFixed(1)}% of quota`
        }
        subtextPlacement="end"
        icon={<Send className="h-5 w-5" />}
        progress={
          !unlimited && quota.quota != null
            ? { current: quota.used, total: quota.quota }
            : undefined
        }
      />
      <MetricCard
        title="Remaining"
        value={formatCount(quota.remaining, unlimited)}
        subtext={
          unlimited ? "No monthly cap" : `${percentRemaining.toFixed(1)}% remaining`
        }
        subtextPlacement="end"
        icon={<CircleCheck className="h-5 w-5" />}
        progress={
          !unlimited && quota.quota != null && quota.remaining != null
            ? { current: quota.remaining, total: quota.quota }
            : undefined
        }
      />
    </section>
  );
}
