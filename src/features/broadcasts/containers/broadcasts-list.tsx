"use client";

import { useState, useMemo } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import {
  BroadcastHeader,
  SearchFilters,
  BroadcastTable,
  MetricsSection,
  Pagination,
} from "@/features/broadcasts/components";
import {
  generateMockBroadcasts,
  generateMockMetrics,
  filterBroadcasts,
} from "@/features/broadcasts/lib/mockData";
import { FilterOptions } from "@/features/broadcasts/types";

/**
 * Broadcasts list page container
 * Manages state, filtering, and pagination for the broadcasts list
 */
export function BroadcastsListContainer() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    status: "All Status",
    dateRange: "",
  });

  // Generate mock data - use state with lazy initialization for client-only rendering
  const [allBroadcasts] = useState(() => generateMockBroadcasts(48));
  const [metrics] = useState(() => generateMockMetrics());

  // Filter broadcasts based on current filters
  const filteredBroadcasts = useMemo(
    () => filterBroadcasts(allBroadcasts, filters.searchQuery, filters.status),
    [allBroadcasts, filters]
  );

  // Paginate filtered broadcasts
  const totalPages = Math.ceil(filteredBroadcasts.length / itemsPerPage);
  const paginatedBroadcasts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBroadcasts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBroadcasts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Broadcasts", isActive: true },
  ];

  return (
    <div className="space-y-2" suppressHydrationWarning>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <BroadcastHeader />

      {/* Search and Filters */}
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Broadcasts Table */}
      <BroadcastTable broadcasts={paginatedBroadcasts} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredBroadcasts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
      />

      {/* Metrics Section */}
      <MetricsSection
        totalSent={metrics.totalSent}
        percentageChange={metrics.percentageChange}
        averageReadRate={metrics.averageReadRate}
        activeScheduled={metrics.activeScheduled}
        nextBroadcastTime={metrics.nextBroadcastTime}
      />
    </div>
  );
}