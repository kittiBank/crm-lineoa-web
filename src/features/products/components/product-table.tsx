import { Edit2, ImageOff, Trash2 } from "lucide-react";
import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-2" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function StockBadge({ stockQty }: { stockQty: number }) {
  const color =
    stockQty === 0
      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      : stockQty <= 5
        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {stockQty} in stock
    </span>
  );
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No products yet. Add one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
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
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {product.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ฿{product.price.toLocaleString()}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <StockBadge stockQty={product.stockQty} />
                </td>

                <td className="px-6 py-4">
                  <StatusBadge isActive={product.isActive} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit?.(product.id)}
                      className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(product.id)}
                      disabled={!product.isActive}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={product.isActive ? "Deactivate" : "Already inactive"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
