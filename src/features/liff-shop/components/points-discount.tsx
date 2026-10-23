"use client";

import { Coins } from "lucide-react";
import { formatPoints } from "@/features/points/lib/rules";
import { PointRules } from "@/features/points/types";

interface PointsDiscountProps {
  balance: number;
  maxUsable: number;
  value: number;
  rules: PointRules;
  onChange: (points: number) => void;
}

/** Cart section: choose how many points to use as a discount. */
export function PointsDiscount({
  balance,
  maxUsable,
  value,
  rules,
  onChange,
}: PointsDiscountProps) {
  const clamp = (points: number) =>
    Math.max(0, Math.min(maxUsable, Math.floor(points) || 0));

  return (
    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
          <Coins className="h-4 w-4 text-amber-500" />
          Use points
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          You have {formatPoints(balance)} pts
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={maxUsable}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
          className="h-9 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#06C755] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          aria-label="Points to use"
          disabled={maxUsable === 0}
        />
        <button
          type="button"
          onClick={() => onChange(value === maxUsable ? 0 : maxUsable)}
          disabled={maxUsable === 0}
          className="h-9 shrink-0 rounded-lg border border-[#06C755] px-3 text-xs font-semibold text-[#06C755] disabled:opacity-40"
        >
          {value === maxUsable && maxUsable > 0 ? "Clear" : "Use max"}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        1 pt = ฿{rules.pointValueBaht} · up to{" "}
        {Math.round(rules.maxDiscountRatio * 100)}% of your order (max{" "}
        {formatPoints(maxUsable)} pts now)
      </p>
    </div>
  );
}
