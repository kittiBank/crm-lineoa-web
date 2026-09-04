import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

const cardClassName =
  "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6";

export function DashboardSkeleton() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", isActive: true },
  ];

  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={cardClassName}>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={`lg:col-span-2 ${cardClassName}`}>
          <Skeleton className="mb-6 h-6 w-40" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        <div className={cardClassName}>
          <Skeleton className="mb-6 h-6 w-36" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-48 w-48 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="hidden h-4 w-16 sm:block" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
