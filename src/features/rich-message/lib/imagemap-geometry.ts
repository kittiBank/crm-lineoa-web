import { RichMessageAreaConfig, RichMessageBounds } from "../types";

// Must match the API's IMAGEMAP_BASE_WIDTH (templates/imagemap-image.ts) —
// the backend re-derives baseSize.height from the same source image with the
// same formula, so areas drawn in this coordinate space land correctly.
export const IMAGEMAP_BASE_WIDTH = 1040;
export const LINE_IMAGEMAP_MAX_AREAS = 50;
export const IMAGEMAP_MIN_DRAW_SIZE = 20;

export function computeBaseSize(
  naturalWidth: number,
  naturalHeight: number,
): { width: number; height: number } {
  return {
    width: IMAGEMAP_BASE_WIDTH,
    height: Math.round((IMAGEMAP_BASE_WIDTH / naturalWidth) * naturalHeight),
  };
}

export function createFullAreaBounds(size: {
  width: number;
  height: number;
}): RichMessageBounds {
  return { x: 0, y: 0, width: size.width, height: size.height };
}

export function createDefaultArea(bounds: RichMessageBounds): RichMessageAreaConfig {
  return { actionType: "uri", uri: "", bounds };
}

export function clampBounds(
  bounds: RichMessageBounds,
  size: { width: number; height: number },
  minSize = IMAGEMAP_MIN_DRAW_SIZE,
): RichMessageBounds {
  const width = Math.max(minSize, Math.min(Math.round(bounds.width), size.width));
  const height = Math.max(minSize, Math.min(Math.round(bounds.height), size.height));
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
  minSize = IMAGEMAP_MIN_DRAW_SIZE,
): RichMessageBounds | null {
  const left = Math.max(0, Math.min(startX, endX));
  const top = Math.max(0, Math.min(startY, endY));
  const right = Math.min(size.width, Math.max(startX, endX));
  const bottom = Math.min(size.height, Math.max(startY, endY));

  const width = Math.round(right - left);
  const height = Math.round(bottom - top);

  if (width < minSize || height < minSize) {
    return null;
  }

  return clampBounds({ x: Math.round(left), y: Math.round(top), width, height }, size, minSize);
}

/**
 * Rescales areas drawn against a previous baseSize (e.g. before the source
 * image was replaced) onto the new one, preserving relative position/size.
 */
export function rescaleAreas(
  areas: RichMessageAreaConfig[],
  fromSize: { width: number; height: number },
  toSize: { width: number; height: number },
): RichMessageAreaConfig[] {
  const scaleX = toSize.width / fromSize.width;
  const scaleY = toSize.height / fromSize.height;

  return areas.map((area) => ({
    ...area,
    bounds: clampBounds(
      {
        x: area.bounds.x * scaleX,
        y: area.bounds.y * scaleY,
        width: area.bounds.width * scaleX,
        height: area.bounds.height * scaleY,
      },
      toSize,
    ),
  }));
}

export function normalizeAreasWithBounds(
  areas: unknown,
  size: { width: number; height: number },
): RichMessageAreaConfig[] {
  if (!Array.isArray(areas) || areas.length === 0) {
    return [createDefaultArea(createFullAreaBounds(size))];
  }

  return areas.map((area) => {
    const candidate = area as Partial<RichMessageAreaConfig> | undefined;
    const bounds =
      candidate?.bounds &&
      typeof candidate.bounds.x === "number" &&
      typeof candidate.bounds.y === "number" &&
      typeof candidate.bounds.width === "number" &&
      typeof candidate.bounds.height === "number"
        ? candidate.bounds
        : createFullAreaBounds(size);

    return {
      actionType: candidate?.actionType === "message" ? "message" : "uri",
      text: candidate?.text,
      uri: candidate?.uri,
      bounds,
    };
  });
}
