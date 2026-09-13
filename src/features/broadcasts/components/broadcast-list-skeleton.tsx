import { Skeleton } from "@/components/ui/skeleton";

const TABLE_HEADERS = [
  "Campaign Name",
  "Target Audience",
  "Template",
  "Status",
  "Performance",
  "Actions",
] as const;

function MetricCardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 flex items-start justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
          <Skeleton className="mb-3 h-9 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export function BroadcastListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40 shrink-0" />
      </div>

      <MetricCardsSkeleton count={3} />

      <div className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="space-y-2 md:col-span-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <tr>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-4 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300 ${
                      header === "Actions" ? "text-center" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-14" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      <div className="mt-2">
        <MetricCardsSkeleton count={3} />
      </div>
    </div>
  );
}
