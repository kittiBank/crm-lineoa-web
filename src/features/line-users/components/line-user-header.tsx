interface LineUserHeaderProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}

/**
 * LINE Users page header component
 */
export function LineUserHeader({
  title = "LINE Users",
  description = "View and manage all users synced from your LINE Official Account.",
  onRefresh,
}: LineUserHeaderProps) {
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

      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors active:scale-95"
      >
        Refresh Data
      </button>
    </div>
  );
}
