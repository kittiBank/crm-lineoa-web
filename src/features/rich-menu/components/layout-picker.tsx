"use client";

import { cn } from "@/lib/utils";
import { RichMenuGridPreset } from "../lib/layouts";
import { RichMenuLayout } from "../types";

interface LayoutPickerProps {
  layouts: RichMenuLayout[];
  selectedLayoutId: string;
  onSelect: (layoutId: string) => void;
  gridPresets?: RichMenuGridPreset[];
  selectedGridPresetId?: string | null;
  onSelectGridPreset?: (presetId: string) => void;
  readOnly?: boolean;
}

function SizePreview({
  layoutId,
  selected,
}: {
  layoutId: string;
  selected: boolean;
}) {
  const isCompact = layoutId === "compact";
  const isCustom = layoutId === "custom";

  return (
    <div
      className={cn(
        "flex h-16 w-full items-center justify-center rounded-md border p-2",
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
      )}
    >
      <div
        className={cn(
          "w-full rounded-sm border-2 border-dashed",
          selected
            ? "border-blue-400 bg-blue-100/80 dark:border-blue-600 dark:bg-blue-900/40"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
          isCompact ? "h-7" : "h-12",
          isCustom && "border-dotted",
        )}
      />
    </div>
  );
}

function GridPreview({
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
  gridPresets = [],
  selectedGridPresetId = null,
  onSelectGridPreset,
  readOnly = false,
}: LayoutPickerProps) {
  const showGridPresets =
    selectedLayoutId !== "custom" && gridPresets.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              <SizePreview layoutId={layout.id} selected={selected} />
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

      {showGridPresets && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Default grid
          </p>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Pick a starting layout. You can still move, resize, or draw more
            areas after.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gridPresets.map((preset) => {
              const selected = preset.id === selectedGridPresetId;
              if (readOnly && !selected) {
                return null;
              }

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectGridPreset?.(preset.id)}
                  disabled={readOnly}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                    selected
                      ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
                      : "border-gray-200 dark:border-gray-700",
                    readOnly && "cursor-default hover:shadow-none",
                  )}
                >
                  <GridPreview
                    rows={preset.rows}
                    cols={preset.cols}
                    selected={selected}
                  />
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {preset.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
