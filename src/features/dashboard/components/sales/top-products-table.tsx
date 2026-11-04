import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatBaht, formatNumber, formatPercent } from "../../lib/format";
import { SalesTopProduct } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const th = "border-b border-neutral-100 px-2.5 py-2 font-medium dark:border-neutral-800";
const td = "border-b border-neutral-100 px-2.5 py-3 dark:border-neutral-800";

function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const width = 72;
  const height = 24;
  const max = Math.max(...values, 0);
  if (values.length < 2 || max === 0) {
    return <span className="inline-block h-6 w-[72px]" />;
  }

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 2 - (v / max) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "#2563EB" : "#A3A3A3"}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChangeLabel({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">New</span>;
  }
  const up = change >= 0;
  return (
    <span
      className={cn(
        "text-xs font-semibold tabular-nums",
        up ? "text-[#047A35] dark:text-green-400" : "text-[#B93815] dark:text-orange-400",
      )}
    >
      {up ? "▲" : "▼"} {formatPercent(Math.abs(change), 0)}
    </span>
  );
}

export function TopProductsTable({ products }: { products: SalesTopProduct[] }) {
  const topShare = products[0]?.share ?? 0;

  return (
    <ChartCard
      title="Top products"
      subtitle="By revenue in this period"
      action={
        <Link href="/products" className="text-[13px] font-semibold text-[#047A35] hover:underline">
          All products
        </Link>
      }
    >
      {products.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-neutral-500 dark:text-neutral-400">
                <th className={th}>Product</th>
                <th className={`${th} text-right`}>Units</th>
                <th className={th}>Share of revenue</th>
                <th className={`${th} text-right`}>Revenue</th>
                <th className={th}>Trend</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700 dark:text-neutral-300">
              {products.map((product) => (
                <tr key={product.productId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className={cn(td, "font-semibold text-neutral-950 dark:text-white")}>
                    {product.name}
                  </td>
                  <td className={`${td} text-right tabular-nums`}>{formatNumber(product.units)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 min-w-[60px] flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className="h-full bg-chart-blue-600"
                          style={{ width: `${topShare ? (product.share / topShare) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-11 text-right tabular-nums">
                        {formatPercent(product.share, 0)}
                      </span>
                    </div>
                  </td>
                  <td className={`${td} text-right font-semibold tabular-nums text-neutral-950 dark:text-white`}>
                    {formatBaht(product.revenue)}
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <Sparkline values={product.series} up={(product.change ?? 0) >= 0} />
                      <ChangeLabel change={product.change} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CardEmptyState message="No products sold in this period" />
      )}
    </ChartCard>
  );
}
