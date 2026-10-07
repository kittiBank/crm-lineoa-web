import { Download, Eye, Loader2, Trash2 } from "lucide-react";
import {
  AudienceImportJob,
  AudienceImportJobResult,
  AudienceImportRowStatus,
} from "../types/audience-import";

interface ImportJobTableProps {
  jobs: AudienceImportJob[];
  startIndex: number;
  isLoading: boolean;
  hasSearch: boolean;
  downloadingJobId: string | null;
  onDownload: (job: AudienceImportJob) => void;
  onView: (job: AudienceImportJob) => void;
  onDelete: (job: AudienceImportJob) => void;
}

const headerClassName =
  "px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300";

const actionButtonClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";

const STATUS_STYLES: Record<AudienceImportJobResult, string> = {
  PASS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PROCESSING:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_LABELS: Record<AudienceImportJobResult, string> = {
  PASS: "Pass",
  FAILED: "Failed",
  PROCESSING: "Processing",
};

export function formatImportDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ImportStatusBadge({
  status,
}: {
  status: AudienceImportJobResult | AudienceImportRowStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status === "PROCESSING" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}

function RowCounts({ job }: { job: AudienceImportJob }) {
  if (job.result === "PROCESSING") {
    return null;
  }

  if (job.totalRows === 0) {
    return job.failureReason ? (
      <div
        className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400"
        title={job.failureReason}
      >
        {job.failureReason}
      </div>
    ) : null;
  }

  return (
    <div className="mt-1 text-xs text-gray-500 tabular-nums dark:text-gray-400">
      {job.passRows.toLocaleString()} / {job.totalRows.toLocaleString()} passed
    </div>
  );
}

export function ImportJobTable({
  jobs,
  startIndex,
  isLoading,
  hasSearch,
  downloadingJobId,
  onDownload,
  onView,
  onDelete,
}: ImportJobTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className={`${headerClassName} w-16`}>No</th>
              <th className={headerClassName}>File Name</th>
              <th className={headerClassName}>Import Date</th>
              <th className={headerClassName}>Status</th>
              <th className={`${headerClassName} w-32 text-right`}>Action</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {jobs.map((job, index) => {
              const isProcessing = job.result === "PROCESSING";
              const isDownloading = downloadingJobId === job.id;

              return (
                <tr
                  key={job.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {startIndex + index + 1}
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    <div
                      className="truncate text-sm font-medium text-gray-900 dark:text-white"
                      title={job.fileName}
                    >
                      {job.fileName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {formatImportDate(job.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ImportStatusBadge status={job.result} />
                    <RowCounts job={job} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onDownload(job)}
                        disabled={!job.hasResult || isDownloading}
                        className={actionButtonClassName}
                        aria-label={`Download result of ${job.fileName}`}
                        title={
                          job.hasResult
                            ? "Download result (.xlsx)"
                            : isProcessing
                              ? "Available when the import finishes"
                              : "Result not available for this import"
                        }
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(job)}
                        className={actionButtonClassName}
                        aria-label={`View ${job.fileName}`}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(job)}
                        disabled={isProcessing}
                        className={`${actionButtonClassName} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400`}
                        aria-label={`Delete ${job.fileName}`}
                        title={
                          isProcessing
                            ? "Available when the import finishes"
                            : "Delete"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading imports...
            </>
          ) : hasSearch ? (
            "No file name matches your search."
          ) : (
            "No imports yet. Download the template, fill in telNo and userTier, then import it."
          )}
        </div>
      ) : null}
    </div>
  );
}
