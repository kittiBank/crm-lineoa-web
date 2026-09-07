"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clampBounds,
  createDefaultArea,
  normalizeDrawnBounds,
} from "../lib/layouts";
import {
  LINE_RICH_MENU_MAX_AREAS,
  LINE_RICH_MENU_MIN_DRAW_SIZE,
  RichMenuAreaConfig,
  RichMenuBounds,
  RichMenuLayout,
} from "../types";

type DragMode =
  | { type: "draw"; startX: number; startY: number }
  | {
      type: "move";
      index: number;
      origin: RichMenuBounds;
      startX: number;
      startY: number;
    }
  | {
      type: "resize";
      index: number;
      handle: ResizeHandle;
      origin: RichMenuBounds;
      startX: number;
      startY: number;
    };

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface RichMenuCanvasProps {
  layout: RichMenuLayout;
  imagePreview?: string | null;
  areas: RichMenuAreaConfig[];
  selectedIndex: number;
  onSelectArea: (index: number) => void;
  onChangeAreas: (areas: RichMenuAreaConfig[]) => void;
  readOnly?: boolean;
}

function clientToMenuPoint(
  event: React.PointerEvent,
  element: HTMLElement,
  size: { width: number; height: number },
) {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * size.width;
  const y = ((event.clientY - rect.top) / rect.height) * size.height;
  return {
    x: Math.max(0, Math.min(size.width, x)),
    y: Math.max(0, Math.min(size.height, y)),
  };
}

function resizeBounds(
  origin: RichMenuBounds,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  size: { width: number; height: number },
): RichMenuBounds {
  let { x, y, width, height } = origin;

  if (handle.includes("e")) {
    width = origin.width + dx;
  }
  if (handle.includes("w")) {
    x = origin.x + dx;
    width = origin.width - dx;
  }
  if (handle.includes("s")) {
    height = origin.height + dy;
  }
  if (handle.includes("n")) {
    y = origin.y + dy;
    height = origin.height - dy;
  }

  return clampBounds({ x, y, width, height }, size, LINE_RICH_MENU_MIN_DRAW_SIZE);
}

const HANDLES: ResizeHandle[] = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];

function handleStyle(handle: ResizeHandle): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 10,
    height: 10,
    background: "#facc15",
    border: "1px solid #854d0e",
    borderRadius: 2,
    zIndex: 3,
  };

  const map: Record<ResizeHandle, React.CSSProperties> = {
    nw: { ...base, left: -5, top: -5, cursor: "nwse-resize" },
    n: { ...base, left: "50%", top: -5, marginLeft: -5, cursor: "ns-resize" },
    ne: { ...base, right: -5, top: -5, cursor: "nesw-resize" },
    w: { ...base, left: -5, top: "50%", marginTop: -5, cursor: "ew-resize" },
    e: { ...base, right: -5, top: "50%", marginTop: -5, cursor: "ew-resize" },
    sw: { ...base, left: -5, bottom: -5, cursor: "nesw-resize" },
    s: {
      ...base,
      left: "50%",
      bottom: -5,
      marginLeft: -5,
      cursor: "ns-resize",
    },
    se: { ...base, right: -5, bottom: -5, cursor: "nwse-resize" },
  };

  return map[handle];
}

export function RichMenuCanvas({
  layout,
  imagePreview,
  areas,
  selectedIndex,
  onSelectArea,
  onChangeAreas,
  readOnly = false,
}: RichMenuCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draftBounds, setDraftBounds] = useState<RichMenuBounds | null>(null);
  const draftBoundsRef = useRef<RichMenuBounds | null>(null);
  const dragRef = useRef<DragMode | null>(null);
  const aspectRatio = layout.size.width / layout.size.height;
  const canAddMore = areas.length < LINE_RICH_MENU_MAX_AREAS;

  const updateAreaBounds = (index: number, bounds: RichMenuBounds) => {
    onChangeAreas(
      areas.map((area, areaIndex) =>
        areaIndex === index ? { ...area, bounds } : area,
      ),
    );
  };

  const handlePointerDownBackground = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (readOnly || !canvasRef.current) {
      return;
    }

    if (!canAddMore) {
      return;
    }

    const point = clientToMenuPoint(event, canvasRef.current, layout.size);
    dragRef.current = {
      type: "draw",
      startX: point.x,
      startY: point.y,
    };
    draftBoundsRef.current = null;
    setDraftBounds(null);
    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerDownArea = (
    event: React.PointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.stopPropagation();
    if (readOnly || !canvasRef.current) {
      onSelectArea(index);
      return;
    }

    const point = clientToMenuPoint(event, canvasRef.current, layout.size);
    onSelectArea(index);
    dragRef.current = {
      type: "move",
      index,
      origin: areas[index].bounds,
      startX: point.x,
      startY: point.y,
    };
    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerDownResize = (
    event: React.PointerEvent<HTMLSpanElement>,
    index: number,
    handle: ResizeHandle,
  ) => {
    event.stopPropagation();
    if (readOnly || !canvasRef.current) {
      return;
    }

    const point = clientToMenuPoint(event, canvasRef.current, layout.size);
    onSelectArea(index);
    dragRef.current = {
      type: "resize",
      index,
      handle,
      origin: areas[index].bounds,
      startX: point.x,
      startY: point.y,
    };
    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !canvasRef.current) {
      return;
    }

    const point = clientToMenuPoint(event, canvasRef.current, layout.size);

    if (drag.type === "draw") {
      const next = normalizeDrawnBounds(
        drag.startX,
        drag.startY,
        point.x,
        point.y,
        layout.size,
        LINE_RICH_MENU_MIN_DRAW_SIZE,
      );
      draftBoundsRef.current = next;
      setDraftBounds(next);
      return;
    }

    const dx = point.x - drag.startX;
    const dy = point.y - drag.startY;

    if (drag.type === "move") {
      updateAreaBounds(
        drag.index,
        clampBounds(
          {
            ...drag.origin,
            x: drag.origin.x + dx,
            y: drag.origin.y + dy,
          },
          layout.size,
          LINE_RICH_MENU_MIN_DRAW_SIZE,
        ),
      );
      return;
    }

    updateAreaBounds(
      drag.index,
      resizeBounds(drag.origin, drag.handle, dx, dy, layout.size),
    );
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;

    if (!drag || drag.type !== "draw") {
      draftBoundsRef.current = null;
      setDraftBounds(null);
      return;
    }

    const finalized = draftBoundsRef.current;
    draftBoundsRef.current = null;
    setDraftBounds(null);

    if (!finalized || !canAddMore) {
      return;
    }

    const nextArea = createDefaultArea(areas.length, finalized);
    const nextAreas = [...areas, nextArea];
    onChangeAreas(nextAreas);
    onSelectArea(nextAreas.length - 1);
  };

  const handleDeleteSelected = () => {
    if (readOnly || selectedIndex < 0 || selectedIndex >= areas.length) {
      return;
    }

    const nextAreas = areas.filter((_, index) => index !== selectedIndex);
    onChangeAreas(nextAreas);
    onSelectArea(Math.max(0, Math.min(selectedIndex, nextAreas.length - 1)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>
          {layout.size.width} × {layout.size.height}px
        </span>
        <span>
          {areas.length}/{LINE_RICH_MENU_MAX_AREAS} areas
        </span>
      </div>

      <div
        ref={canvasRef}
        className={cn(
          "relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-gray-300 bg-gray-100 shadow-inner dark:border-gray-600 dark:bg-gray-900",
          !readOnly && canAddMore && "cursor-crosshair",
        )}
        style={{ aspectRatio }}
        onPointerDown={handlePointerDownBackground}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt="Rich menu preview"
            referrerPolicy="no-referrer"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-sm text-gray-400">
            Upload an image to preview
          </div>
        )}

        <div className="absolute inset-0">
          {areas.map((area, index) => {
            const cell = area.bounds;
            const left = (cell.x / layout.size.width) * 100;
            const top = (cell.y / layout.size.height) * 100;
            const width = (cell.width / layout.size.width) * 100;
            const height = (cell.height / layout.size.height) * 100;
            const selected = selectedIndex === index;

            return (
              <button
                key={index}
                type="button"
                onPointerDown={(event) => handlePointerDownArea(event, index)}
                className={cn(
                  "absolute flex flex-col items-center justify-center border-2 p-1 text-center",
                  selected
                    ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_0_2px_rgba(250,204,21,0.35)]"
                    : "border-white/70 bg-black/10 hover:border-yellow-300 hover:bg-yellow-300/10",
                  !readOnly && "cursor-move",
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
                {area.label && (
                  <span className="mt-1 line-clamp-2 rounded bg-black/50 px-1 text-[9px] text-white sm:text-[11px]">
                    {area.label}
                  </span>
                )}

                {selected && !readOnly &&
                  HANDLES.map((handle) => (
                    <span
                      key={handle}
                      role="presentation"
                      onPointerDown={(event) =>
                        handlePointerDownResize(event, index, handle)
                      }
                      style={handleStyle(handle)}
                    />
                  ))}
              </button>
            );
          })}

          {draftBounds && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-yellow-300 bg-yellow-300/20"
              style={{
                left: `${(draftBounds.x / layout.size.width) * 100}%`,
                top: `${(draftBounds.y / layout.size.height) * 100}%`,
                width: `${(draftBounds.width / layout.size.width) * 100}%`,
                height: `${(draftBounds.height / layout.size.height) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {readOnly
            ? "Tap areas are shown on the preview."
            : canAddMore
              ? "Drag on empty space to draw a new area. Drag an area to move, use handles to resize."
              : `Maximum ${LINE_RICH_MENU_MAX_AREAS} areas reached.`}
        </p>
        {!readOnly && areas.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete area {selectedIndex + 1}
          </button>
        )}
      </div>
    </div>
  );
}
