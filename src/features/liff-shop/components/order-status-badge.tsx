import { Badge } from "@/components/ui/badge";
import { ShopOrderStatus } from "../types";

const STATUS_LABELS: Record<ShopOrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting Payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_CLASSES: Record<ShopOrderStatus, string> = {
  PENDING_PAYMENT:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PAID: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function OrderStatusBadge({ status }: { status: ShopOrderStatus }) {
  return (
    <Badge className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
