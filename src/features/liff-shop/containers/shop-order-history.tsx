"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Receipt } from "lucide-react";
import { initLiffSession } from "@/features/liff-login/lib/liff";
import { EmptyState, OrderStatusBadge } from "../components";
import { fetchOrderHistory } from "../lib/api";
import { ShopOrder } from "../types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ShopOrderHistoryContainer() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const session = await initLiffSession();
        const data = await fetchOrderHistory(session.lineUserId);
        if (!isCancelled) setOrders(data);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No orders yet"
        description="Your order history will show up here after checkout."
        actionHref="/liff/shop"
        actionLabel="Browse Shop"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/liff/shop/orders/${order.id}`}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {order.orderNumber}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {formatDate(order.createdAt)} · {order.items.length} item
              {order.items.length === 1 ? "" : "s"}
            </p>
            <div className="mt-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              ฿{order.totalAmount.toLocaleString()}
            </p>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </Link>
      ))}
    </div>
  );
}
