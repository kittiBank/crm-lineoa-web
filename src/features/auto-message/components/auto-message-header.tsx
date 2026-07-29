import { Plus } from "lucide-react";
import Link from "next/link";

interface AutoMessageHeaderProps {
  title?: string;
  description?: string;
}

export function AutoMessageHeader({
  title = "Auto Message",
  description = "Create and manage automated messages triggered by user actions",
}: AutoMessageHeaderProps) {
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

      <Link href="/auto-message/create">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors active:scale-95">
          <Plus className="w-5 h-5" />
          New Auto Message
        </button>
      </Link>
    </div>
  );
}
