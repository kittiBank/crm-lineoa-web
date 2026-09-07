import {
  LINE_RICH_MENU_MAX_AREAS,
  RichMenuAreaConfig,
  RichMenuBounds,
  RichMenuLayout,
  RichMenuSizeMode,
} from "../types";

export { LINE_RICH_MENU_MAX_AREAS };

export interface RichMenuGridPreset {
  id: string;
  label: string;
  description: string;
  rows: number;
  cols: number;
}

function splitSize(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  return Array.from({ length: parts }, (_, index) =>
    base + (index === parts - 1 ? remainder : 0),
  );
}

export function buildGrid(
  width: number,
  height: number,
  rows: number,
  cols: number,
): RichMenuBounds[] {
  const colWidths = splitSize(width, cols);
  const rowHeights = splitSize(height, rows);
  const cells: RichMenuBounds[] = [];

  let y = 0;
  for (let row = 0; row < rows; row++) {
    let x = 0;
    for (let col = 0; col < cols; col++) {
      cells.push({
        x,
        y,
        width: colWidths[col],
        height: rowHeights[row],
      });
      x += colWidths[col];
    }
    y += rowHeights[row];
  }

  return cells;
}

/** Top-level size modes: Big / Compact / Custom */
export const RICH_MENU_LAYOUTS: RichMenuLayout[] = [
  {
    id: "big",
    label: "Big",
    description: "Full height 2500×1686 with default grids",
    size: { width: 2500, height: 1686 },
    rows: 1,
    cols: 1,
    cells: [],
  },
  {
    id: "compact",
    label: "Compact",
    description: "Half height 2500×843 with default grids",
    size: { width: 2500, height: 843 },
    rows: 1,
    cols: 1,
    cells: [],
  },
  {
    id: "custom",
    label: "Custom",
    description: "Freeform areas — draw on the canvas",
    size: { width: 2500, height: 1686 },
    rows: 1,
    cols: 1,
    cells: [],
  },
];

export const BIG_GRID_PRESETS: RichMenuGridPreset[] = [
  {
    id: "big-1",
    label: "1 area",
    description: "Full menu",
    rows: 1,
    cols: 1,
  },
  {
    id: "big-2-cols",
    label: "2 columns",
    description: "1×2",
    rows: 1,
    cols: 2,
  },
  {
    id: "big-3-cols",
    label: "3 columns",
    description: "1×3",
    rows: 1,
    cols: 3,
  },
  {
    id: "big-2x2",
    label: "2×2 grid",
    description: "4 equal areas",
    rows: 2,
    cols: 2,
  },
  {
    id: "big-2x3",
    label: "2×3 grid",
    description: "6 areas",
    rows: 2,
    cols: 3,
  },
  {
    id: "big-3x2",
    label: "3×2 grid",
    description: "6 areas",
    rows: 3,
    cols: 2,
  },
  {
    id: "big-3x3",
    label: "3×3 grid",
    description: "9 equal areas",
    rows: 3,
    cols: 3,
  },
];

export const COMPACT_GRID_PRESETS: RichMenuGridPreset[] = [
  {
    id: "compact-1",
    label: "1 area",
    description: "Full compact",
    rows: 1,
    cols: 1,
  },
  {
    id: "compact-2-cols",
    label: "2 columns",
    description: "1×2",
    rows: 1,
    cols: 2,
  },
  {
    id: "compact-3-cols",
    label: "3 columns",
    description: "1×3",
    rows: 1,
    cols: 3,
  },
  {
    id: "compact-2x2",
    label: "2×2 grid",
    description: "4 equal areas",
    rows: 2,
    cols: 2,
  },
  {
    id: "compact-2x3",
    label: "2×3 grid",
    description: "6 areas",
    rows: 2,
    cols: 3,
  },
];

export const DEFAULT_GRID_PRESET_BY_SIZE: Record<
  Exclude<RichMenuSizeMode, "custom">,
  string
> = {
  big: "big-2x3",
  compact: "compact-2-cols",
};

export function getLayoutById(layoutId: string): RichMenuLayout {
  const layout = RICH_MENU_LAYOUTS.find((item) => item.id === layoutId);
  if (!layout) {
    throw new Error(`Unknown layout: ${layoutId}`);
  }
  return layout;
}

export function getGridPresetsForSize(
  sizeMode: string,
): RichMenuGridPreset[] {
  if (sizeMode === "compact") {
    return COMPACT_GRID_PRESETS;
  }
  if (sizeMode === "big") {
    return BIG_GRID_PRESETS;
  }
  return [];
}

export function getGridPresetById(
  sizeMode: string,
  presetId: string,
): RichMenuGridPreset | undefined {
  return getGridPresetsForSize(sizeMode).find((item) => item.id === presetId);
}

export function getLayoutIdBySize(width: number, height: number): RichMenuSizeMode {
  if (width === 2500 && height === 843) {
    return "compact";
  }
  return "big";
}

export function createFullAreaBounds(size: {
  width: number;
  height: number;
}): RichMenuBounds {
  return { x: 0, y: 0, width: size.width, height: size.height };
}

export function createDefaultArea(
  index: number,
  bounds: RichMenuBounds,
): RichMenuAreaConfig {
  const presets = [
    { label: "Register", actionType: "postback" as const, data: "action=register" },
    { label: "Login", actionType: "postback" as const, data: "action=login" },
    { label: "Campaign", actionType: "postback" as const, data: "action=campaign" },
    { label: "My Points", actionType: "postback" as const, data: "action=points" },
    { label: "Rewards", actionType: "postback" as const, data: "action=rewards" },
    { label: "Contact", actionType: "postback" as const, data: "action=contact" },
    { label: "Shop", actionType: "postback" as const, data: "action=shop" },
    { label: "News", actionType: "postback" as const, data: "action=news" },
    { label: "Help", actionType: "postback" as const, data: "action=help" },
  ];

  const preset = presets[index];

  return {
    label: preset?.label || `Area ${index + 1}`,
    actionType: preset?.actionType || "postback",
    data: preset?.data || `action=area_${index + 1}`,
    bounds,
  };
}

export function createAreasFromGrid(
  size: { width: number; height: number },
  rows: number,
  cols: number,
): RichMenuAreaConfig[] {
  return buildGrid(size.width, size.height, rows, cols).map((bounds, index) =>
    createDefaultArea(index, bounds),
  );
}

export function createInitialAreas(
  layoutId: string,
  gridPresetId?: string,
): RichMenuAreaConfig[] {
  const layout = getLayoutById(layoutId);

  if (layoutId === "custom") {
    return [];
  }

  const presets = getGridPresetsForSize(layoutId);
  const preset =
    (gridPresetId
      ? presets.find((item) => item.id === gridPresetId)
      : undefined) ??
    presets.find(
      (item) =>
        item.id ===
        DEFAULT_GRID_PRESET_BY_SIZE[
          layoutId as Exclude<RichMenuSizeMode, "custom">
        ],
    ) ??
    presets[0];

  if (!preset) {
    return [createDefaultArea(0, createFullAreaBounds(layout.size))];
  }

  return createAreasFromGrid(layout.size, preset.rows, preset.cols);
}

export function normalizeAreasWithBounds(
  areas: Array<Partial<RichMenuAreaConfig> & { label?: string }>,
  size: { width: number; height: number },
): RichMenuAreaConfig[] {
  if (!Array.isArray(areas) || areas.length === 0) {
    return [createDefaultArea(0, createFullAreaBounds(size))];
  }

  return areas.map((area, index) => {
    const bounds =
      area.bounds &&
      typeof area.bounds.x === "number" &&
      typeof area.bounds.y === "number" &&
      typeof area.bounds.width === "number" &&
      typeof area.bounds.height === "number"
        ? area.bounds
        : createFullAreaBounds(size);

    return {
      label: area.label?.trim() || `Area ${index + 1}`,
      actionType: area.actionType || "postback",
      data: area.data,
      text: area.text,
      uri: area.uri,
      mode: area.mode,
      bounds,
    };
  });
}

export function clampBounds(
  bounds: RichMenuBounds,
  size: { width: number; height: number },
  minSize = 40,
): RichMenuBounds {
  const width = Math.max(
    minSize,
    Math.min(Math.round(bounds.width), size.width),
  );
  const height = Math.max(
    minSize,
    Math.min(Math.round(bounds.height), size.height),
  );
  const x = Math.max(0, Math.min(Math.round(bounds.x), size.width - width));
  const y = Math.max(0, Math.min(Math.round(bounds.y), size.height - height));

  return { x, y, width, height };
}

export function normalizeDrawnBounds(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  size: { width: number; height: number },
  minSize = 40,
): RichMenuBounds | null {
  const left = Math.max(0, Math.min(startX, endX));
  const top = Math.max(0, Math.min(startY, endY));
  const right = Math.min(size.width, Math.max(startX, endX));
  const bottom = Math.min(size.height, Math.max(startY, endY));

  const width = Math.round(right - left);
  const height = Math.round(bottom - top);

  if (width < minSize || height < minSize) {
    return null;
  }

  return clampBounds(
    {
      x: Math.round(left),
      y: Math.round(top),
      width,
      height,
    },
    size,
    minSize,
  );
}
