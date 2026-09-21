"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, ShoppingCart } from "lucide-react";
import { getCart, getCartCount, onCartUpdated } from "../lib/cart";

export function ShopHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(getCartCount(getCart()));
    refresh();
    return onCartUpdated(refresh);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <Link href="/liff/shop" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#06C755] text-sm font-bold text-white">
          OA
        </div>
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          Shop
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/liff/shop/orders"
          aria-label="Order history"
          className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Receipt className="h-5 w-5" />
        </Link>
        <Link
          href="/liff/shop/cart"
          aria-label="Cart"
          className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ShoppingCart className="h-5 w-5" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
