import {
  CUSTOMER_TAGS,
  CUSTOMER_TAG_DEFINITIONS,
} from "@/constants/customer-tag";
import { DashboardUserFilters } from "../../types";
import { FilterBar, FilterDefinition } from "../filter-bar";

export const USER_FILTERS: FilterDefinition<keyof DashboardUserFilters>[] = [
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

interface UsersFilterBarProps {
  filters: DashboardUserFilters;
  onChange: (filters: DashboardUserFilters) => void;
}

export function UsersFilterBar({ filters, onChange }: UsersFilterBarProps) {
  return (
    <FilterBar
      label="User filters"
      filters={USER_FILTERS}
      values={filters}
      onChange={(values) => onChange(values as DashboardUserFilters)}
    />
  );
}
