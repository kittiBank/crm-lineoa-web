import { ORDER_STATUS_LABELS, OrderStatus } from "../types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  PAID: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  SHIPPED:
    "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  COMPLETED:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
