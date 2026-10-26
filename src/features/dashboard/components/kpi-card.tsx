import { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Delta, formatPercent } from "../lib/format";
import { dashboardCardClass } from "./chart-card";

export function DeltaBadge({ delta }: { delta: Delta }) {
  if (delta.percent === null) {
    return (
      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        —
      </span>
    );
  }

  const up = delta.percent >= 0;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        delta.good
          ? "bg-[#ECFDF3] text-[#047A35] dark:bg-green-950/40 dark:text-green-400"
          : "bg-[#FFF4ED] text-[#B93815] dark:bg-orange-950/40 dark:text-orange-400",
      )}
    >
      {up ? "▲" : "▼"} {formatPercent(Math.abs(delta.percent))}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: Delta;
  note?: string;
  icon?: ComponentType<{ className?: string }>;
}

export function KpiCard({ label, value, delta, note, icon: Icon }: KpiCardProps) {
  return (
    <div className={cn(dashboardCardClass, "flex flex-col gap-2.5 p-4")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          {label}
        </span>
        {Icon && (
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#EFF5FF] text-chart-blue-600 dark:bg-blue-950/40 dark:text-chart-blue-400">
            <Icon className="size-[15px]" />
          </span>
        )}
      </div>
      <span className="text-[26px] font-bold tracking-tight tabular-nums text-neutral-950 dark:text-white">
        {value}
      </span>
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <DeltaBadge delta={delta} />
        {note && <span>{note}</span>}
      </div>
    </div>
  );
}
