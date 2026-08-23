import { TrendingUp, BarChart3, Clock } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  subtextPlacement?: "below" | "end";
  footer?: string;
  footerEnd?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: {
    current: number;
    total: number;
  };
}

/**
 * Single metric card component
 * Displays a key metric with value and optional trend
 */
export function MetricCard({
  title,
  value,
  subtext,
  subtextPlacement = "below",
  footer,
  footerEnd,
  icon,
  trend,
  progress,
}: MetricsCardProps) {
  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.max(0, (progress.current / progress.total) * 100))
      : 0;
  const showInlineSubtext = Boolean(subtext) && !trend && subtextPlacement === "end";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
        </div>
        {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
      </div>

      {/* Value */}
      <div className={showInlineSubtext ? "mb-0" : "mb-3"}>
        <div
          className={
            showInlineSubtext
              ? "flex items-baseline justify-between gap-3"
              : undefined
          }
        >
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {showInlineSubtext ? (
            <p className="shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
              {subtext}
            </p>
          ) : null}
        </div>
      </div>

      {/* Subtext or Trend */}
      {trend ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span
            className={
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>{" "}
          vs last month
        </p>
      ) : (
        subtext &&
        !showInlineSubtext && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtext}</p>
        )
      )}

      {progress && progress.total > 0 ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-right text-xs text-gray-500 dark:text-gray-400">
            ({progress.current.toLocaleString()}/{progress.total.toLocaleString()})
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {footer || footerEnd ? (
        <div className="mt-3 flex items-baseline justify-between gap-3">
          {footer ? (
            <p className="text-left text-xs text-gray-500 dark:text-gray-400">
              {footer}
            </p>
          ) : (
            <span />
          )}
          {footerEnd ? (
            <p className="shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
              {footerEnd}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface MetricsSectionProps {
  totalSent: number;
  percentageChange: number;
  averageReadRate: number;
  readRatePercentageChange: number;
  activeScheduled: number;
  nextBroadcastTime: string;
}

/**
 * Metrics section component
 * Displays multiple key metrics in a grid
 */
export function MetricsSection({
  totalSent,
  percentageChange,
  averageReadRate,
  readRatePercentageChange,
  activeScheduled,
  nextBroadcastTime,
}: MetricsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      {/* Total Sent This Month */}
      <MetricCard
        title="Total Sent This Month"
        value={totalSent.toLocaleString()}
        trend={{
          value: percentageChange,
          isPositive: percentageChange > 0,
        }}
        icon={<BarChart3 className="w-5 h-5" />}
      />

      {/* Average Read Rate */}
      <MetricCard
        title="Average Read Rate"
        value={`${averageReadRate.toFixed(1)}%`}
        trend={{
          value: readRatePercentageChange,
          isPositive: readRatePercentageChange >= 0,
        }}
        icon={<TrendingUp className="w-5 h-5" />}
      />

      {/* Active Scheduled */}
      <MetricCard
        title="Active Scheduled"
        value={activeScheduled}
        subtext={`Next broadcast in ${nextBroadcastTime}`}
        icon={<Clock className="w-5 h-5" />}
      />
    </div>
  );
}
