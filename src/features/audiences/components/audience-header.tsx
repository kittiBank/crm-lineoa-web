import { Download, Plus, Upload } from "lucide-react";
import Link from "next/link";

interface AudienceHeaderProps {
  title?: string;
  description?: string;
}

/**
 * Audience page header component
 * Displays title, description, and create audience button
 */
export function AudienceHeader({
  title = "Audience Segment",
  description = "Create and manage audience segments for your broadcasts",
}: AudienceHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          {description}
        </p>
      </div>

      <Link href="/audiences/create">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors active:scale-95">
          <Plus className="w-5 h-5" />
          Create New Audience
        </button>
      </Link>
    </div>
  );
}

interface ImportAudienceHeaderProps {
  isParsing?: boolean;
  onDownloadTemplate: () => void;
  onImportClick: () => void;
}

export function ImportAudienceHeader({
  isParsing = false,
  onDownloadTemplate,
  onImportClick,
}: ImportAudienceHeaderProps) {
  return (
    <div className="mb-2 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Import Audience
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Import an Excel file to map LINE users to Silver, Gold, or Platinum.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Download className="h-5 w-5" />
          Download template
        </button>
        <button
          type="button"
          onClick={onImportClick}
          disabled={isParsing}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          {isParsing ? "Reading file..." : "Import Excel"}
        </button>
      </div>
    </div>
  );
}
