"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { RichMenuFilterOptions } from "../types";

interface SearchFiltersProps {
  filters: RichMenuFilterOptions;
  onFilterChange: (filters: RichMenuFilterOptions) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [nameInput, setNameInput] = useState(filters.searchQuery);

  const handleSearch = () => {
    onFilterChange({
      ...filters,
      searchQuery: nameInput,
    });
  };

  const handleClear = () => {
    setNameInput("");
    onFilterChange({
      searchQuery: "",
      menuType: "all",
      status: "all",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters =
    nameInput !== "" ||
    filters.menuType !== "all" ||
    filters.status !== "all";

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Rich Menus
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Menu name..."
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Menu Type
          </label>
          <select
            value={filters.menuType}
            onChange={(event) =>
              onFilterChange({
                ...filters,
                menuType: event.target.value as RichMenuFilterOptions["menuType"],
              })
            }
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="default">Guest</option>
            <option value="member">Member</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(event) =>
              onFilterChange({
                ...filters,
                status: event.target.value as RichMenuFilterOptions["status"],
              })
            }
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          <Filter className="h-3 w-3" />
          Filters applied
        </div>
      )}
    </div>
  );
}
