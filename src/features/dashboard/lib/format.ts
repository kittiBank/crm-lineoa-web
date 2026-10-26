import {
  Comparison,
  DASHBOARD_PERIOD_OPTIONS,
  DashboardPeriod,
  DashboardRange,
} from "../types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TIME_ZONE = "Asia/Bangkok";

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function formatBaht(value: number): string {
  return `฿${formatNumber(value)}`;
}

/** 1240 → "1.2k", 48210 → "48k", 1_500_000 → "1.5M". */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, "")}k`;
  }
  return String(Math.round(value));
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export type Delta = {
  /** Percent change vs previous; null when there is nothing to compare. */
  percent: number | null;
  good: boolean;
};

/** `higherIsBetter=false` for metrics like unfollows or pending payment. */
export function computeDelta(
  { current, previous }: Comparison,
  higherIsBetter = true,
): Delta {
  if (previous === 0) {
    return { percent: null, good: true };
  }

  const percent = ((current - previous) / previous) * 100;
  return { percent, good: percent >= 0 === higherIsBetter };
}

function formatDay(date: Date, withYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(date);
}

/**
 * Header line for the selected range, e.g.
 * { title: "Last 30 days", range: "Sep 27 – Oct 26, 2026",
 *   previous: "the previous 30 days (Aug 28 – Sep 26)" }
 */
export function describePeriod(period: DashboardPeriod, range: DashboardRange) {
  const option = DASHBOARD_PERIOD_OPTIONS.find((o) => o.value === period);
  const start = new Date(range.start);
  const end = new Date(range.end);
  const previousStart = new Date(range.previousStart);
  const previousLast = new Date(start.getTime() - MS_PER_DAY);

  if (period === "today") {
    return {
      title: option?.title ?? "Today",
      range: formatDay(end, true),
      previous: `yesterday (${formatDay(previousStart)})`,
    };
  }

  const days = Math.round((start.getTime() - previousStart.getTime()) / MS_PER_DAY);
  return {
    title: option?.title ?? "",
    range: `${formatDay(start)} – ${formatDay(end, true)}`,
    previous: `the previous ${days} days (${formatDay(previousStart)} – ${formatDay(previousLast)})`,
  };
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
