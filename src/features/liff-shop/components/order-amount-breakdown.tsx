import { ShopOrder } from "../types";

type BreakdownOrder = Pick<
  ShopOrder,
  | "subtotalAmount"
  | "pointsUsed"
  | "pointsDiscount"
  | "pointsEarned"
  | "isReward"
  | "totalAmount"
>;

/** Subtotal / points discount / net total (or points paid for a reward). */
export function OrderAmountBreakdown({ order }: { order: BreakdownOrder }) {
  if (order.isReward) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Paid with points</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {order.pointsUsed.toLocaleString()} pts
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-sm">
      {order.pointsDiscount > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white">
              ฿{order.subtotalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Points discount ({order.pointsUsed.toLocaleString()} pts)
            </span>
            <span className="text-[#06C755]">
              -฿{order.pointsDiscount.toLocaleString()}
            </span>
          </div>
        </>
      ) : null}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">Total</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          ฿{order.totalAmount.toLocaleString()}
        </span>
      </div>
      {order.pointsEarned > 0 ? (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Points earned</span>
          <span className="text-amber-600 dark:text-amber-400">
            +{order.pointsEarned.toLocaleString()} pts
          </span>
        </div>
      ) : null}
    </div>
  );
}
