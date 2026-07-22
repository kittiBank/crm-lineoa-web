"use client";

import { cn } from "@/lib/utils";
import { RichMenuLayout } from "../types";

interface LayoutPickerProps {
  layouts: RichMenuLayout[];
  selectedLayoutId: string;
  onSelect: (layoutId: string) => void;
  readOnly?: boolean;
}

function LayoutPreview({
  rows,
  cols,
  selected,
}: {
  rows: number;
  cols: number;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "grid h-14 w-full gap-0.5 rounded-md border p-1",
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-sm border",
            selected
              ? "border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/50"
              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
          )}
        />
      ))}
    </div>
  );
}

export function LayoutPicker({
  layouts,
  selectedLayoutId,
  onSelect,
  readOnly = false,
}: LayoutPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {layouts.map((layout) => {
        const selected = layout.id === selectedLayoutId;
        if (readOnly && !selected) {
          return null;
        }

        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout.id)}
            disabled={readOnly}
            className={cn(
              "rounded-lg border p-3 text-left transition-all hover:shadow-sm",
              selected
                ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
                : "border-gray-200 dark:border-gray-700",
              readOnly && "cursor-default hover:shadow-none",
            )}
          >
            <LayoutPreview
              rows={layout.rows}
              cols={layout.cols}
              selected={selected}
            />
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {layout.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {layout.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
