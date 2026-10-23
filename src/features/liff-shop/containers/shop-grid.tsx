"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, PackageSearch } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { initLiffSession } from "@/features/liff-login/lib/liff";
import { fetchMyPoints } from "@/features/points/lib/api";
import { useToast } from "@/lib/hooks/useToast";
import { EmptyState, ProductCard, ProductGridSkeleton } from "../components";
import { fetchMemberStatus, fetchShopProducts, redeemReward } from "../lib/api";
import { setPendingCheckoutRedirect } from "../lib/checkout-redirect";
import { ShopProduct } from "../types";

interface PendingRedeem {
  product: ShopProduct;
  lineUserId: string;
  balance: number;
}

export function ShopGridContainer() {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRedeem, setPendingRedeem] = useState<PendingRedeem | null>(
    null,
  );
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchShopProducts();
        if (!isCancelled) setProducts(data);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
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

  const handleRedeemClick = async (product: ShopProduct) => {
    try {
      const session = await initLiffSession();
      const status = await fetchMemberStatus(session.lineUserId);

      if (status.userType !== "Member") {
        const mockQuery = session.usingMock
          ? `?lineUserId=${encodeURIComponent(session.lineUserId)}`
          : "";
        setPendingCheckoutRedirect(`/liff/shop${mockQuery}`);
        router.push(`/liff/login${mockQuery}`);
        return;
      }

      const points = await fetchMyPoints(session.lineUserId);
      setPendingRedeem({
        product,
        lineUserId: session.lineUserId,
        balance: points.balance,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load points");
    }
  };

  const handleConfirmRedeem = async () => {
    if (!pendingRedeem) return;

    setIsRedeeming(true);
    try {
      const order = await redeemReward({
        lineUserId: pendingRedeem.lineUserId,
        productId: pendingRedeem.product.id,
        qty: 1,
      });
      toast.success(`Redeemed ${pendingRedeem.product.name}!`);
      setPendingRedeem(null);
      router.push(`/liff/shop/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to redeem");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products yet"
        description="Check back soon — new items are on the way."
      />
    );
  }

  const redeemCost = pendingRedeem?.product.pointsCost ?? 0;
  const canAfford = pendingRedeem ? pendingRedeem.balance >= redeemCost : false;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 p-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onRedeem={handleRedeemClick}
          />
        ))}
      </div>

      <ConfirmDialog
        open={pendingRedeem !== null}
        onOpenChange={(open) => {
          if (!open && !isRedeeming) setPendingRedeem(null);
        }}
        title={
          canAfford
            ? `Redeem ${pendingRedeem?.product.name ?? ""}?`
            : "Not enough points"
        }
        description={
          pendingRedeem
            ? canAfford
              ? `Uses ${redeemCost.toLocaleString()} of your ${pendingRedeem.balance.toLocaleString()} points. The shop will ship it like a normal order.`
              : `This reward needs ${redeemCost.toLocaleString()} points. You have ${pendingRedeem.balance.toLocaleString()}.`
            : undefined
        }
        icon={<Gift className="h-5 w-5 text-amber-600" />}
        variant="warning"
        confirmLabel={canAfford ? "Redeem" : "OK"}
        loadingLabel="Redeeming..."
        isLoading={isRedeeming}
        onConfirm={
          canAfford ? handleConfirmRedeem : () => setPendingRedeem(null)
        }
      />
    </>
  );
}
