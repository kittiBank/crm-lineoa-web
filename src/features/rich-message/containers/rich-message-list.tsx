"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import {
  RichMessageHeader,
  RichMessageFilters,
  RichMessageTable,
  RichMessagePagination,
  RichMessageListSkeleton,
  DeleteRichMessageDialog,
} from "@/features/rich-message/components";
import {
  deleteRichMessage,
  fetchRichMessages,
} from "@/features/rich-message/lib/api";
import { filterRichMessages } from "@/features/rich-message/lib/filterRichMessages";
import {
  DEFAULT_RICH_MESSAGE_FILTERS,
  RichMessageFilterOptions,
  RichMessageRecord,
} from "@/features/rich-message/types";
import { useToast } from "@/lib/hooks/useToast";

export function RichMessageListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [messages, setMessages] = useState<RichMessageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RichMessageFilterOptions>(
    DEFAULT_RICH_MESSAGE_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [messageToDelete, setMessageToDelete] =
    useState<RichMessageRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRichMessages();
        if (isCancelled) {
          return;
        }
        setMessages(data);
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load rich messages",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMessages();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredMessages = useMemo(
    () => filterRichMessages(messages, filters),
    [messages, filters],
  );

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMessages, currentPage, itemsPerPage]);

  const handleEdit = (id: string) => {
    router.push(`/rich-message/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/rich-message/${id}/view`);
  };

  const handleDeleteClick = (id: string) => {
    const message = messages.find((item) => item.id === id);
    if (message) {
      setMessageToDelete(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRichMessage(messageToDelete.id);
      setMessages((current) =>
        current.filter((item) => item.id !== messageToDelete.id),
      );
      setMessageToDelete(null);
      toast.success(`"${messageToDelete.name}" deleted successfully`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete rich message",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Message", isActive: false },
    { label: "Rich Message", isActive: true },
  ];

  if (isLoading) {
    return (
      <div className="space-y-2" suppressHydrationWarning>
        <Breadcrumbs items={breadcrumbItems} />
        <RichMessageListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <RichMessageHeader />

      <RichMessageFilters filters={filters} onFilterChange={setFilters} />

      <div className="mt-6">
        <RichMessageTable
          messages={paginatedMessages}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
        />
      </div>

      <RichMessagePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredMessages.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <DeleteRichMessageDialog
        message={messageToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setMessageToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
