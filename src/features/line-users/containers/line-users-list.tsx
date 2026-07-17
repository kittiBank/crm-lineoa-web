"use client";

import { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import {
  LineUserHeader,
  SearchFilters,
  LineUserTable,
  Pagination,
} from "@/features/line-users/components";
import { fetchLineUsers } from "@/features/line-users/lib/api";
import {
  DEFAULT_FILTER_OPTIONS,
  FilterOptions,
  LineUser,
} from "@/features/line-users/types";
import { Loader2 } from "lucide-react";

export function LineUsersListContainer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER_OPTIONS);
  const [users, setUsers] = useState<LineUser[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchLineUsers(filters, currentPage, itemsPerPage);
      setUsers(result.users);
      setTotalItems(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load LINE users");
      setUsers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTER_OPTIONS);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "LINE Users", isActive: true },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />

      <LineUserHeader onRefresh={loadUsers} />

      <SearchFilters
        filters={filters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <LineUserTable
              users={users}
              startIndex={startIndex}
              onView={(id) => console.log("View user:", id)}
              onMore={(id) => console.log("More options for user:", id)}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
