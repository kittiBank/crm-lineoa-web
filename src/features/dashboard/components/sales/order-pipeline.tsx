import Link from "next/link";
import { formatBaht, formatCompact, formatNumber, formatPercent } from "../../lib/format";
import { DashboardSales, DashboardSalesStatus, OrderStatus } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Pending payment", color: "#BFDBFE" },
  PAID: { label: "Paid", color: "#60A5FA" },
  SHIPPED: { label: "Shipped", color: "#2563EB" },
  COMPLETED: { label: "Completed", color: "#1E3A8A" },
  CANCELLED: { label: "Cancelled", color: "#A3A3A3" },
};

const REVENUE_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "COMPLETED"];

function isSelected(status: OrderStatus, filter: DashboardSalesStatus): boolean {
  if (filter === "all") return true;
  if (filter === "revenue") return REVENUE_STATUSES.includes(status);
  return status === filter;
}

interface OrderPipelineProps {
  pipeline: DashboardSales["pipeline"];
  statusFilter: DashboardSalesStatus;
}

export function OrderPipeline({ pipeline, statusFilter }: OrderPipelineProps) {
  const total = pipeline.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard
      title="Order pipeline"
      subtitle="Orders by status in this period"
      size="narrow"
      action={
        <Link
          href="/orders"
          className="text-[13px] font-semibold text-[#047A35] hover:underline"
        >
          Open orders
        </Link>
      }
    >
      {total > 0 ? (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            {pipeline.map((row) => (
              <div
                key={row.status}
                title={`${ORDER_STATUS_META[row.status].label}: ${formatNumber(row.count)}`}
                style={{
                  width: `${(row.count / total) * 100}%`,
                  background: ORDER_STATUS_META[row.status].color,
                  opacity: isSelected(row.status, statusFilter) ? 1 : 0.4,
                }}
              />
            ))}
          </div>
          <ul className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
            {pipeline.map((row) => (
              <li
                key={row.status}
                className="flex items-center gap-2.5 py-2.5 text-[13px]"
                style={{ opacity: isSelected(row.status, statusFilter) ? 1 : 0.55 }}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: ORDER_STATUS_META[row.status].color }}
                />
                <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                  {ORDER_STATUS_META[row.status].label}
                </span>
                <span className="w-12 text-right tabular-nums text-neutral-500 dark:text-neutral-400">
                  {formatPercent((row.count / total) * 100, 0)}
                </span>
                <span className="w-10 text-right font-semibold tabular-nums text-neutral-950 dark:text-white">
                  {formatNumber(row.count)}
                </span>
                <span
                  className="w-16 text-right tabular-nums text-neutral-500 dark:text-neutral-400"
                  title={formatBaht(row.amount)}
                >
                  ฿{formatCompact(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <CardEmptyState message="No orders in this period" />
      )}
    </ChartCard>
  );
}
