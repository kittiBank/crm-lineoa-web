"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initLiffSession } from "@/features/liff-login/lib/liff";
import { useToast } from "@/lib/hooks/useToast";
import { OrderStatusBadge } from "../components";
import { confirmPayment, fetchOrderDetail } from "../lib/api";
import { clearCart } from "../lib/cart";
import { ShopOrder } from "../types";

interface ShopCheckoutContainerProps {
  orderId: string;
}

export function ShopCheckoutContainer({ orderId }: ShopCheckoutContainerProps) {
  const router = useRouter();
  const toast = useToast();

  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const session = await initLiffSession();
        if (isCancelled) return;
        setLineUserId(session.lineUserId);

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

  const handleConfirmPayment = async () => {
    if (!lineUserId) return;

    setIsConfirming(true);
    try {
      await confirmPayment(orderId, lineUserId);
      clearCart();
      toast.success("Payment confirmed!");
      router.push(`/liff/shop/orders/${orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm payment");
    } finally {
      setIsConfirming(false);
    }
  };

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

  if (order.status !== "PENDING_PAYMENT") {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#06C755]" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Order {order.orderNumber}
          </p>
          <div className="mt-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <Button
          onClick={() => router.push(`/liff/shop/orders/${order.id}`)}
          className="bg-[#06C755] text-white hover:bg-[#05b34c]"
        >
          View Order
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Order</p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {order.orderNumber}
        </p>
      </div>

      {order.qrCodeDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={order.qrCodeDataUrl}
          alt="Payment QR code"
          className="h-56 w-56 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800"
        />
      ) : null}

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          ฿{order.totalAmount.toLocaleString()}
        </p>
      </div>

      <p className="text-center text-xs text-gray-400">
        This is a demo QR — no real payment is processed. Tap the button below
        once you&apos;ve &quot;paid&quot; to confirm.
      </p>

      <Button
        onClick={handleConfirmPayment}
        disabled={isConfirming}
        className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
      >
        {isConfirming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : (
          "I've Paid"
        )}
      </Button>
    </div>
  );
}
