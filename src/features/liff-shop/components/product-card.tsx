"use client";

import { useEffect, useState } from "react";
import { ImageOff, Minus, Plus, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addToCart, getCart, onCartUpdated, updateQty } from "../lib/cart";
import { ShopProduct } from "../types";

export function ProductCard({ product }: { product: ShopProduct }) {
  const [qty, setQty] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const item = getCart().find((i) => i.productId === product.id);
      setQty(item?.qty ?? 0);
    };
    refresh();
    return onCartUpdated(refresh);
  }, [product.id]);

  const outOfStock = product.stockQty <= 0;

  const handleAdd = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      1,
    );
  };

  return (
    <Card size="sm" className="overflow-hidden py-0 gap-0">
      <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-900">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {outOfStock ? (
          <Badge
            variant="destructive"
            className="absolute left-2 top-2 bg-gray-900/80 text-white"
          >
            Out of stock
          </Badge>
        ) : null}
      </div>

      <CardContent className="space-y-2 p-3">
        <div>
          <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-[#06C755]">
            ฿{product.price.toLocaleString()}
          </p>
        </div>

        {qty === 0 ? (
          <Button
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => updateQty(product.id, qty - 1)}
              className="flex h-8 w-8 items-center justify-center text-gray-600 dark:text-gray-300"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => updateQty(product.id, qty + 1)}
              disabled={qty >= product.stockQty}
              className="flex h-8 w-8 items-center justify-center text-gray-600 disabled:opacity-30 dark:text-gray-300"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
