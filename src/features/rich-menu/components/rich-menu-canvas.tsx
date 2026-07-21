"use client";

import { cn } from "@/lib/utils";
import { RichMenuAreaConfig, RichMenuLayout } from "../types";

interface RichMenuCanvasProps {
  layout: RichMenuLayout;
  imagePreview?: string | null;
  areas: RichMenuAreaConfig[];
  selectedIndex: number;
  onSelectArea: (index: number) => void;
}

export function RichMenuCanvas({
  layout,
  imagePreview,
  areas,
  selectedIndex,
  onSelectArea,
}: RichMenuCanvasProps) {
  const aspectRatio = layout.size.width / layout.size.height;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {layout.size.width} × {layout.size.height}px
        </span>
        <span>{layout.cells.length} areas</span>
      </div>

      <div
        className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-gray-300 bg-gray-100 shadow-inner dark:border-gray-600 dark:bg-gray-900"
        style={{ aspectRatio }}
      >
        {imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt="Rich menu preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-sm text-gray-400">
            Upload an image to preview
          </div>
        )}

        <div className="absolute inset-0 grid">
          {layout.cells.map((cell, index) => {
            const left = (cell.x / layout.size.width) * 100;
            const top = (cell.y / layout.size.height) * 100;
            const width = (cell.width / layout.size.width) * 100;
            const height = (cell.height / layout.size.height) * 100;
            const selected = selectedIndex === index;
            const area = areas[index];

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectArea(index)}
                className={cn(
                  "absolute flex flex-col items-center justify-center border-2 p-1 text-center transition-all",
                  selected
                    ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_0_2px_rgba(250,204,21,0.35)]"
                    : "border-white/70 bg-black/10 hover:border-yellow-300 hover:bg-yellow-300/10",
                )}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              >
                <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:text-xs">
                  {index + 1}
                </span>
                {area?.label && (
                  <span className="mt-1 line-clamp-2 rounded bg-black/50 px-1 text-[9px] text-white sm:text-[11px]">
                    {area.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click each area to configure its action. Selected area is highlighted in
        yellow.
      </p>
    </div>
  );
}
