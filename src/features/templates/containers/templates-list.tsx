"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  TemplateHeader,
  TemplateTable,
  TemplateFilters,
  TemplatePagination,
} from "@/features/templates/components";
import {
  filterTemplatesByCategory,
  filterTemplatesByStatus,
  searchTemplates,
} from "@/features/templates/lib/mockData";
import { deleteTemplate, fetchTemplates } from "@/features/templates/lib/api";
import { MessageTemplate } from "@/features/templates/types";
import { useToast } from "@/lib/hooks/useToast";

export function TemplatesListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [templateToDelete, setTemplateToDelete] =
    useState<MessageTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(templates.map((item) => item.category)));
    return ["All", ...unique.sort()];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    result = searchTemplates(result, searchQuery);
    result = filterTemplatesByCategory(result, selectedCategory);
    result = filterTemplatesByStatus(result, selectedStatus);
    return result;
  }, [templates, searchQuery, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  const handleEdit = (id: string) => {
    router.push(`/templates/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/templates/${id}/view`);
  };

  const handleDeleteClick = (id: string) => {
    const template = templates.find((item) => item.id === id);
    if (template) {
      setTemplateToDelete(template);
    }
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTemplate(templateToDelete.id);
      setTemplates((current) =>
        current.filter((item) => item.id !== templateToDelete.id),
      );
      setTemplateToDelete(null);
      toast.success(`"${templateToDelete.name}" deleted successfully`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete template",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Message Templates", isActive: true },
  ];

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <TemplateHeader />

      <TemplateFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        categories={categories.filter((item) => item !== "All")}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
        onSearch={() => undefined}
        onClear={() => undefined}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading templates...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <TemplateTable
              templates={paginatedTemplates}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onView={handleView}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          <TemplatePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTemplates.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(templateToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setTemplateToDelete(null);
          }
        }}
        title="Delete Template"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              &quot;{templateToDelete?.name}&quot;
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
