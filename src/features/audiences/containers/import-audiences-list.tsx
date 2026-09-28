"use client";

import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { AudiencePagination } from "@/features/audiences/components/audience-pagination";
import { ImportAudienceHeader } from "@/features/audiences/components/audience-header";
import { ImportAudienceFilters } from "@/features/audiences/components/import-audience-filters";
import { ImportAudienceTable } from "@/features/audiences/components/import-audience-table";
import {
  DeleteImportedAudienceDialog,
  EditImportedAudienceDialog,
  ViewImportedAudienceDialog,
} from "@/features/audiences/components/imported-audience-dialogs";
import { ImportSummaryDialog } from "@/features/audiences/components/import-summary-dialog";
import { useToast } from "@/lib/hooks/useToast";
import {
  cancelAudienceImportJob,
  confirmAudienceImportJob,
  deleteImportedAudience,
  fetchAudienceImportJob,
  fetchImportedAudiences,
  updateImportedAudienceTier,
  uploadAudienceImportFile,
} from "@/features/audiences/lib/audience-import-api";
import {
  AUDIENCE_IMPORT_ACCEPT,
  checkAudienceImportFile,
  downloadAudienceImportTemplate,
} from "@/features/audiences/lib/audience-import-template";
import {
  AUDIENCE_IMPORT_PENDING_STATUSES,
  AudienceImportJob,
  ImportTier,
  ImportedAudienceRecord,
} from "@/features/audiences/types/audience-import";

const IMPORT_POLL_INTERVAL_MS = 1000;

export function ImportAudiencesListContainer() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useState<ImportedAudienceRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewRecord, setViewRecord] = useState<ImportedAudienceRecord | null>(
    null,
  );
  const [editRecord, setEditRecord] = useState<ImportedAudienceRecord | null>(
    null,
  );
  const [deleteRecord, setDeleteRecord] =
    useState<ImportedAudienceRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [importJob, setImportJob] = useState<AudienceImportJob | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(
    null,
  );
  const [pollError, setPollError] = useState<string | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadRecords = async () => {
      setIsLoading(true);
      try {
        const result = await fetchImportedAudiences({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
        });
        if (isCancelled) {
          return;
        }

        // Deleting the last row of the last page leaves the page empty.
        if (result.data.length === 0 && currentPage > 1) {
          setCurrentPage(Math.max(1, result.meta.totalPages));
          return;
        }

        setRecords(result.data);
        setTotalItems(result.meta.total);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } catch (error) {
        if (!isCancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load imported audiences",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRecords();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, itemsPerPage, searchQuery, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const closeImport = () => {
    setImportJob(null);
    setPollError(null);
  };

  // Poll the job while the worker validates or commits it. Re-runs on every
  // job update, so each tick schedules the next one.
  useEffect(() => {
    if (
      !importJob ||
      pollError ||
      !AUDIENCE_IMPORT_PENDING_STATUSES.includes(importJob.status)
    ) {
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const next = await fetchAudienceImportJob(importJob.id);
        if (isCancelled) {
          return;
        }

        if (next.status === "COMPLETED") {
          toast.success(
            `Imported ${next.validRows.toLocaleString()} record(s) from ${next.fileName}`,
          );
          closeImport();
          setCurrentPage(1);
          reload();
          return;
        }

        setImportJob(next);
      } catch (error) {
        if (!isCancelled) {
          setPollError(
            error instanceof Error
              ? error.message
              : "Lost connection while checking the import",
          );
        }
      }
    }, IMPORT_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [importJob, pollError, pollAttempt]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query.trim());
    setCurrentPage(1);
  };

  const handleFiles = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (!file) {
      return;
    }

    const fileError = checkAudienceImportFile(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    setPollError(null);
    setUploadingFileName(file.name);
    try {
      setImportJob(await uploadAudienceImportFile(file));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload import file",
      );
    } finally {
      setUploadingFileName(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importJob) {
      return;
    }

    setIsConfirming(true);
    try {
      setImportJob(await confirmAudienceImportJob(importJob.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm import",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  // Close the dialog; a job that could still be committed is cancelled so its
  // staged rows are cleaned up.
  const handleDismissImport = async () => {
    const job = importJob;
    if (!job || (job.status !== "VALIDATING" && job.status !== "VALIDATED")) {
      closeImport();
      return;
    }

    setIsCancelling(true);
    try {
      await cancelAudienceImportJob(job.id);
      if (job.errorRows === 0) {
        toast.success("Import cancelled. Nothing was imported.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel import",
      );
    } finally {
      setIsCancelling(false);
      closeImport();
    }
  };

  const handleEditFromView = (record: ImportedAudienceRecord) => {
    setViewRecord(null);
    setEditRecord(record);
  };

  const handleSaveTier = async (
    record: ImportedAudienceRecord,
    userTier: ImportTier,
  ) => {
    setIsSaving(true);
    try {
      const updated = await updateImportedAudienceTier(record.id, userTier);
      setRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`${updated.phone} is now ${updated.userTier}`);
      setEditRecord(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user tier",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRecord) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteImportedAudience(deleteRecord.id);
      toast.success(`${deleteRecord.phone} deleted`);
      setDeleteRecord(null);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete imported audience",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Audience Management" },
          { label: "Import Audience", isActive: true },
        ]}
      />

      <input
        ref={inputRef}
        type="file"
        accept={AUDIENCE_IMPORT_ACCEPT}
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <ImportAudienceHeader
        isParsing={Boolean(uploadingFileName)}
        onDownloadTemplate={downloadAudienceImportTemplate}
        onImportClick={() => inputRef.current?.click()}
      />

      <ImportAudienceFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="mt-6">
        <ImportAudienceTable
          records={records}
          startIndex={(currentPage - 1) * itemsPerPage}
          isLoading={isLoading}
          hasSearch={searchQuery.length > 0}
          onView={setViewRecord}
          onEdit={setEditRecord}
          onDelete={setDeleteRecord}
        />
      </div>

      <AudiencePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        itemLabel="records"
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(nextItemsPerPage) => {
          setItemsPerPage(nextItemsPerPage);
          setCurrentPage(1);
        }}
      />

      <ViewImportedAudienceDialog
        record={viewRecord}
        onOpenChange={(open) => !open && setViewRecord(null)}
        onEdit={handleEditFromView}
      />

      <EditImportedAudienceDialog
        record={editRecord}
        isSaving={isSaving}
        onOpenChange={(open) => !open && setEditRecord(null)}
        onSave={handleSaveTier}
      />

      <ImportSummaryDialog
        open={Boolean(uploadingFileName) || Boolean(importJob)}
        uploadingFileName={uploadingFileName}
        job={importJob}
        pollError={pollError}
        isConfirming={isConfirming}
        isCancelling={isCancelling}
        onConfirm={handleConfirmImport}
        onDismiss={handleDismissImport}
        onRetryPoll={() => {
          setPollError(null);
          setPollAttempt((attempt) => attempt + 1);
        }}
      />

      <DeleteImportedAudienceDialog
        record={deleteRecord}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && !isDeleting && setDeleteRecord(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
