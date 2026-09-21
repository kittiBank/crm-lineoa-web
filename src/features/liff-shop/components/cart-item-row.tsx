"use client";

import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "../types";

interface CartItemRowProps {
  item: CartItem;
  onQtyChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({ item, onQtyChange, onRemove }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0 dark:border-gray-800">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageOff className="h-6 w-6 text-gray-300 dark:text-gray-600" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white">
          {item.name}
        </p>
        <p className="text-sm text-[#06C755]">฿{item.price.toLocaleString()}</p>

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => onQtyChange(item.productId, item.qty - 1)}
              className="flex h-7 w-7 items-center justify-center text-gray-600 dark:text-gray-300"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-900 dark:text-white">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => onQtyChange(item.productId, item.qty + 1)}
              className="flex h-7 w-7 items-center justify-center text-gray-600 dark:text-gray-300"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
        ฿{(item.price * item.qty).toLocaleString()}
      </p>
    </div>
  );
}
