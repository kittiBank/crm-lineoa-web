"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initLiffSession } from "@/features/liff-login/lib/liff";
import { useToast } from "@/lib/hooks/useToast";
import { fetchMyPoints } from "@/features/points/lib/api";
import { maxPointsUsable, pointsEarnedFor } from "@/features/points/lib/rules";
import { MyPointsResponse } from "@/features/points/types";
import { CartItemRow, EmptyState, PointsDiscount } from "../components";
import { createOrder, fetchMemberStatus } from "../lib/api";
import { getCart, getCartTotal, onCartUpdated, updateQty } from "../lib/cart";
import { setPendingCheckoutRedirect } from "../lib/checkout-redirect";
import { CartItem } from "../types";

export function ShopCartContainer() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [points, setPoints] = useState<MyPointsResponse | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);

  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    return onCartUpdated(refresh);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    // Guests and load errors just hide the points section.
    initLiffSession()
      .then((session) => fetchMyPoints(session.lineUserId))
      .then((data) => {
        if (!isCancelled) setPoints(data);
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, []);

  const subtotal = getCartTotal(items);
  const maxUsable =
    points?.isMember ? maxPointsUsable(subtotal, points.balance, points.rules) : 0;
  // Cart edits can lower the cap below what was chosen.
  const appliedPoints = Math.min(pointsToUse, maxUsable);
  const pointsDiscount = points ? appliedPoints * points.rules.pointValueBaht : 0;
  const total = subtotal - pointsDiscount;
  const pointsToEarn = points ? pointsEarnedFor(total, points.rules) : 0;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const session = await initLiffSession();
      const status = await fetchMemberStatus(session.lineUserId);

      if (status.userType !== "Member") {
        // Preserve the local-testing mock lineUserId across the redirect —
        // real LIFF sessions don't need it (liff.getProfile() works regardless
        // of the URL), but the mock query param would otherwise be dropped.
        const mockQuery = session.usingMock
          ? `?lineUserId=${encodeURIComponent(session.lineUserId)}`
          : "";
        setPendingCheckoutRedirect(`/liff/shop/cart${mockQuery}`);
        router.push(`/liff/login${mockQuery}`);
        return;
      }

      const result = await createOrder({
        lineUserId: session.lineUserId,
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        pointsToUse: appliedPoints > 0 ? appliedPoints : undefined,
      });

      router.push(`/liff/shop/checkout/${result.order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse the shop and add something you like."
        actionHref="/liff/shop"
        actionLabel="Browse Shop"
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4">
        {items.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onQtyChange={updateQty}
            onRemove={(productId) => updateQty(productId, 0)}
          />
        ))}
      </div>

      <div className="mx-4 mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        {points?.isMember && points.balance > 0 ? (
          <PointsDiscount
            balance={points.balance}
            maxUsable={maxUsable}
            value={appliedPoints}
            rules={points.rules}
            onChange={setPointsToUse}
          />
        ) : null}

        {pointsDiscount > 0 ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">
                ฿{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Points discount ({appliedPoints.toLocaleString()} pts)
              </span>
              <span className="text-[#06C755]">
                -฿{pointsDiscount.toLocaleString()}
              </span>
            </div>
          </>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ฿{total.toLocaleString()}
          </span>
        </div>
        {points?.isMember && pointsToEarn > 0 ? (
          <p className="text-right text-xs text-gray-500 dark:text-gray-400">
            You&apos;ll earn {pointsToEarn.toLocaleString()} pts when paid
          </p>
        ) : null}
        <Button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait...
            </>
          ) : (
            "Checkout"
          )}
        </Button>
      </div>
    </div>
  );
}
