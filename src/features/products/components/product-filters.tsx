import { Search } from "lucide-react";
import { useState } from "react";
import { ProductStatusFilter } from "../types";

export interface ProductFilterValues {
  search: string;
  status: ProductStatusFilter | "";
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onSearch: (filters: ProductFilterValues) => void;
}

const fieldClassName =
  "w-full rounded-lg border border-gray-300 bg-white py-2 text-gray-900 placeholder-gray-500 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400";

/** Search products by name and filter by shop visibility. */
export function ProductFilters({ filters, onSearch }: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [status, setStatus] = useState(filters.status);

  const hasFilters =
    Boolean(searchInput || status) || Boolean(filters.search || filters.status);

  const handleClear = () => {
    setSearchInput("");
    setStatus("");
    onSearch({ search: "", status: "" });
  };

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label
            htmlFor="product-search"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Search Product Name
          </label>
          <div className="relative">
            <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              id="product-search"
              type="search"
              placeholder="e.g. Cold Brew"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearch({ search: searchInput, status });
                }
              }}
              className={`${fieldClassName} pr-4 pl-10`}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="product-status"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="product-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ProductFilterValues["status"])
            }
            className={`${fieldClassName} h-10 px-3`}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 hidden text-sm font-medium md:block">
            &nbsp;
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasFilters}
              className="h-10 flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onSearch({ search: searchInput, status })}
              className="h-10 flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
