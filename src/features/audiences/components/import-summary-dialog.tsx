"use client";

import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
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

interface ImportSummaryDialogProps {
  open: boolean;
  /** Set while the file is uploading, before a job exists. */
  uploadingFileName: string | null;
  job: AudienceImportJob | null;
  pollError: string | null;
  isConfirming: boolean;
  isCancelling: boolean;
  onConfirm: () => void;
  /** Cancel/close before commit. The container cancels the job if needed. */
  onDismiss: () => void;
  onRetryPoll: () => void;
}

function StatCard({
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

function Alert({
  tone,
  children,
}: {
  tone: "danger" | "success";
  children: React.ReactNode;
}) {
  const isDanger = tone === "danger";
  const Icon = isDanger ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`flex gap-2 rounded-lg border p-3 text-sm ${
        isDanger
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function ErrorTable({ job }: { job: AudienceImportJob }) {
  return (
    <div>
      <div className="max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
            <tr className="text-gray-600 dark:text-gray-300">
              <th className="px-3 py-2 font-semibold">Row</th>
              <th className="px-3 py-2 font-semibold">Column</th>
              <th className="px-3 py-2 font-semibold">Value</th>
              <th className="px-3 py-2 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {job.errors.map((error, index) => (
              <tr key={`${error.rowNumber}-${error.column}-${index}`}>
                <td className="px-3 py-2 tabular-nums text-gray-600 dark:text-gray-400">
                  {error.rowNumber}
                </td>
                <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">
                  {error.column}
                </td>
                <td className="max-w-[8rem] truncate px-3 py-2 font-mono text-gray-900 dark:text-white">
                  {error.value || <span className="text-gray-400">(empty)</span>}
                </td>
                <td className="px-3 py-2 text-red-600 dark:text-red-400">
                  {error.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {job.errors.length >= 500 ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Showing the first 500 errors.
        </p>
      ) : null}
    </div>
  );
}

export function ImportSummaryDialog({
  open,
  uploadingFileName,
  job,
  pollError,
  isConfirming,
  isCancelling,
  onConfirm,
  onDismiss,
  onRetryPoll,
}: ImportSummaryDialogProps) {
  const status = job?.status;
  const isImporting = status === "IMPORTING" || isConfirming;
  const isBusy = isImporting || isCancelling || Boolean(uploadingFileName);
  const fileName = job?.fileName ?? uploadingFileName ?? "";
  const hasErrors = status === "VALIDATED" && (job?.errorRows ?? 0) > 0;

  const renderBody = () => {
    if (pollError) {
      return (
        <Alert tone="danger">
          {pollError}.{" "}
          <button
            type="button"
            onClick={onRetryPoll}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </Alert>
      );
    }

    if (uploadingFileName || !job) {
      return <Pending title="Uploading file..." detail={fileName} />;
    }

    if (isImporting) {
      return (
        <Pending
          title={`Importing ${job.validRows.toLocaleString()} records...`}
          detail="Saving in batches. Keep this window open."
        />
      );
    }

    if (status === "VALIDATING") {
      return (
        <Pending
          title="Checking every row..."
          detail="Validating tel no and user tier in batches."
        />
      );
    }

    if (status === "FAILED") {
      return (
        <Alert tone="danger">
          {job.failureReason ?? "The file could not be processed."}
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total records" value={job.totalRows} tone="neutral" />
          <StatCard label="Success" value={job.validRows} tone="success" />
          <StatCard label="Failed" value={job.errorRows} tone="danger" />
        </div>

        {hasErrors ? (
          <>
            <Alert tone="danger">
              {job.errorRows.toLocaleString()} row(s) have errors, so nothing
              will be imported. Fix the file and upload it again.
            </Alert>
            <ErrorTable job={job} />
          </>
        ) : (
          <Alert tone="success">
            All rows are valid. Existing tel nos will have their tier
            overwritten.
          </Alert>
        )}
      </div>
    );
  };

  const title =
    status === "FAILED"
      ? "Import failed"
      : status === "VALIDATED"
        ? "Import summary"
        : "Import audience";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isBusy) {
          onDismiss();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl" showCloseButton={!isBusy}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-4 w-4 shrink-0" />
            <span className="truncate">{fileName}</span>
          </DialogDescription>
        </DialogHeader>

        {renderBody()}

        <DialogFooter>
          {status === "VALIDATED" && !hasErrors && !isImporting ? (
            <>
              <Button
                variant="outline"
                onClick={onDismiss}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={!job?.canConfirm || isCancelling}
              >
                Confirm import
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onDismiss} disabled={isBusy}>
              {status === "VALIDATING" ? "Cancel" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
