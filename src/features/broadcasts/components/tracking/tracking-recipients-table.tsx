import { Download, Loader2, Search } from "lucide-react";
import { Pagination } from "../pagination";
import {
  UserTierBadge,
  UserTypeBadge,
} from "@/features/line-users/components/line-user-table";
import { UserTier } from "@/features/line-users/types";
import {
  BroadcastTrackingRecipientsResponse,
  TrackingRecipientFilter,
} from "../../types/tracking";

const FILTERS: { value: TrackingRecipientFilter; label: string }[] = [
  { value: "all", label: "All reached" },
  { value: "clicked", label: "Clicked" },
  { value: "not_clicked", label: "Not clicked" },
];

const headerClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300";

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

interface TrackingRecipientsTableProps {
  result: BroadcastTrackingRecipientsResponse | null;
  isLoading: boolean;
  filter: TrackingRecipientFilter;
  search: string;
  isExporting: boolean;
  onFilterChange: (filter: TrackingRecipientFilter) => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onExport: () => void;
}

/** Per LINE user: did the broadcast reach them and did they click. */
export function TrackingRecipientsTable({
  result,
  isLoading,
  filter,
  search,
  isExporting,
  onFilterChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onExport,
}: TrackingRecipientsTableProps) {
  const rows = result?.data ?? [];
  const meta = result?.meta;
  const startIndex = meta ? (meta.page - 1) * meta.limit : 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recipients
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Who the broadcast reached and who clicked. LINE does not share
              which users read a message.
            </p>
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting || !meta?.total}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export .xlsx
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange(item.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === item.value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
                <span className="ml-1.5 opacity-80">
                  {(result?.counts[item.value] ?? 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name or LINE user ID"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-800/60">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        )}
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className={`${headerClassName} w-16`}>No.</th>
              <th className={headerClassName}>LINE user</th>
              <th className={headerClassName}>Type</th>
              <th className={headerClassName}>Tier</th>
              <th className={`${headerClassName} text-right`}>Clicks</th>
              <th className={headerClassName}>First click</th>
              <th className={headerClassName}>Last click</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.pictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.pictureUrl}
                          alt={row.displayName ?? "LINE user"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {row.displayName ?? "Unknown user"}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {row.lineUserId ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.userType ? (
                      <UserTypeBadge userType={row.userType} />
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <UserTierBadge userTier={row.userTier as UserTier | null} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {row.clickCount > 0 ? row.clickCount.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(row.firstClickedAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(row.lastClickedAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {isLoading ? "Loading recipients..." : "No recipients match"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 ? (
        <Pagination
          variant="embedded"
          itemLabel="recipients"
          currentPage={meta.page}
          totalPages={Math.max(meta.totalPages, 1)}
          totalItems={meta.total}
          itemsPerPage={meta.limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onPageSizeChange}
        />
      ) : null}
    </section>
  );
}
