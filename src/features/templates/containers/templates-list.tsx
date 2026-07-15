"use client";

import { useState, useMemo } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import {
  TemplateHeader,
  TemplateTable,
  TemplateFilters,
  TemplatePagination,
} from "@/features/templates/components";
import {
  generateMockTemplates,
  generateTemplateCategories,
  filterTemplatesByCategory,
  filterTemplatesByStatus,
  searchTemplates,
} from "@/features/templates/lib/mockData";
import { MessageTemplate } from "@/features/templates/types";

/**
 * Templates list container
 * Manages state, filtering, and pagination for the templates list
 */
export function TemplatesListContainer() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Generate mock data on client-side
  const [allTemplates] = useState<MessageTemplate[]>(() =>
    generateMockTemplates(24)
  );

  const categories = useMemo(() => {
    const cats = generateTemplateCategories(allTemplates);
    return ["All", ...cats.map((c) => c.name)];
  }, [allTemplates]);

  // Apply filters and search
  const filteredTemplates = useMemo(() => {
    let result = [...allTemplates];

    // Apply search
    result = searchTemplates(result, searchQuery);

    // Apply category filter
    result = filterTemplatesByCategory(result, selectedCategory);

    // Apply status filter
    result = filterTemplatesByStatus(result, selectedStatus);

    return result;
  }, [allTemplates, searchQuery, selectedCategory, selectedStatus]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  
  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Get paginated templates
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Message Templates", isActive: true },
  ];

  const handleEdit = (id: string) => {
    console.log("Edit template:", id);
    // TODO: Navigate to edit page
  };

  const handleDelete = (id: string) => {
    console.log("Delete template:", id);
    // TODO: Implement delete
  };

  const handleView = (id: string) => {
    console.log("View template:", id);
    // TODO: Navigate to view page
  };

  const handleSearch = () => {
    // Search is applied via onSearchChange, this can be used for additional logic
    console.log("Search triggered with query:", searchQuery);
  };

  const handleClear = () => {
    // All filters are cleared via onClear, this can be used for additional logic
    console.log("Filters cleared");
  };

  return (
    <div className="space-y-2" suppressHydrationWarning>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <TemplateHeader />

      {/* Filters */}
      <TemplateFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        categories={categories.filter((c) => c !== "All")}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {/* Template Table */}
      <div className="mt-6">
        <TemplateTable
          templates={paginatedTemplates}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Pagination */}
      <TemplatePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTemplates.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
