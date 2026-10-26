import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const dashboardCardClass =
  "rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900";

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** `wide` = flex 2 1 520px, `narrow` = flex 1 1 300px (design row layout). */
  size?: "wide" | "narrow";
  className?: string;
  children: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  action,
  size = "wide",
  className,
  children,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex min-w-0 flex-col gap-4 p-5",
        size === "wide" ? "flex-[2_1_520px]" : "flex-[1_1_300px]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CardEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[160px] flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-200 px-4 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      {message}
    </div>
  );
}
