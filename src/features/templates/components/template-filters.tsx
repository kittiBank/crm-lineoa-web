import { Search, Filter } from "lucide-react";
import { useState } from "react";

interface TemplateFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: "all" | "active" | "inactive";
  categories: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  onSearch: () => void;
  onClear: () => void;
}

/**
 * Template filters component
 * Allows filtering templates by title search, category, and status in a single line
 */
export function TemplateFilters({
  searchQuery,
  selectedCategory,
  selectedStatus,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSearch,
  onClear,
}: TemplateFiltersProps) {
  const [titleInput, setTitleInput] = useState(searchQuery);

  const handleSearch = () => {
    onSearchChange(titleInput);
    onSearch();
  };

  const handleClear = () => {
    setTitleInput("");
    onSearchChange("");
    onCategoryChange("All");
    onStatusChange("all");
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters =
    titleInput !== "" || selectedCategory !== "All" || selectedStatus !== "all";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Title Search Input */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Title
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Template title..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) =>
              onStatusChange(e.target.value as "all" | "active" | "inactive")
            }
            className="w-full px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            &nbsp;
          </label>
          <div className="flex gap-2">
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
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filters applied
        </div>
      )}
    </div>
  );
}
