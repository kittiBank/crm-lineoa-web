import { formatBaht, formatNumber } from "../../lib/format";
import { TopProduct } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

export function TopProducts({ products }: { products: TopProduct[] }) {
  const max = products[0]?.revenue ?? 0;

  return (
    <ChartCard size="narrow" title="Top products" subtitle="By paid revenue">
      {products.length === 0 ? (
        <CardEmptyState message="No paid orders in this period" />
      ) : (
        <ol className="flex flex-col gap-3.5">
          {products.map((product, index) => (
            <li key={product.productId} className="flex items-center gap-3">
              <span className="flex size-[26px] flex-none items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold tabular-nums text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="truncate font-medium text-neutral-950 dark:text-white">
                    {product.name}
                  </span>
                  <span className="whitespace-nowrap tabular-nums">
                    <span className="mr-2 text-xs text-neutral-500">
                      {formatNumber(product.units)} units
                    </span>
                    <strong>{formatBaht(product.revenue)}</strong>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-chart-blue-600"
                    style={{ width: `${max > 0 ? (product.revenue / max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </ChartCard>
  );
}
