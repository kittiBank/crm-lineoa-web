import { Search } from "lucide-react";
import { useState } from "react";

interface ImportAudienceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/** Search the import history by file name (partial, case-insensitive). */
export function ImportAudienceFilters({
  searchQuery,
  onSearchChange,
}: ImportAudienceFiltersProps) {
  const [fileNameInput, setFileNameInput] = useState(searchQuery);

  const handleClear = () => {
    setFileNameInput("");
    onSearchChange("");
  };

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label
            htmlFor="import-audience-search"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Search File Name
          </label>
          <div className="relative">
            <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              id="import-audience-search"
              type="search"
              placeholder="e.g. members-2026"
              value={fileNameInput}
              onChange={(event) => setFileNameInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearchChange(fileNameInput);
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-500 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 hidden text-sm font-medium md:block">
            &nbsp;
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!fileNameInput && !searchQuery}
              className="h-10 flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onSearchChange(fileNameInput)}
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
