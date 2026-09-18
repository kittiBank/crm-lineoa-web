"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImageFile } from "../lib/image-crop";

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  targetSize: { width: number; height: number };
  fileBaseName?: string;
  onCancel: () => void;
  onApply: (file: File) => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  targetSize,
  fileBaseName = "rich-menu",
  onCancel,
  onApply,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspect = targetSize.width / targetSize.height;

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const resetState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const file = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        targetSize,
        fileBaseName,
      );
      resetState();
      onApply(file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process the image",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isProcessing) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!isProcessing}>
        <DialogHeader>
          <DialogTitle>Crop rich menu image</DialogTitle>
          <DialogDescription>
            Fit your image to exactly {targetSize.width}×{targetSize.height}px
            — the size LINE requires for this layout.
          </DialogDescription>
        </DialogHeader>

        {imageSrc && (
          <div
            className="relative w-full overflow-hidden rounded-lg bg-gray-900"
            style={{ aspectRatio: aspect, maxHeight: 420 }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              restrictPosition
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
        )}

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-blue-600"
            aria-label="Zoom"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isProcessing || !croppedAreaPixels}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Processing...
              </>
            ) : (
              "Apply crop"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
