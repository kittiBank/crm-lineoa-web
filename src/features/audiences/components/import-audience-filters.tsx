import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { USER_TIERS, UserTier } from "@/constants/user-tier";
import { UserTierImportStatus } from "../lib/parse-user-tier-file";

export type ImportAudienceStatusFilter = "all" | UserTierImportStatus;
export type ImportAudienceTierFilter = "All" | UserTier;

interface ImportAudienceFiltersProps {
  searchQuery: string;
  selectedTier: ImportAudienceTierFilter;
  selectedStatus: ImportAudienceStatusFilter;
  onSearchChange: (query: string) => void;
  onTierChange: (tier: ImportAudienceTierFilter) => void;
  onStatusChange: (status: ImportAudienceStatusFilter) => void;
}

export function ImportAudienceFilters({
  searchQuery,
  selectedTier,
  selectedStatus,
  onSearchChange,
  onTierChange,
  onStatusChange,
}: ImportAudienceFiltersProps) {
  const [lineUserIdInput, setLineUserIdInput] = useState(searchQuery);

  const handleSearch = () => {
    onSearchChange(lineUserIdInput);
  };

  const handleClear = () => {
    setLineUserIdInput("");
    onSearchChange("");
    onTierChange("All");
    onStatusChange("all");
  };

  const hasActiveFilters =
    lineUserIdInput !== "" ||
    selectedTier !== "All" ||
    selectedStatus !== "all";

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search LINE User ID
          </label>
          <div className="relative">
            <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="LINE user ID..."
              value={lineUserIdInput}
              onChange={(event) => setLineUserIdInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-500 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            User Tier
          </label>
          <select
            value={selectedTier}
            onChange={(event) =>
              onTierChange(event.target.value as ImportAudienceTierFilter)
            }
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="All">All Tiers</option>
            {USER_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(event) =>
              onStatusChange(event.target.value as ImportAudienceStatusFilter)
            }
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="invalid_tier">Invalid tier</option>
            <option value="missing_line_user_id">Missing LINE user ID</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            &nbsp;
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasActiveFilters}
              className="h-10 flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="h-10 flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          <Filter className="h-3 w-3" />
          Filters applied
        </div>
      ) : null}
    </div>
  );
}
