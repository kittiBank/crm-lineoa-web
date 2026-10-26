import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dashboardCardClass } from "./chart-card";

/** Body skeleton for a dashboard tab; the header and tabs stay rendered. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-80 max-w-full" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={cn(dashboardCardClass, "space-y-3 p-4")}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {Array.from({ length: 2 }).map((_, row) => (
        <div key={row} className="flex flex-wrap gap-4">
          <div className={cn(dashboardCardClass, "flex-[2_1_520px] space-y-4 p-5")}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-[240px] w-full" />
          </div>
          <div className={cn(dashboardCardClass, "flex-[1_1_300px] space-y-4 p-5")}>
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 4 }).map((__, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
