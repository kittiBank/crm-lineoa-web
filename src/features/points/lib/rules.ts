import { PointRules } from "../types";

/** Mirrors the API rule: the 50% subtotal cap or the balance, whichever is lower. */
export function maxPointsUsable(
  subtotal: number,
  balance: number,
  rules: PointRules,
): number {
  if (subtotal <= 0 || balance <= 0) {
    return 0;
  }

  const cap = Math.floor(
    (subtotal * rules.maxDiscountRatio) / rules.pointValueBaht,
  );
  return Math.max(0, Math.min(cap, balance));
}

export function pointsEarnedFor(netAmount: number, rules: PointRules): number {
  return netAmount > 0 ? Math.floor(netAmount / rules.earnBahtPerPoint) : 0;
}

export function formatPoints(points: number): string {
  return points.toLocaleString("en-US");
}
