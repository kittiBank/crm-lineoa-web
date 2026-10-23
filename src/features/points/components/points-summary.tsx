"use client";

import { useState } from "react";
import Link from "next/link";
import { Coins, Gift } from "lucide-react";
import { formatPoints } from "../lib/rules";
import { MyPointsResponse } from "../types";
import { PointHistoryList } from "./point-history-list";

const COLLAPSED_HISTORY = 5;

interface PointsSummaryProps {
  points: MyPointsResponse;
  /** Keeps the local-testing mock query when linking to the shop. */
  shopHref?: string;
}

/** LIFF member card section: balance, earning rules and history. */
export function PointsSummary({
  points,
  shopHref = "/liff/shop",
}: PointsSummaryProps) {
  const [showAll, setShowAll] = useState(false);
  const { balance, rules, history } = points;
  const visibleHistory = showAll
    ? history
    : history.slice(0, COLLAPSED_HISTORY);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            My points
          </p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
            <Coins className="h-6 w-6 text-amber-500" />
            {formatPoints(balance)}
          </p>
        </div>
        <Link
          href={shopHref}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#06C755] px-3 py-2 text-xs font-semibold text-white hover:bg-[#05b14c]"
        >
          <Gift className="h-4 w-4" />
          Use points
        </Link>
      </div>

      <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        Earn 1 point for every ฿{rules.earnBahtPerPoint} spent. Use points as a
        discount (1 point = ฿{rules.pointValueBaht}, up to{" "}
        {Math.round(rules.maxDiscountRatio * 100)}% of an order) or redeem
        rewards. Points never expire.
      </p>

      <div className="mt-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          History
        </p>
        <PointHistoryList history={visibleHistory} />
        {history.length > COLLAPSED_HISTORY && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="w-full pt-2 text-center text-xs font-medium text-[#06C755]"
          >
            {showAll ? "Show less" : `Show all (${history.length})`}
          </button>
        )}
      </div>
    </section>
  );
}
