import { Eye, MousePointerClick, Percent, Send, Target } from "lucide-react";
import { MetricCard } from "../metrics-section";
import { BroadcastTrackingSummary } from "../../types/tracking";

function formatCount(value: number | null): string {
  return value === null ? "—" : value.toLocaleString();
}

function formatRate(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

interface TrackingMetricsProps {
  summary: BroadcastTrackingSummary;
}

/** KPI row: reach, read, unique clicks, total clicks, click rate. */
export function TrackingMetrics({ summary }: TrackingMetricsProps) {
  const { metrics } = summary;
  const iconClassName = "h-5 w-5";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Reach"
        value={formatCount(metrics.reach)}
        info="LINE users the broadcast was delivered to."
        icon={<Send className={iconClassName} />}
      />
      <MetricCard
        title="Read"
        value={formatCount(metrics.read)}
        info="Users who opened the message (includes users who clicked)."
        icon={<Eye className={iconClassName} />}
        progress={
          metrics.read !== null
            ? { current: metrics.read, total: metrics.reach }
            : undefined
        }
      />
      <MetricCard
        title="Unique clicks"
        value={formatCount(metrics.uniqueClicks)}
        info="Users who tapped at least once."
        icon={<Target className={iconClassName} />}
      />
      <MetricCard
        title="Total clicks"
        value={formatCount(metrics.totalClicks)}
        info="Every tap, including repeats by the same user."
        icon={<MousePointerClick className={iconClassName} />}
      />
      <MetricCard
        title="Click rate"
        value={formatRate(metrics.clickRate)}
        info="Unique clicks ÷ reach."
        icon={<Percent className={iconClassName} />}
        progress={{ current: metrics.uniqueClicks, total: metrics.reach }}
      />
    </div>
  );
}
