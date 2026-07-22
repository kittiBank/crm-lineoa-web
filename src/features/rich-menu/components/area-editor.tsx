"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ACTION_TYPE_OPTIONS,
  RichMenuActionType,
  RichMenuAreaConfig,
} from "../types";

interface AreaEditorProps {
  areaIndex: number;
  area: RichMenuAreaConfig;
  onChange: (area: RichMenuAreaConfig) => void;
  readOnly?: boolean;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const selectClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export function AreaEditor({
  areaIndex,
  area,
  onChange,
  readOnly = false,
}: AreaEditorProps) {
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
        <Badge variant="outline">{area.actionType}</Badge>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Label *
        </label>
        <Input
          value={area.label}
          onChange={(event) =>
            onChange({ ...area, label: event.target.value })
          }
          placeholder="e.g. Register"
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Action type *
        </label>
        <select
          value={area.actionType}
          onChange={(event) =>
            onChange({
              ...area,
              actionType: event.target.value as RichMenuActionType,
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

      {area.actionType === "postback" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Postback data
          </label>
          <Input
            value={area.data || ""}
            onChange={(event) =>
              onChange({ ...area, data: event.target.value })
            }
            placeholder="action=register"
            className={inputClassName}
          />
        </div>
      )}

      {area.actionType === "message" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message text
          </label>
          <textarea
            value={area.text || ""}
            onChange={(event) =>
              onChange({ ...area, text: event.target.value })
            }
            placeholder="Text sent when user taps this area"
            rows={3}
            className={`${inputClassName} resize-none`}
          />
        </div>
      )}

      {area.actionType === "uri" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL
          </label>
          <Input
            value={area.uri || ""}
            onChange={(event) =>
              onChange({ ...area, uri: event.target.value })
            }
            placeholder="https://example.com"
            className={inputClassName}
          />
        </div>
      )}

      {area.actionType === "datetimepicker" && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Postback data
            </label>
            <Input
              value={area.data || ""}
              onChange={(event) =>
                onChange({ ...area, data: event.target.value })
              }
              placeholder="datetime"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mode
            </label>
            <select
              value={area.mode || "datetime"}
              onChange={(event) =>
                onChange({
                  ...area,
                  mode: event.target.value as "date" | "time" | "datetime",
                })
              }
              className={selectClassName}
            >
              <option value="date">Date</option>
              <option value="time">Time</option>
              <option value="datetime">Date & time</option>
            </select>
          </div>
        </>
      )}
    </fieldset>
  );
}
