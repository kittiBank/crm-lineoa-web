"use client";

import { Search, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DEFAULT_FILTER_OPTIONS,
  FilterOptions,
  UserStatus,
  UserType,
} from "../types";

interface SearchFiltersProps {
  filters: FilterOptions;
  onSearch: (filters: FilterOptions) => void;
  onClear: () => void;
}

/**
 * Search and filter component for LINE users
 */
export function SearchFilters({
  filters,
  onSearch,
  onClear,
}: SearchFiltersProps) {
  const [draft, setDraft] = useState<FilterOptions>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleSearch = () => {
    onSearch(draft);
  };

  const handleClear = () => {
    setDraft(DEFAULT_FILTER_OPTIONS);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="LINE display name or user ID..."
              value={draft.searchQuery}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* User Type Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User Type
          </label>
          <select
            value={draft.userType}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                userType: e.target.value as UserType | "All",
              }))
            }
            className="w-full px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="All">All Types</option>
            <option value="Member">Member</option>
            <option value="Guest">Guest</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                status: e.target.value as UserStatus | "All",
              }))
            }
            className="w-full px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={draft.dateRange}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex items-end gap-2">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
