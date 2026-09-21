"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { EmptyState, ProductCard, ProductGridSkeleton } from "../components";
import { fetchShopProducts } from "../lib/api";
import { ShopProduct } from "../types";

export function ShopGridContainer() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
