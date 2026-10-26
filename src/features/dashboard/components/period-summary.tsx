import { CalendarDays } from "lucide-react";
import { describePeriod } from "../lib/format";
import { DashboardPeriod, DashboardRange } from "../types";

export function PeriodSummary({
  period,
  range,
}: {
  period: DashboardPeriod;
  range: DashboardRange;
}) {
  const info = describePeriod(period, range);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-neutral-600 dark:text-neutral-400">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="size-[15px]" />
        <strong className="text-neutral-950 dark:text-white">{info.title}</strong>
        <span className="tabular-nums">{info.range}</span>
      </span>
      <span>% compared with {info.previous}</span>
    </div>
  );
}
