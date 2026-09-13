"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { AudiencePagination } from "@/features/audiences/components/audience-pagination";
import { ImportAudienceHeader } from "@/features/audiences/components/audience-header";
import {
  ImportAudienceFilters,
  ImportAudienceStatusFilter,
  ImportAudienceTierFilter,
} from "@/features/audiences/components/import-audience-filters";
import { ImportAudienceTable } from "@/features/audiences/components/import-audience-table";
import { useToast } from "@/lib/hooks/useToast";
import {
  USER_TIER_IMPORT_ACCEPT,
  UserTierImportRow,
  downloadUserTierImportTemplate,
  parseUserTierImportFile,
} from "@/features/audiences/lib/parse-user-tier-file";

export function ImportAudiencesListContainer() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [hasImportedFile, setHasImportedFile] = useState(false);
  const [rows, setRows] = useState<UserTierImportRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] =
    useState<ImportAudienceTierFilter>("All");
  const [selectedStatus, setSelectedStatus] =
    useState<ImportAudienceStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFiles = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    setIsParsing(true);
    try {
      const result = await parseUserTierImportFile(file);
      setRows(result.rows);
      setHasImportedFile(true);
      setCurrentPage(1);
      toast.success(`Imported ${result.rows.length} row(s) from ${result.fileName}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to read spreadsheet",
      );
    } finally {
      setIsParsing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        query.length === 0 || row.lineUserId.toLowerCase().includes(query);
      const matchesTier =
        selectedTier === "All" || row.parsedTier === selectedTier;
      const matchesStatus =
        selectedStatus === "all" || row.status === selectedStatus;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [rows, searchQuery, selectedTier, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / itemsPerPage),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTier, selectedStatus]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

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
        accept={USER_TIER_IMPORT_ACCEPT}
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <ImportAudienceHeader
        isParsing={isParsing}
        onDownloadTemplate={downloadUserTierImportTemplate}
        onImportClick={() => inputRef.current?.click()}
      />

      <ImportAudienceFilters
        searchQuery={searchQuery}
        selectedTier={selectedTier}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchQuery}
        onTierChange={setSelectedTier}
        onStatusChange={setSelectedStatus}
      />

      <div className="mt-6">
        <ImportAudienceTable
          rows={paginatedRows}
          hasImportedFile={hasImportedFile}
        />
      </div>

      <AudiencePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRows.length}
        itemsPerPage={itemsPerPage}
        itemLabel="users"
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(nextItemsPerPage) => {
          setItemsPerPage(nextItemsPerPage);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
