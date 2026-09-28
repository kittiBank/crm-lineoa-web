import { ImportTier } from "../types/audience-import";

const TIER_STYLES: Record<ImportTier, string> = {
  SILVER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  GOLD: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  PLATINUM:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
};

export function ImportTierBadge({ tier }: { tier: ImportTier }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold tracking-wide ${TIER_STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}
