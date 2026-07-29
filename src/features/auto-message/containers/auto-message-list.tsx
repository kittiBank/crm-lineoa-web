"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  AutoMessageHeader,
  AutoMessageFilters,
  AutoMessageTable,
  AutoMessagePagination,
} from "@/features/auto-message/components";
import {
  deleteAutoMessage,
  fetchAutoMessages,
} from "@/features/auto-message/lib/api";
import {
  searchAutoMessages,
  filterByMatchType,
  filterByStatus,
} from "@/features/auto-message/lib/filters";
import { AutoMessage } from "@/features/auto-message/types";
import { useToast } from "@/lib/hooks/useToast";

export function AutoMessageListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatchType, setSelectedMatchType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemToDelete, setItemToDelete] = useState<AutoMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAutoMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAutoMessages();
      setAutoMessages(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load auto messages",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAutoMessages();
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...autoMessages];
    result = searchAutoMessages(result, searchQuery);
    result = filterByMatchType(result, selectedMatchType);
    result = filterByStatus(result, selectedStatus);
    return result;
  }, [autoMessages, searchQuery, selectedMatchType, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMatchType, selectedStatus]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleDeleteClick = (id: string) => {
    const item = autoMessages.find((m) => m.id === id);
    if (item) setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAutoMessage(itemToDelete.id);
      setAutoMessages((current) =>
        current.filter((item) => item.id !== itemToDelete.id),
      );
      setItemToDelete(null);
      toast.success(`"${itemToDelete.name}" deleted successfully`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete auto message",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Auto Message", isActive: true },
  ];

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <AutoMessageHeader />

      <AutoMessageFilters
        searchQuery={searchQuery}
        selectedMatchType={selectedMatchType}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchQuery}
        onMatchTypeChange={setSelectedMatchType}
        onStatusChange={setSelectedStatus}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading auto messages...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <AutoMessageTable
              items={paginatedItems}
              onEdit={(id) => router.push(`/auto-message/${id}/edit`)}
              onDelete={handleDeleteClick}
              onView={(id) => router.push(`/auto-message/${id}/view`)}
            />
          </div>

          <AutoMessagePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setItemToDelete(null);
        }}
        title="Delete Auto Message"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              &quot;{itemToDelete?.name}&quot;
            </span>
            ? This action cannot be undone.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        showCloseButton={!isDeleting}
      />
    </div>
  );
}
