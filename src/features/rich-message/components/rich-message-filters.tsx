"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { RichMessageFilterOptions } from "../types";

interface RichMessageFiltersProps {
  filters: RichMessageFilterOptions;
  onFilterChange: (filters: RichMessageFilterOptions) => void;
}

/**
 * Rich message filters component
 * Allows filtering by name/description search and status
 */
export function RichMessageFilters({
  filters,
  onFilterChange,
}: RichMessageFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const handleSearch = () => {
    onFilterChange({ ...filters, searchQuery: searchInput });
  };

  const handleClear = () => {
    setSearchInput("");
    onFilterChange({ searchQuery: "", status: "all" });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters = searchInput !== "" || filters.status !== "all";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rich message name..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(event) =>
              onFilterChange({
                ...filters,
                status: event.target.value as RichMessageFilterOptions["status"],
              })
            }
            className="w-full px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-end gap-2">
          <button
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className="flex-1 h-10 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear filters"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="flex-1 h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors active:scale-95"
            title="Search"
          >
            Search
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filters applied
        </div>
      )}
    </div>
  );
}
