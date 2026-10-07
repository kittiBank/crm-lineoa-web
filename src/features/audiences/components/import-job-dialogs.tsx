"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchAudienceImportRows } from "../lib/audience-import-api";
import {
  AudienceImportJob,
  AudienceImportRow,
  AudienceImportRowStatus,
} from "../types/audience-import";
import { formatImportDate, ImportStatusBadge } from "./import-job-table";

const ROWS_PER_PAGE = 20;

type RowFilter = AudienceImportRowStatus | "ALL";

const ROW_FILTERS: { value: RowFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PASS", label: "Pass" },
  { value: "FAILED", label: "Failed" },
];

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "success" | "danger";
}) {
  const toneClassName = {
    neutral: "text-gray-900 dark:text-white",
    success: "text-green-600 dark:text-green-400",
    danger: "text-red-600 dark:text-red-400",
  }[tone];

  return (
    <div className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${toneClassName}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export function DangerAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function RowNote({ row }: { row: AudienceImportRow }) {
  if (row.status === "FAILED") {
    return (
      <span className="text-red-600 dark:text-red-400">{row.errorNote}</span>
    );
  }

  return row.lineUserMatched ? (
    <span className="text-green-700 dark:text-green-400">
      LINE user linked, tier updated
    </span>
  ) : (
    <span className="text-gray-500 dark:text-gray-400">
      Not linked yet (applied on LINE OTP login)
    </span>
  );
}

function ImportRowsTable({ job }: { job: AudienceImportJob }) {
  const [filter, setFilter] = useState<RowFilter>("ALL");
  const [page, setPage] = useState(1);
  // The last loaded page, tagged with its query; stale while a new one loads.
  const [loaded, setLoaded] = useState<{
    key: string;
    rows: AudienceImportRow[];
    totalPages: number;
    error: string | null;
  } | null>(null);

  const queryKey = `${filter}:${page}`;
  const isLoading = loaded?.key !== queryKey;
  const rows = loaded?.rows ?? [];
  const totalPages = loaded?.totalPages ?? 1;
  const error = loaded?.error ?? null;

  useEffect(() => {
    let isCancelled = false;

    fetchAudienceImportRows(job.id, {
      page,
      limit: ROWS_PER_PAGE,
      status: filter === "ALL" ? undefined : filter,
    })
      .then((result) => {
        if (!isCancelled) {
          setLoaded({
            key: queryKey,
            rows: result.data,
            totalPages: Math.max(1, result.meta.totalPages),
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setLoaded({
            key: queryKey,
            rows: [],
            totalPages: 1,
            error: err instanceof Error ? err.message : "Failed to load rows",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [job.id, filter, page, queryKey]);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {ROW_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setFilter(option.value);
              setPage(1);
            }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === option.value
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error ? <DangerAlert>{error}</DangerAlert> : null}

      <div className="max-h-80 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
            <tr className="text-gray-600 dark:text-gray-300">
              <th className="px-3 py-2 font-semibold">Row</th>
              <th className="px-3 py-2 font-semibold">Tel No</th>
              <th className="px-3 py-2 font-semibold">User Tier</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-100 dark:divide-gray-800 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {rows.map((row) => (
              <tr key={row.rowNumber}>
                <td className="px-3 py-2 text-gray-600 tabular-nums dark:text-gray-400">
                  {row.rowNumber}
                </td>
                <td className="px-3 py-2 font-mono text-gray-900 dark:text-white">
                  {row.rawPhone || (
                    <span className="text-gray-400">(empty)</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-gray-900 dark:text-white">
                  {row.rawTier || (
                    <span className="text-gray-400">(empty)</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <ImportStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2">
                  <RowNote row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-8 text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading rows...
              </>
            ) : (
              "No rows."
            )}
          </div>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-xs text-gray-600 dark:text-gray-400">
          <button
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={page <= 1 || isLoading}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= totalPages || isLoading}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface ViewImportJobDialogProps {
  job: AudienceImportJob | null;
  isDownloading: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (job: AudienceImportJob) => void;
}

export function ViewImportJobDialog({
  job,
  isDownloading,
  onOpenChange,
  onDownload,
}: ViewImportJobDialogProps) {
  return (
    <Dialog open={Boolean(job)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{job?.fileName}</DialogTitle>
          <DialogDescription>
            {job ? `Imported ${formatImportDate(job.createdAt)}` : null}
          </DialogDescription>
        </DialogHeader>

        {job ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              Status <ImportStatusBadge status={job.result} />
            </div>

            {job.result === "PROCESSING" ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This import is still processing. Results show up when it
                finishes.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="Total records"
                    value={job.totalRows}
                    tone="neutral"
                  />
                  <StatCard label="Pass" value={job.passRows} tone="success" />
                  <StatCard
                    label="Failed"
                    value={job.failedRows}
                    tone="danger"
                  />
                </div>

                {job.failureReason ? (
                  <DangerAlert>{job.failureReason}</DangerAlert>
                ) : null}

                {job.hasResult ? (
                  // Keyed so filter and page reset per job.
                  <ImportRowsTable key={job.id} job={job} />
                ) : !job.failureReason ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Row details are not available for this import.
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {job?.hasResult ? (
            <Button onClick={() => onDownload(job)} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Download data-icon="inline-start" />
              )}
              Download result
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteImportJobDialogProps {
  job: AudienceImportJob | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteImportJobDialog({
  job,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteImportJobDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(job)}
      onOpenChange={onOpenChange}
      title="Delete Import"
      description={
        <>
          Delete the import log for{" "}
          <span className="font-medium break-all text-gray-900 dark:text-white">
            {job?.fileName}
          </span>
          ? Its result file is removed too. User tiers it applied are kept.
        </>
      }
      variant="destructive"
      confirmLabel="Delete"
      loadingLabel="Deleting..."
      isLoading={isDeleting}
      onConfirm={onConfirm}
      showCloseButton={!isDeleting}
    />
  );
}
