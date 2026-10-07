import { EyeOff, ImageOff, Loader2, Pencil, RotateCcw } from "lucide-react";
import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  startIndex: number;
  isLoading: boolean;
  hasFilters: boolean;
  /** Product whose status is being changed (shows a spinner). */
  pendingProductId: string | null;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onReactivate: (product: Product) => void;
}

const headerClassName =
  "px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300";

const actionButtonClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";

export function formatPrice(price: number) {
  return `฿${price.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      <span className="mr-2 h-2 w-2 rounded-full bg-current" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function QtyCell({ stockQty }: { stockQty: number }) {
  if (stockQty === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Sold out
      </span>
    );
  }

  return (
    <span
      className={`text-sm font-medium tabular-nums ${
        stockQty <= 5
          ? "text-amber-600 dark:text-amber-400"
          : "text-gray-900 dark:text-white"
      }`}
      title={stockQty <= 5 ? "Low qty" : undefined}
    >
      {stockQty.toLocaleString()}
    </span>
  );
}

export function ProductTable({
  products,
  startIndex,
  isLoading,
  hasFilters,
  pendingProductId,
  onEdit,
  onDeactivate,
  onReactivate,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className={`${headerClassName} w-16`}>No</th>
              <th className={headerClassName}>Product</th>
              <th className={headerClassName}>Price</th>
              <th className={headerClassName}>Qty</th>
              <th className={headerClassName}>Status</th>
              <th className={`${headerClassName} w-32 text-right`}>Action</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {products.map((product, index) => {
              const isPending = pendingProductId === product.id;

              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {startIndex + index + 1}
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold text-gray-900 dark:text-white"
                          title={product.name}
                        >
                          {product.name}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                          {product.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-900 tabular-nums dark:text-white">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <QtyCell stockQty={product.stockQty} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={product.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className={actionButtonClassName}
                        aria-label={`Edit ${product.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {product.isActive ? (
                        <button
                          type="button"
                          onClick={() => onDeactivate(product)}
                          disabled={isPending}
                          className={`${actionButtonClassName} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400`}
                          aria-label={`Deactivate ${product.name}`}
                          title="Deactivate (hide from shop)"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onReactivate(product)}
                          disabled={isPending}
                          className={`${actionButtonClassName} hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30 dark:hover:text-green-400`}
                          aria-label={`Reactivate ${product.name}`}
                          title="Reactivate (show in shop)"
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading products...
            </>
          ) : hasFilters ? (
            "No products match your filters."
          ) : (
            "No products yet. Click Add Product to list your first item in the LINE shop."
          )}
        </div>
      ) : null}
    </div>
  );
}
