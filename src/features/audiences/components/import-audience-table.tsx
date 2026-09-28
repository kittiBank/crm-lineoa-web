import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { ImportedAudienceRecord } from "../types/audience-import";
import { ImportTierBadge } from "./import-tier-badge";

interface ImportAudienceTableProps {
  records: ImportedAudienceRecord[];
  startIndex: number;
  isLoading: boolean;
  hasSearch: boolean;
  onView: (record: ImportedAudienceRecord) => void;
  onEdit: (record: ImportedAudienceRecord) => void;
  onDelete: (record: ImportedAudienceRecord) => void;
}

const headerClassName =
  "px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300";

const actionButtonClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";

export function LineOaIdCell({
  lineUser,
}: Pick<ImportedAudienceRecord, "lineUser">) {
  if (!lineUser) {
    return (
      <span
        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        title="Links automatically when this tel no verifies via LINE OTP"
      >
        Not linked
      </span>
    );
  }

  return (
    <div className="min-w-0">
      <div className="truncate font-mono text-xs text-gray-900 dark:text-white">
        {lineUser.lineUserId}
      </div>
      {lineUser.displayName ? (
        <div className="truncate text-xs text-gray-500 dark:text-gray-400">
          {lineUser.displayName}
        </div>
      ) : null}
    </div>
  );
}

export function ImportAudienceTable({
  records,
  startIndex,
  isLoading,
  hasSearch,
  onView,
  onEdit,
  onDelete,
}: ImportAudienceTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className={`${headerClassName} w-16`}>No</th>
              <th className={headerClassName}>Tel No</th>
              <th className={headerClassName}>LINE OA ID</th>
              <th className={headerClassName}>User Tier</th>
              <th className={`${headerClassName} w-32 text-right`}>Action</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {records.map((record, index) => (
              <tr
                key={record.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {record.phone}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <LineOaIdCell lineUser={record.lineUser} />
                </td>
                <td className="px-4 py-3">
                  <ImportTierBadge tier={record.userTier} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className={actionButtonClassName}
                      aria-label={`View ${record.phone}`}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className={actionButtonClassName}
                      aria-label={`Edit ${record.phone}`}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(record)}
                      className={`${actionButtonClassName} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400`}
                      aria-label={`Delete ${record.phone}`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading imported audiences...
            </>
          ) : hasSearch ? (
            "No tel no matches your search."
          ) : (
            "No imported audiences yet. Download the template, fill in telNo and userTier, then import it."
          )}
        </div>
      ) : null}
    </div>
  );
}
