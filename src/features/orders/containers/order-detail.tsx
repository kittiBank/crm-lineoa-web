"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Truck, XCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OrderStatusBadge } from "@/features/orders/components";
import { fetchOrderById, updateOrderStatus } from "@/features/orders/lib/api";
import { NEXT_STATUSES, Order, OrderStatus } from "@/features/orders/types";
import { useToast } from "@/lib/hooks/useToast";

interface OrderDetailProps {
  orderId: string;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailContainer({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadOrder = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrderById(orderId);
        if (isCancelled) return;
        setOrder(data);
      } catch (error) {
        if (isCancelled) return;
        toast.error(error instanceof Error ? error.message : "Failed to load order");
        router.push("/orders");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  const applyStatus = async (status: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(updated);
      toast.success(`Order marked as ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Orders", href: "/orders" },
    { label: order?.orderNumber ?? "Detail", isActive: true },
  ];

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading order...
      </div>
    );
  }

  const availableTransitions = NEXT_STATUSES[order.status];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>

        {availableTransitions.length > 0 && (
          <div className="flex gap-2">
            {availableTransitions.includes("SHIPPED") && (
              <Button
                onClick={() => applyStatus("SHIPPED")}
                disabled={isUpdating}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Truck className="mr-2 h-4 w-4" />
                Mark Shipped
              </Button>
            )}
            {availableTransitions.includes("COMPLETED") && (
              <Button
                onClick={() => applyStatus("COMPLETED")}
                disabled={isUpdating}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Package className="mr-2 h-4 w-4" />
                Mark Completed
              </Button>
            )}
            {availableTransitions.includes("CANCELLED") && (
              <Button
                onClick={() => setPendingStatus("CANCELLED")}
                disabled={isUpdating}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Items
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
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
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ฿{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Buyer
            </h2>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {order.lineUser?.displayName || "Unknown"}
            </p>
            {order.lineUser?.phone && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {order.lineUser.phone}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Timeline
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Placed</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(order.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Paid</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(order.paidAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Shipped</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(order.shippedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Completed</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(order.completedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Cancelled</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(order.cancelledAt)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={pendingStatus === "CANCELLED"}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setPendingStatus(null);
          }
        }}
        title="Cancel Order"
        description={
          <>
            Are you sure you want to cancel{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {order.orderNumber}
            </span>
            ? This restocks its items and cannot be undone.
          </>
        }
        variant="destructive"
        confirmLabel="Cancel Order"
        loadingLabel="Cancelling..."
        isLoading={isUpdating}
        onConfirm={() => applyStatus("CANCELLED")}
        showCloseButton={!isUpdating}
      />
    </div>
  );
}
