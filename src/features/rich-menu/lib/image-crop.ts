export interface PixelCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MAX_OUTPUT_BYTES = 1024 * 1024;
const JPEG_QUALITY_STEPS = [0.92, 0.85, 0.75, 0.6, 0.45, 0.3];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Failed to load the selected image")),
    );
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to export image")),
      type,
      quality,
    );
  });
}

/**
 * Renders the selected crop region onto a canvas at the exact target pixel
 * size LINE requires, then exports it — trying PNG first and falling back
 * to progressively more compressed JPEG — until the result fits LINE's
 * 1 MB rich menu image limit.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: PixelCropArea,
  targetSize: { width: number; height: number },
  baseFileName = "rich-menu",
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize.width,
    targetSize.height,
  );

  const pngBlob = await canvasToBlob(canvas, "image/png");
  if (pngBlob.size <= MAX_OUTPUT_BYTES) {
    return new File([pngBlob], `${baseFileName}.png`, { type: "image/png" });
  }

  for (const quality of JPEG_QUALITY_STEPS) {
    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (jpegBlob.size <= MAX_OUTPUT_BYTES) {
      return new File([jpegBlob], `${baseFileName}.jpg`, {
        type: "image/jpeg",
      });
    }
  }

  throw new Error(
    "Cropped image is still larger than 1 MB even at low quality. Try a tighter crop or a simpler image.",
  );
}
