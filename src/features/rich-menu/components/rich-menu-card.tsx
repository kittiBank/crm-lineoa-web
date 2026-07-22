"use client";

import { Edit2, Eye, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichMenuRecord } from "../types";

interface RichMenuCardProps {
  menu: RichMenuRecord;
  isApplying?: boolean;
  isDeleting?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onApplyMember?: (id: string) => void;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Inactive
    </span>
  );
}

export function RichMenuCard({
  menu,
  isApplying = false,
  isDeleting = false,
  onView,
  onEdit,
  onDelete,
  onApplyMember,
}: RichMenuCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="relative aspect-[2500/1686] bg-gray-100 dark:bg-gray-900">
        {menu.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menu.imageUrl}
            alt={menu.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No preview
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={() => onView(menu.id)}
            className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(menu.id)}
            className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(menu.id)}
            disabled={isDeleting}
            className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="Delete"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {menu.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {menu.chatBarText} · {menu.sizeWidth}×{menu.sizeHeight}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={menu.menuType === "default" ? "default" : "secondary"}
            >
              {menu.menuType === "default" ? "Guest" : "Member"}
            </Badge>
            <StatusBadge isActive={menu.isActive} />
          </div>
        </div>

        {menu.menuType === "member" && onApplyMember && (
          <Button
            size="sm"
            variant="outline"
            disabled={isApplying}
            onClick={() => onApplyMember(menu.id)}
            className="w-full"
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              "Link to all members"
            )}
          </Button>
        )}
      </div>
    </article>
  );
}
