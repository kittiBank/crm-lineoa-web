import Link from "next/link";
import { Plus } from "lucide-react";

interface BroadcastHeaderProps {
  title?: string;
  description?: string;
  onNewClick?: () => void;
}

/**
 * Broadcast page header component
 * Displays title, description, and new broadcast button
 */
export function BroadcastHeader({
  title = "Broadcast Management",
  description = "Create and manage your campaign broadcasts across channels.",
  onNewClick,
}: BroadcastHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{description}</p>
      </div>

      {/* New Broadcast Button */}
      <Link href="/broadcasts/create">
        <button
          onClick={onNewClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Broadcast
        </button>
      </Link>
    </div>
  );
}
