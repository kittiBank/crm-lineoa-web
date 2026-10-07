import { Check, Trophy } from "lucide-react";
import { UserTier } from "@/constants/user-tier";
import { formatBaht } from "../lib/api";
import { MemberCardData, TierThreshold } from "../types";
import { themeFor } from "./tier-theme";

function TierName({ tier }: { tier: UserTier }) {
  return <span className="font-semibold">{themeFor(tier).label}</span>;
}

/** Progress from ฿0 to the next tier's minimum spend. */
export function TierProgress({ card }: { card: MemberCardData }) {
  const { nextTier, spend, spendWindowMonths } = card;

  if (!nextTier) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              You&apos;ve reached our highest tier
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Thank you for being a Platinum member.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const percent = Math.min(100, (spend / nextTier.minSpend) * 100);
  const nextTheme = themeFor(nextTier.tier);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress to <TierName tier={nextTier.tier} />
        </p>
        <p className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
          {formatBaht(spend)} / {formatBaht(nextTier.minSpend)}
        </p>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={nextTier.minSpend}
        aria-valuenow={spend}
        aria-label={`Spend toward ${nextTheme.label}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${nextTheme.accent}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        Spend{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatBaht(nextTier.remaining)}
        </span>{" "}
        more to reach <TierName tier={nextTier.tier} />
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Based on paid orders in the last {spendWindowMonths} months.
      </p>
    </section>
  );
}

/** Every tier with its spend requirement; the current one is marked. */
export function TierLadder({
  tiers,
  currentTier,
  spendWindowMonths,
}: {
  tiers: TierThreshold[];
  currentTier: UserTier | null;
  spendWindowMonths: number;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Member tiers
      </h2>
      <ul className="space-y-2">
        {tiers.map(({ tier, minSpend }) => {
          const theme = themeFor(tier);
          const isCurrent = tier === currentTier;

          return (
            <li
              key={tier}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                isCurrent ? "bg-gray-100 dark:bg-gray-800" : "bg-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${theme.accent}`} />
                <span className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">
                  {theme.label}
                </span>
                {isCurrent ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#06C755]/10 px-2 py-0.5 text-[11px] font-semibold text-[#06A447]">
                    <Check className="h-3 w-3" />
                    Your tier
                  </span>
                ) : null}
              </div>
              <span className="text-sm text-gray-600 tabular-nums dark:text-gray-400">
                {formatBaht(minSpend)}+
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Spend in the last {spendWindowMonths} months. Tiers update when an order
        is paid.
      </p>
    </section>
  );
}
