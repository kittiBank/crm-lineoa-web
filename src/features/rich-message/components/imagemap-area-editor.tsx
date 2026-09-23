"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ACTION_TYPE_OPTIONS,
  RichMessageActionType,
  RichMessageAreaConfig,
} from "../types";
import { errorInputClassName, FieldError, RequiredMark } from "./form-field";

interface ImagemapAreaEditorProps {
  areaIndex: number;
  area: RichMessageAreaConfig;
  onChange: (area: RichMessageAreaConfig) => void;
  readOnly?: boolean;
  error?: { uri?: string; text?: string };
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const selectClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export function ImagemapAreaEditor({
  areaIndex,
  area,
  onChange,
  readOnly = false,
  error,
}: ImagemapAreaEditorProps) {
  const actionMeta = ACTION_TYPE_OPTIONS.find(
    (item) => item.value === area.actionType,
  );

  return (
    <fieldset
      disabled={readOnly}
      className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Area {areaIndex + 1}
        </h3>
        <Badge variant="outline">
          {area.actionType === "uri" ? "Link" : "Message"}
        </Badge>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bounds (px)
        </label>
        <p className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
          x: {area.bounds.x}, y: {area.bounds.y}, w: {area.bounds.width}, h:{" "}
          {area.bounds.height}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Draw, move, or resize on the preview canvas
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Action type <RequiredMark />
        </label>
        <select
          value={area.actionType}
          onChange={(event) =>
            onChange({
              ...area,
              actionType: event.target.value as RichMessageActionType,
            })
          }
          className={selectClassName}
        >
          {ACTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {actionMeta && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {actionMeta.description}
          </p>
        )}
      </div>

      {area.actionType === "uri" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL <RequiredMark />
          </label>
          <Input
            value={area.uri || ""}
            onChange={(event) => onChange({ ...area, uri: event.target.value })}
            placeholder="https://example.com"
            className={
              error?.uri
                ? `${inputClassName} ${errorInputClassName}`
                : inputClassName
            }
            aria-invalid={Boolean(error?.uri)}
          />
          <FieldError message={error?.uri} />
          {!error?.uri && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Must be a valid link starting with https://
            </p>
          )}
        </div>
      )}

      {area.actionType === "message" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message text <RequiredMark />
          </label>
          <textarea
            value={area.text || ""}
            onChange={(event) => onChange({ ...area, text: event.target.value })}
            placeholder="Text sent when the user taps this area"
            rows={3}
            className={`${inputClassName} resize-none ${
              error?.text ? errorInputClassName : ""
            }`}
            aria-invalid={Boolean(error?.text)}
          />
          <FieldError message={error?.text} />
        </div>
      )}
    </fieldset>
  );
}
