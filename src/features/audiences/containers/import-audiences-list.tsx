"use client";

import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { AudiencePagination } from "@/features/audiences/components/audience-pagination";
import { ImportAudienceHeader } from "@/features/audiences/components/audience-header";
import { ImportAudienceFilters } from "@/features/audiences/components/import-audience-filters";
import { ImportJobTable } from "@/features/audiences/components/import-job-table";
import {
  DeleteImportJobDialog,
  ViewImportJobDialog,
} from "@/features/audiences/components/import-job-dialogs";
import { ImportSummaryDialog } from "@/features/audiences/components/import-summary-dialog";
import { useToast } from "@/lib/hooks/useToast";
import {
  deleteAudienceImportJob,
  downloadAudienceImportResult,
  fetchAudienceImportJob,
  fetchAudienceImportJobs,
  uploadAudienceImportFile,
} from "@/features/audiences/lib/audience-import-api";
import {
  AUDIENCE_IMPORT_ACCEPT,
  checkAudienceImportFile,
  downloadAudienceImportTemplate,
} from "@/features/audiences/lib/audience-import-template";
import { AudienceImportJob } from "@/features/audiences/types/audience-import";

const IMPORT_POLL_INTERVAL_MS = 1000;
const LIST_POLL_INTERVAL_MS = 3000;

export function ImportAudiencesListContainer() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<AudienceImportJob[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  // Background refreshes (polling) skip the loading state.
  const silentReloadRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewJob, setViewJob] = useState<AudienceImportJob | null>(null);
  const [deleteJob, setDeleteJob] = useState<AudienceImportJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);

  const [importJob, setImportJob] = useState<AudienceImportJob | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(
    null,
  );
  const [pollError, setPollError] = useState<string | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const isSilent = silentReloadRef.current;
    silentReloadRef.current = false;

    const loadJobs = async () => {
      if (!isSilent) {
        setIsLoading(true);
      }
      try {
        const result = await fetchAudienceImportJobs({
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

        setJobs(result.data);
        setTotalItems(result.meta.total);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } catch (error) {
        if (!isCancelled && !isSilent) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load import history",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, itemsPerPage, searchQuery, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  // Keep processing rows in the list up to date.
  const hasProcessingJob = jobs.some((job) => job.result === "PROCESSING");
  useEffect(() => {
    if (!hasProcessingJob) {
      return;
    }

    const timer = setTimeout(() => {
      silentReloadRef.current = true;
      reload();
    }, LIST_POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [hasProcessingJob, jobs]);

  // Poll the uploaded job while the dialog is open. Re-runs on every job
  // update, so each tick schedules the next one.
  useEffect(() => {
    if (
      !isImportDialogOpen ||
      !importJob ||
      pollError ||
      importJob.result !== "PROCESSING"
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

        setImportJob(next);
        if (next.result !== "PROCESSING") {
          reload();
        }
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
  }, [isImportDialogOpen, importJob, pollError, pollAttempt]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query.trim());
    setCurrentPage(1);
  };

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
    setImportJob(null);
    setPollError(null);
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
    setImportJob(null);
    setUploadingFileName(file.name);
    setIsImportDialogOpen(true);
    try {
      setImportJob(await uploadAudienceImportFile(file));
      setCurrentPage(1);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload import file",
      );
      setIsImportDialogOpen(false);
    } finally {
      setUploadingFileName(null);
    }
  };

  const handleDownload = async (job: AudienceImportJob) => {
    setDownloadingJobId(job.id);
    try {
      await downloadAudienceImportResult(job);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download import result",
      );
    } finally {
      setDownloadingJobId(null);
    }
  };

  const handleViewDetails = (job: AudienceImportJob) => {
    closeImportDialog();
    setViewJob(job);
  };

  const handleDelete = async () => {
    if (!deleteJob) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAudienceImportJob(deleteJob.id);
      toast.success(`${deleteJob.fileName} deleted`);
      setDeleteJob(null);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete import",
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
        <ImportJobTable
          jobs={jobs}
          startIndex={(currentPage - 1) * itemsPerPage}
          isLoading={isLoading}
          hasSearch={searchQuery.length > 0}
          downloadingJobId={downloadingJobId}
          onDownload={(job) => void handleDownload(job)}
          onView={setViewJob}
          onDelete={setDeleteJob}
        />
      </div>

      <AudiencePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        itemLabel="imports"
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(nextItemsPerPage) => {
          setItemsPerPage(nextItemsPerPage);
          setCurrentPage(1);
        }}
      />

      <ViewImportJobDialog
        job={viewJob}
        isDownloading={viewJob !== null && downloadingJobId === viewJob.id}
        onOpenChange={(open) => !open && setViewJob(null)}
        onDownload={(job) => void handleDownload(job)}
      />

      <ImportSummaryDialog
        open={isImportDialogOpen}
        uploadingFileName={uploadingFileName}
        job={importJob}
        pollError={pollError}
        isDownloading={importJob !== null && downloadingJobId === importJob.id}
        onClose={closeImportDialog}
        onRetryPoll={() => {
          setPollError(null);
          setPollAttempt((attempt) => attempt + 1);
        }}
        onDownload={(job) => void handleDownload(job)}
        onViewDetails={handleViewDetails}
      />

      <DeleteImportJobDialog
        job={deleteJob}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && !isDeleting && setDeleteJob(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
