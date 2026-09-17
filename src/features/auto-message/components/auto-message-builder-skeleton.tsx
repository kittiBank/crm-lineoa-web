import { Skeleton } from "@/components/ui/skeleton";

export function AutoMessageBuilderSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-64 max-w-full" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Skeleton className="mb-1.5 h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-4 w-16" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="mt-1.5 h-3 w-56 max-w-full" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Skeleton className="mb-1.5 h-4 w-20" />
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 p-2 dark:border-gray-600">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 flex-1 min-w-24" />
              </div>
            </div>
            <div>
              <Skeleton className="mb-1.5 h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Skeleton className="mb-4 h-6 w-44" />
          <div>
            <Skeleton className="mb-1.5 h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-1.5 h-3 w-48 max-w-full" />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}
