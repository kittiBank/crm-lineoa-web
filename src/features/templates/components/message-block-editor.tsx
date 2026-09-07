"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import {
  createCarouselColumn,
  DEFAULT_TEMPLATE_MEDIA_PATH,
} from "../lib/create-message";
import { uploadTemplateImage, uploadTemplateVideo } from "../lib/api";
import { captureVideoThumbnail } from "../lib/video-thumbnail";
import {
  CarouselMessageBlock,
  FlexMessageBlock,
  ImageMessageBlock,
  TemplateMessageBlock,
  TextMessageBlock,
  VideoMessageBlock,
} from "../types/builder";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

interface MessageBlockEditorProps {
  message: TemplateMessageBlock | null;
  onChange: (message: TemplateMessageBlock) => void;
  readOnly?: boolean;
}

export function MessageBlockEditor({
  message,
  onChange,
  readOnly = false,
}: MessageBlockEditorProps) {
  if (!message) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
        Select a message block to {readOnly ? "view" : "edit"} its content.
      </div>
    );
  }

  switch (message.type) {
    case "text":
      return (
        <TextEditor message={message} onChange={onChange} readOnly={readOnly} />
      );
    case "image":
      return (
        <ImageEditor
          message={message}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case "video":
      return (
        <VideoEditor
          message={message}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    case "flex":
      return (
        <FlexEditor message={message} onChange={onChange} readOnly={readOnly} />
      );
    case "carousel":
      return (
        <CarouselEditor
          message={message}
          onChange={onChange}
          readOnly={readOnly}
        />
      );
    default:
      return null;
  }
}

function TextEditor({
  message,
  onChange,
  readOnly = false,
}: {
  message: TextMessageBlock;
  onChange: (message: TemplateMessageBlock) => void;
  readOnly?: boolean;
}) {
  return (
    <fieldset disabled={readOnly} className="space-y-4 border-0 p-0">
      <Field label="Message text">
        <textarea
          rows={6}
          value={message.text}
          onChange={(event) =>
            onChange({ ...message, text: event.target.value })
          }
          className={`${inputClassName} resize-none`}
          placeholder="Enter broadcast text..."
        />
      </Field>
    </fieldset>
  );
}

function ImageEditor({
  message,
  onChange,
  readOnly = false,
}: {
  message: ImageMessageBlock;
  onChange: (message: TemplateMessageBlock) => void;
  readOnly?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    if (message.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(message.previewUrl);
    }
    onChange({ ...message, previewUrl: localPreviewUrl });

    setIsUploading(true);
    try {
      const { url, displayUrl } = await uploadTemplateImage(file);
      onChange({
        ...message,
        imageUrl: displayUrl || url,
        previewUrl: localPreviewUrl,
      });
      toast.success("Image uploaded");
    } catch (error) {
      URL.revokeObjectURL(localPreviewUrl);
      onChange({ ...message, previewUrl: undefined });
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <fieldset
      disabled={readOnly || isUploading}
      className="space-y-4 border-0 p-0"
    >
      <Field label="Image URL">
        <input
          type="text"
          value={message.imageUrl}
          onChange={(event) =>
            onChange({ ...message, imageUrl: event.target.value })
          }
          className={inputClassName}
          placeholder="/defaults/template-preview.jpg"
        />
      </Field>
      {!readOnly && (
        <Field label="Or upload image">
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              void handleUpload(file);
              event.target.value = "";
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 disabled:opacity-60"
          />
          {isUploading && (
            <p className="mt-1.5 text-xs text-gray-500">
              Uploading to storage...
            </p>
          )}
        </Field>
      )}
    </fieldset>
  );
}

function VideoEditor({
  message,
  onChange,
  readOnly = false,
}: {
  message: VideoMessageBlock;
  onChange: (message: TemplateMessageBlock) => void;
  readOnly?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be 50 MB or smaller");
      return;
    }

    let localThumbnailUrl: string | undefined;
    setIsUploading(true);

    try {
      let thumbnailFile: File | null = null;
      try {
        thumbnailFile = await captureVideoThumbnail(file);
        localThumbnailUrl = URL.createObjectURL(thumbnailFile);
        if (message.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(message.previewUrl);
        }
        onChange({
          ...message,
          previewUrl: localThumbnailUrl,
        });
      } catch {
        // Keep the default thumbnail if frame capture fails.
        localThumbnailUrl = undefined;
      }

      const videoResult = await uploadTemplateVideo(file);

      let nextPreviewImageUrl =
        message.previewImageUrl || DEFAULT_TEMPLATE_MEDIA_PATH;
      let thumbnailUploadFailed = false;

      if (thumbnailFile) {
        try {
          const thumbnailResult = await uploadTemplateImage(thumbnailFile);
          nextPreviewImageUrl =
            thumbnailResult.displayUrl || thumbnailResult.url;
        } catch {
          // Video can still be saved with the default/public thumbnail.
          thumbnailUploadFailed = true;
        }
      }

      onChange({
        ...message,
        videoUrl: videoResult.displayUrl || videoResult.url,
        previewImageUrl: nextPreviewImageUrl,
        previewUrl: localThumbnailUrl,
      });

      if (thumbnailUploadFailed) {
        toast.error(
          "Video uploaded, but thumbnail upload failed. Using default thumbnail.",
        );
      } else {
        toast.success("Video uploaded");
      }
    } catch (error) {
      if (localThumbnailUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localThumbnailUrl);
      }
      onChange({
        ...message,
        previewUrl: undefined,
        previewImageUrl:
          message.previewImageUrl || DEFAULT_TEMPLATE_MEDIA_PATH,
      });
      toast.error(
        error instanceof Error ? error.message : "Failed to upload video",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <fieldset
      disabled={readOnly || isUploading}
      className="space-y-4 border-0 p-0"
    >
      <Field label="Video URL">
        <input
          type="url"
          value={message.videoUrl}
          onChange={(event) =>
            onChange({ ...message, videoUrl: event.target.value })
          }
          className={inputClassName}
          placeholder="https://example.com/video.mp4"
        />
      </Field>
      {!readOnly && (
        <Field label="Or upload video">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              void handleUpload(file);
              event.target.value = "";
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 disabled:opacity-60"
          />
          {isUploading && (
            <p className="mt-1.5 text-xs text-gray-500">
              Uploading video and generating thumbnail...
            </p>
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Thumbnail is generated automatically from the video. A default
            thumbnail is used until a video is uploaded.
          </p>
        </Field>
      )}
    </fieldset>
  );
}

function FlexEditor({
  message,
  onChange,
  readOnly = false,
}: {
  message: FlexMessageBlock;
  onChange: (message: TemplateMessageBlock) => void;
  readOnly?: boolean;
}) {
  return (
    <fieldset disabled={readOnly} className="space-y-4 border-0 p-0">
      <Field label="Alt text">
        <input
          value={message.altText}
          onChange={(event) =>
            onChange({ ...message, altText: event.target.value })
          }
          className={inputClassName}
          placeholder="Text shown when Flex content cannot be displayed"
        />
      </Field>
      <Field label="Flex JSON">
        <textarea
          rows={20}
          value={message.contentsJson ?? ""}
          onChange={(event) =>
            onChange({ ...message, contentsJson: event.target.value })
          }
          className={`${inputClassName} resize-y font-mono text-xs leading-5`}
          placeholder='Paste a LINE Flex Simulator bubble, carousel, or full {"type":"flex",...} message'
          spellCheck={false}
        />
      </Field>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Paste JSON from the{" "}
        <a
          href="https://developers.line.biz/flex-simulator/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          LINE Flex Message Simulator
        </a>
        . JSON is validated when you save the template.
      </p>
    </fieldset>
  );
}

function CarouselEditor({
  message,
  onChange,
  readOnly = false,
}: {
  message: CarouselMessageBlock;
  onChange: (message: TemplateMessageBlock) => void;
  readOnly?: boolean;
}) {
  const [uploadingColumnId, setUploadingColumnId] = useState<string | null>(
    null,
  );
  const toast = useToast();

  const updateColumn = (
    columnId: string,
    patch: Partial<CarouselMessageBlock["columns"][number]>,
  ) => {
    onChange({
      ...message,
      columns: message.columns.map((column) =>
        column.id === columnId ? { ...column, ...patch } : column,
      ),
    });
  };

  const handleColumnUpload = async (
    columnId: string,
    file: File | undefined,
  ) => {
    if (!file) {
      return;
    }

    const column = message.columns.find((item) => item.id === columnId);
    const localPreviewUrl = URL.createObjectURL(file);
    if (column?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(column.previewUrl);
    }
    updateColumn(columnId, { previewUrl: localPreviewUrl });

    setUploadingColumnId(columnId);
    try {
      const { url, displayUrl } = await uploadTemplateImage(file);
      updateColumn(columnId, {
        imageUrl: displayUrl || url,
        previewUrl: localPreviewUrl,
      });
      toast.success("Image uploaded");
    } catch (error) {
      URL.revokeObjectURL(localPreviewUrl);
      updateColumn(columnId, { previewUrl: undefined });
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploadingColumnId(null);
    }
  };

  const addColumn = () => {
    if (message.columns.length >= 10) {
      return;
    }

    onChange({
      ...message,
      columns: [...message.columns, createCarouselColumn()],
    });
  };

  const removeColumn = (columnId: string) => {
    if (message.columns.length <= 1) {
      return;
    }

    onChange({
      ...message,
      columns: message.columns.filter((column) => column.id !== columnId),
    });
  };

  return (
    <fieldset
      disabled={readOnly || Boolean(uploadingColumnId)}
      className="space-y-4 border-0 p-0"
    >
      <Field label="Alt text">
        <input
          value={message.altText}
          onChange={(event) =>
            onChange({ ...message, altText: event.target.value })
          }
          className={inputClassName}
        />
      </Field>

      {message.columns.map((column, index) => (
        <div
          key={column.id || `carousel-column-${index}`}
          className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Column {index + 1}
            </h4>
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeColumn(column.id)}
                disabled={message.columns.length <= 1}
                className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title">
              <input
                value={column.title}
                onChange={(event) =>
                  updateColumn(column.id, { title: event.target.value })
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Image URL">
              <input
                type="text"
                value={column.imageUrl}
                onChange={(event) =>
                  updateColumn(column.id, { imageUrl: event.target.value })
                }
                className={inputClassName}
                placeholder="/defaults/template-preview.jpg"
              />
            </Field>
            {!readOnly && (
              <Field label="Or upload image" className="md:col-span-2">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingColumnId === column.id}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    void handleColumnUpload(column.id, file);
                    event.target.value = "";
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 disabled:opacity-60"
                />
                {uploadingColumnId === column.id && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Uploading to storage...
                  </p>
                )}
              </Field>
            )}
            <Field label="Text" className="md:col-span-2">
              <textarea
                rows={2}
                value={column.text}
                onChange={(event) =>
                  updateColumn(column.id, { text: event.target.value })
                }
                className={`${inputClassName} resize-none`}
              />
            </Field>
            <Field label="Action label">
              <input
                value={column.actionLabel}
                onChange={(event) =>
                  updateColumn(column.id, { actionLabel: event.target.value })
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Action URL">
              <input
                type="url"
                value={column.actionUrl}
                onChange={(event) =>
                  updateColumn(column.id, { actionUrl: event.target.value })
                }
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      ))}

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={addColumn}
          disabled={message.columns.length >= 10}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add column ({message.columns.length}/10)
        </Button>
      )}
    </fieldset>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}
