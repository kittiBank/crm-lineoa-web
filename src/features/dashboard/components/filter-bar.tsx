import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardCardClass } from "./chart-card";

export interface FilterDefinition<K extends string = string> {
  key: K;
  label: string;
  /** The first option (value "") is the default and does not count as a filter. */
  options: Array<{ value: string; label: string }>;
}

export type FilterValues<K extends string = string> = Partial<Record<K, string>>;

/** Allowed values per filter, for reading them back from the URL. */
export function allowedFilterValues<K extends string>(
  filters: FilterDefinition<K>[],
): Record<K, string[]> {
  return Object.fromEntries(
    filters.map((f) => [f.key, f.options.map((o) => o.value).filter(Boolean)]),
  ) as Record<K, string[]>;
}

/** Reads the filters in `definitions` from URL params, dropping unknown values. */
export function readFilterParams<K extends string>(
  params: URLSearchParams,
  definitions: FilterDefinition<K>[],
): FilterValues<K> {
  const allowed = allowedFilterValues(definitions);
  const values: FilterValues<K> = {};
  for (const { key } of definitions) {
    const value = params.get(key);
    if (value && allowed[key].includes(value)) {
      values[key] = value;
    }
  }
  return values;
}

/** URL params with `values` written over the filters in `definitions`. */
export function writeFilterParams<K extends string>(
  current: string,
  definitions: FilterDefinition<K>[],
  values: FilterValues<K>,
): URLSearchParams {
  const params = new URLSearchParams(current);
  for (const { key } of definitions) {
    const value = values[key];
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return params;
}

interface FilterBarProps<K extends string> {
  label: string;
  filters: FilterDefinition<K>[];
  values: FilterValues<K>;
  onChange: (values: FilterValues<K>) => void;
  /** Shown instead of "No filters applied" when nothing is set. */
  idleNote?: string;
}

export function FilterBar<K extends string>({
  label,
  filters,
  values,
  onChange,
  idleNote = "No filters applied",
}: FilterBarProps<K>) {
  const active = filters.filter((f) => values[f.key]).length;

  return (
    <section
      aria-label={label}
      className={cn(dashboardCardClass, "flex flex-col gap-3 px-4 py-3.5")}
    >
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-950 dark:text-white">
        <SlidersHorizontal className="size-4" />
        Filters
      </span>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        {filters.map((filter) => (
          <label
            key={filter.key}
            className="flex min-w-[150px] flex-1 flex-col gap-1 text-xs font-medium text-neutral-500 sm:flex-none dark:text-neutral-400"
          >
            {filter.label}
            <select
              value={values[filter.key] ?? ""}
              onChange={(event) =>
                onChange({
                  ...values,
                  [filter.key]: event.target.value || undefined,
                })
              }
              className={cn(
                "h-9 max-w-[240px] rounded-lg border bg-white px-2.5 text-[13px] font-medium text-neutral-950 outline-none",
                "focus-visible:ring-2 focus-visible:ring-chart-blue-500 dark:bg-neutral-900 dark:text-white",
                values[filter.key]
                  ? "border-neutral-950 dark:border-white"
                  : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700",
              )}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="ml-auto flex min-h-9 items-center gap-3">
          <span className="text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
            {active ? `${active} filter${active > 1 ? "s" : ""} applied` : idleNote}
          </span>
          <button
            type="button"
            disabled={!active}
            onClick={() => onChange({})}
            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
