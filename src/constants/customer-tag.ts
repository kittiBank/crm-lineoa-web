/**
 * Auto customer tags computed by the API from LIFF shop orders.
 * Keys mirror crm-lineoa-api `customer-tag.constants.ts`.
 */

export const CUSTOMER_TAGS = [
  "new_customer",
  "first_purchase",
  "repeat_customer",
  "repeat_7d",
  "repeat_14d",
  "repeat_30d",
  "high_spender_5k",
  "high_spender_10k",
  "high_spender_15k",
  "high_spender_30k",
] as const;

export type CustomerTag = (typeof CUSTOMER_TAGS)[number];

export function isCustomerTag(value: unknown): value is CustomerTag {
  return (CUSTOMER_TAGS as readonly string[]).includes(value as string);
}

type CustomerTagGroup = "new" | "purchase" | "repeat" | "window" | "spend";

interface CustomerTagDefinition {
  label: string;
  description: string;
  group: CustomerTagGroup;
}

const MONTHLY_RESET = "Resets on the 1st of every month.";

export const CUSTOMER_TAG_DEFINITIONS: Record<
  CustomerTag,
  CustomerTagDefinition
> = {
  new_customer: {
    label: "New customer",
    description:
      "New member who has not bought yet. Removed after 3 days or on their first paid order.",
    group: "new",
  },
  first_purchase: {
    label: "First purchase",
    description: "Has paid for at least one order. Permanent.",
    group: "purchase",
  },
  repeat_customer: {
    label: "Repeat customer",
    description:
      "Paid 2 or more orders in total. The count goes up with every order.",
    group: "repeat",
  },
  repeat_7d: {
    label: "Repeat in 7d",
    description: `Latest order came within 7 days of the previous one. ${MONTHLY_RESET}`,
    group: "window",
  },
  repeat_14d: {
    label: "Repeat in 14d",
    description: `Latest order came within 14 days of the previous one. ${MONTHLY_RESET}`,
    group: "window",
  },
  repeat_30d: {
    label: "Repeat in 30d",
    description: `Latest order came within 30 days of the previous one. ${MONTHLY_RESET}`,
    group: "window",
  },
  high_spender_5k: {
    label: "Spent ฿5k+",
    description: `Spent ฿5,000 or more this month. ${MONTHLY_RESET}`,
    group: "spend",
  },
  high_spender_10k: {
    label: "Spent ฿10k+",
    description: `Spent ฿10,000 or more this month. ${MONTHLY_RESET}`,
    group: "spend",
  },
  high_spender_15k: {
    label: "Spent ฿15k+",
    description: `Spent ฿15,000 or more this month. ${MONTHLY_RESET}`,
    group: "spend",
  },
  high_spender_30k: {
    label: "Spent ฿30k+",
    description: `Spent ฿30,000 or more this month. ${MONTHLY_RESET}`,
    group: "spend",
  },
};

export const CUSTOMER_TAG_GROUP_STYLES: Record<CustomerTagGroup, string> = {
  new: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  purchase:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  repeat:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800",
  window:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  spend:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800",
};

/** Badge text, with the count for repeat customers ("Repeat ×3"). */
export function customerTagLabel(
  tag: CustomerTag,
  value: number | null,
): string {
  if (tag === "repeat_customer" && value) return `Repeat ×${value}`;
  return CUSTOMER_TAG_DEFINITIONS[tag].label;
}

/** Extra line for the tooltip, from the tag's stored value. */
export function customerTagValueDetail(
  tag: CustomerTag,
  value: number | null,
): string | null {
  if (value == null) return null;
  const group = CUSTOMER_TAG_DEFINITIONS[tag].group;
  if (group === "repeat") return `${value} paid orders`;
  if (group === "window") {
    return `Last gap: ${value} day${value === 1 ? "" : "s"}`;
  }
  if (group === "spend") return `This month: ฿${value.toLocaleString()}`;
  return null;
}
