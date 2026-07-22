"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCarouselColumn } from "../lib/create-message";
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
        <TextEditor
          message={message}
          onChange={onChange}
          readOnly={readOnly}
        />
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
        <FlexEditor
          message={message}
          onChange={onChange}
          readOnly={readOnly}
        />
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
  return (
    <fieldset disabled={readOnly} className="space-y-4 border-0 p-0">
      <Field label="Image URL">
        <input
          type="url"
          value={message.imageUrl}
          onChange={(event) =>
            onChange({ ...message, imageUrl: event.target.value })
          }
          className={inputClassName}
          placeholder="https://example.com/image.jpg"
        />
      </Field>
      {!readOnly && (
        <Field label="Or upload image">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onChange({ ...message, imageUrl: URL.createObjectURL(file) });
              }
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700"
          />
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
  return (
    <fieldset disabled={readOnly} className="space-y-4 border-0 p-0">
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
      <Field label="Preview image URL">
        <input
          type="url"
          value={message.previewImageUrl}
          onChange={(event) =>
            onChange({ ...message, previewImageUrl: event.target.value })
          }
          className={inputClassName}
          placeholder="https://example.com/preview.jpg"
        />
      </Field>
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
    <fieldset disabled={readOnly} className="grid gap-4 border-0 p-0 md:grid-cols-2">
      <Field label="Alt text">
        <input
          value={message.altText}
          onChange={(event) =>
            onChange({ ...message, altText: event.target.value })
          }
          className={inputClassName}
        />
      </Field>
      <Field label="Image URL">
        <input
          type="url"
          value={message.imageUrl}
          onChange={(event) =>
            onChange({ ...message, imageUrl: event.target.value })
          }
          className={inputClassName}
        />
      </Field>
      <Field label="Title">
        <input
          value={message.title}
          onChange={(event) =>
            onChange({ ...message, title: event.target.value })
          }
          className={inputClassName}
        />
      </Field>
      <Field label="Button label">
        <input
          value={message.buttonLabel}
          onChange={(event) =>
            onChange({ ...message, buttonLabel: event.target.value })
          }
          className={inputClassName}
        />
      </Field>
      <Field label="Description" className="md:col-span-2">
        <textarea
          rows={3}
          value={message.description}
          onChange={(event) =>
            onChange({ ...message, description: event.target.value })
          }
          className={`${inputClassName} resize-none`}
        />
      </Field>
      <Field label="Button URL" className="md:col-span-2">
        <input
          type="url"
          value={message.buttonUrl}
          onChange={(event) =>
            onChange({ ...message, buttonUrl: event.target.value })
          }
          className={inputClassName}
        />
      </Field>
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
    <fieldset disabled={readOnly} className="space-y-4 border-0 p-0">
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
                type="url"
                value={column.imageUrl}
                onChange={(event) =>
                  updateColumn(column.id, { imageUrl: event.target.value })
                }
                className={inputClassName}
              />
            </Field>
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
