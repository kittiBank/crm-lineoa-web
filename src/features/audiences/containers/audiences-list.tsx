"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  AudienceHeader,
  AudienceTable,
  AudienceFilters,
  AudiencePagination,
} from "@/features/audiences/components";
import {
  filterAudiencesByStatus,
  filterAudiencesByType,
  searchAudiences,
} from "@/features/audiences/lib/filters";
import { deleteAudience, fetchAudiences } from "@/features/audiences/lib/api";
import { Audience, AudienceSegmentType } from "@/features/audiences/types";
import { useToast } from "@/lib/hooks/useToast";

export function AudiencesListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    AudienceSegmentType | "All"
  >("All");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [audienceToDelete, setAudienceToDelete] = useState<Audience | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadAudiences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAudiences();
        if (isCancelled) return;
        setAudiences(data);
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load audiences",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAudiences();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredAudiences = useMemo(() => {
    let result = [...audiences];
    result = searchAudiences(result, searchQuery);
    result = filterAudiencesByType(result, selectedType);
    result = filterAudiencesByStatus(result, selectedStatus);
    return result;
  }, [audiences, searchQuery, selectedType, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAudiences.length / itemsPerPage),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus]);

  const paginatedAudiences = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAudiences.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAudiences, currentPage, itemsPerPage]);

  const handleEdit = (id: string) => {
    router.push(`/audiences/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/audiences/${id}/view`);
  };

  const handleDeleteClick = (id: string) => {
    const audience = audiences.find((item) => item.id === id);
    if (audience) {
      setAudienceToDelete(audience);
    }
  };

  const handleConfirmDelete = async () => {
    if (!audienceToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAudience(audienceToDelete.id);
      setAudiences((current) =>
        current.filter((item) => item.id !== audienceToDelete.id),
      );
      setAudienceToDelete(null);
      toast.success(`"${audienceToDelete.name}" deleted successfully`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete audience",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Audience Management", isActive: true },
  ];

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <AudienceHeader />

      <AudienceFilters
        searchQuery={searchQuery}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchQuery}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onSearch={() => undefined}
        onClear={() => undefined}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading audiences...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <AudienceTable
              audiences={paginatedAudiences}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onView={handleView}
            />
          </div>

          <AudiencePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAudiences.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(audienceToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setAudienceToDelete(null);
          }
        }}
        title="Delete Audience"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              &quot;{audienceToDelete?.name}&quot;
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
