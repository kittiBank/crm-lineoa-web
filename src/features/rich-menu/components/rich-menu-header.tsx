import Link from "next/link";
import { Plus } from "lucide-react";

interface RichMenuHeaderProps {
  title?: string;
  description?: string;
}

export function RichMenuHeader({
  title = "Rich Menu",
  description = "Create and manage LINE Rich Menu configurations",
}: RichMenuHeaderProps) {
  return (
    <div className="mb-2 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <Link href="/rich-menu/create">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          New Rich Menu
        </button>
      </Link>
    </div>
  );
}
