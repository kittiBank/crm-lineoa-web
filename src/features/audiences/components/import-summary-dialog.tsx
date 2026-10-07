"use client";

import { CheckCircle2, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AudienceImportJob } from "../types/audience-import";
import { DangerAlert, StatCard } from "./import-job-dialogs";

interface ImportSummaryDialogProps {
  open: boolean;
  /** Set while the file is uploading, before a job exists. */
  uploadingFileName: string | null;
  job: AudienceImportJob | null;
  pollError: string | null;
  isDownloading: boolean;
  onClose: () => void;
  onRetryPoll: () => void;
  onDownload: (job: AudienceImportJob) => void;
  onViewDetails: (job: AudienceImportJob) => void;
}

function Pending({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{title}</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {detail}
        </div>
      </div>
    </div>
  );
}

function SuccessAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/**
 * Upload progress, then the outcome. Processing runs on the server, so the
 * dialog can be closed at any time; the job stays in the import list.
 */
export function ImportSummaryDialog({
  open,
  uploadingFileName,
  job,
  pollError,
  isDownloading,
  onClose,
  onRetryPoll,
  onDownload,
  onViewDetails,
}: ImportSummaryDialogProps) {
  const isUploading = Boolean(uploadingFileName);
  const isDone = job !== null && job.result !== "PROCESSING";
  const fileName = job?.fileName ?? uploadingFileName ?? "";

  const renderBody = () => {
    if (pollError) {
      return (
        <DangerAlert>
          {pollError}.{" "}
          <button
            type="button"
            onClick={onRetryPoll}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </DangerAlert>
      );
    }

    if (isUploading || !job) {
      return <Pending title="Uploading file..." detail={fileName} />;
    }

    if (job.status === "VALIDATING") {
      return (
        <Pending
          title="Checking every row..."
          detail="You can close this window. The import keeps running."
        />
      );
    }

    if (job.status === "IMPORTING") {
      return (
        <Pending
          title={`Saving ${job.passRows.toLocaleString()} records...`}
          detail="You can close this window. The import keeps running."
        />
      );
    }

    return (
      <div className="space-y-4">
        {job.totalRows > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Total records"
              value={job.totalRows}
              tone="neutral"
            />
            <StatCard label="Pass" value={job.passRows} tone="success" />
            <StatCard label="Failed" value={job.failedRows} tone="danger" />
          </div>
        ) : null}

        {job.failureReason ? (
          <DangerAlert>{job.failureReason}</DangerAlert>
        ) : job.failedRows > 0 ? (
          <DangerAlert>
            {job.failedRows.toLocaleString()} row(s) failed and were skipped.
            {job.passRows > 0
              ? ` The other ${job.passRows.toLocaleString()} were imported.`
              : ""}{" "}
            Download the result to see the error on each row.
          </DangerAlert>
        ) : (
          <SuccessAlert>
            All {job.passRows.toLocaleString()} rows were imported. LINE users
            with a matching verified tel no have their tier updated.
          </SuccessAlert>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isUploading) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl" showCloseButton={!isUploading}>
        <DialogHeader>
          <DialogTitle>
            {isDone
              ? job.result === "PASS"
                ? "Import completed"
                : "Import finished with errors"
              : "Import audience"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 shrink-0" />
            <span className="truncate">{fileName}</span>
          </DialogDescription>
        </DialogHeader>

        {renderBody()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Close
          </Button>
          {isDone && job.hasResult ? (
            <>
              <Button variant="outline" onClick={() => onViewDetails(job)}>
                View details
              </Button>
              <Button onClick={() => onDownload(job)} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                Download result
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
