import { Eye, MousePointerClick, Percent, Send, Target } from "lucide-react";
import { MetricCard } from "../metrics-section";
import { BroadcastTrackingSummary } from "../../types/tracking";

const HIDDEN_BY_LINE = "Hidden by LINE (<20 users) or not synced yet";

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
  const { metrics, insight } = summary;
  const iconClassName = "h-5 w-5";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Reach"
        value={formatCount(metrics.reach)}
        subtext={
          metrics.failed > 0
            ? `${metrics.failed.toLocaleString()} failed to deliver`
            : "Delivered to LINE users"
        }
        footer={
          insight?.delivered !== null && insight?.delivered !== undefined
            ? `LINE delivered: ${insight.delivered.toLocaleString()}`
            : undefined
        }
        icon={<Send className={iconClassName} />}
      />
      <MetricCard
        title="Read"
        value={formatCount(metrics.read)}
        subtext={
          metrics.read === null
            ? HIDDEN_BY_LINE
            : `${formatRate(metrics.readRate)} of reach · from LINE`
        }
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
        subtext="LINE users who tapped a link"
        footer={
          insight?.uniqueClick !== null && insight?.uniqueClick !== undefined
            ? `LINE: ${insight.uniqueClick.toLocaleString()}`
            : undefined
        }
        icon={<Target className={iconClassName} />}
      />
      <MetricCard
        title="Total clicks"
        value={formatCount(metrics.totalClicks)}
        subtext={
          metrics.anonymousClicks > 0
            ? `incl. ${metrics.anonymousClicks.toLocaleString()} unidentified`
            : "All link taps"
        }
        icon={<MousePointerClick className={iconClassName} />}
      />
      <MetricCard
        title="Click rate"
        value={formatRate(metrics.clickRate)}
        subtext="Unique clicks ÷ reach"
        icon={<Percent className={iconClassName} />}
        progress={{ current: metrics.uniqueClicks, total: metrics.reach }}
      />
    </div>
  );
}
