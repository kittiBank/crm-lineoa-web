"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initLiffSession } from "@/features/liff-login/lib/liff";
import { OrderStatusBadge } from "../components";
import { fetchOrderDetail } from "../lib/api";
import { ShopOrder } from "../types";

interface ShopOrderDetailContainerProps {
  orderId: string;
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ShopOrderDetailContainer({
  orderId,
}: ShopOrderDetailContainerProps) {
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const session = await initLiffSession();
        const data = await fetchOrderDetail(orderId, session.lineUserId);
        if (!isCancelled) setOrder(data);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        {error || "Order not found"}
      </div>
    );
  }

  const timeline: { label: string; value: string | null }[] = [
    { label: "Placed", value: formatDateTime(order.createdAt) },
    { label: "Paid", value: formatDateTime(order.paidAt) },
    { label: "Shipped", value: formatDateTime(order.shippedAt) },
    { label: "Completed", value: formatDateTime(order.completedAt) },
    { label: "Cancelled", value: formatDateTime(order.cancelledAt) },
  ].filter((row) => row.value);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {order.orderNumber}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.status === "PENDING_PAYMENT" ? (
          <Link href={`/liff/shop/checkout/${order.id}`} className="mt-3 block">
            <Button className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]">
              Continue to Payment
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Items
        </p>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  {item.nameSnapshot}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ฿{item.priceSnapshot.toLocaleString()} × {item.qty}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                ฿{(item.priceSnapshot * item.qty).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Total
          </p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            ฿{order.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {timeline.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Timeline
          </p>
          <dl className="space-y-1.5 text-sm">
            {timeline.map((row) => (
              <div key={row.label} className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{row.label}</dt>
                <dd className="text-gray-900 dark:text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
