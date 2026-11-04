import { SlidersHorizontal } from "lucide-react";
import {
  CUSTOMER_TAGS,
  CUSTOMER_TAG_DEFINITIONS,
} from "@/constants/customer-tag";
import { cn } from "@/lib/utils";
import { DashboardUserFilters } from "../../types";
import { dashboardCardClass } from "../chart-card";

type FilterKey = keyof DashboardUserFilters;

const FILTERS: Array<{
  key: FilterKey;
  label: string;
  options: Array<{ value: string; label: string }>;
}> = [
    {
      key: "userType",
      label: "User type",
      options: [
        { value: "", label: "All users" },
        { value: "Member", label: "Members" },
        { value: "Guest", label: "Guests" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All statuses" },
        { value: "following", label: "Following" },
        // LINE sends one event for unfollow and block.
        { value: "blocked", label: "Unfollowed / blocked" },
      ],
    },
    {
      key: "tier",
      label: "Tier",
      options: [
        { value: "", label: "All tiers" },
        { value: "Silver", label: "Silver" },
        { value: "Gold", label: "Gold" },
        { value: "Platinum", label: "Platinum" },
        { value: "Member", label: "Member (no tier)" },
      ],
    },
    {
      key: "tag",
      label: "Customer tag",
      options: [
        { value: "", label: "All tags" },
        ...CUSTOMER_TAGS.map((tag) => ({
          value: tag,
          label: CUSTOMER_TAG_DEFINITIONS[tag].label,
        })),
      ],
    },
  ];

/** Allowed values per filter, for reading them back from the URL. */
export const USER_FILTER_VALUES: Record<FilterKey, string[]> = Object.fromEntries(
  FILTERS.map((f) => [f.key, f.options.map((o) => o.value).filter(Boolean)]),
) as Record<FilterKey, string[]>;

export const USER_FILTER_KEYS = FILTERS.map((f) => f.key);

interface UsersFilterBarProps {
  filters: DashboardUserFilters;
  onChange: (filters: DashboardUserFilters) => void;
}

export function UsersFilterBar({ filters, onChange }: UsersFilterBarProps) {
  const active = USER_FILTER_KEYS.filter((key) => filters[key]).length;

  return (
    <section
      aria-label="User filters"
      className={cn(
        dashboardCardClass,
        "flex flex-col gap-3 px-4 py-3.5",
      )}
    >
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-950 dark:text-white">
        <SlidersHorizontal className="size-4" />
        Filters
      </span>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        {FILTERS.map((filter) => (
          <label
            key={filter.key}
            className="flex min-w-[150px] flex-1 flex-col gap-1 text-xs font-medium text-neutral-500 sm:flex-none dark:text-neutral-400"
          >
            {filter.label}
            <select
              value={filters[filter.key] ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  [filter.key]: event.target.value || undefined,
                })
              }
              className={cn(
                "h-9 rounded-lg border bg-white px-2.5 text-[13px] font-medium text-neutral-950 outline-none",
                "focus-visible:ring-2 focus-visible:ring-chart-blue-500 dark:bg-neutral-900 dark:text-white",
                filters[filter.key]
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
            {active
              ? `${active} filter${active > 1 ? "s" : ""} applied`
              : "No filters applied"}
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
