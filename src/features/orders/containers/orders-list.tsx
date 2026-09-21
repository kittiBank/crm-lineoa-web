"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { OrderHeader, OrderPagination, OrderTable } from "@/features/orders/components";
import { fetchOrdersAdmin } from "@/features/orders/lib/api";
import { Order, ORDER_STATUS_LABELS, OrderStatus } from "@/features/orders/types";

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

export function OrdersListContainer() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOrdersAdmin({ status: selectedStatus });
        if (isCancelled) return;
        setOrders(data);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return orders.slice(startIndex, startIndex + itemsPerPage);
  }, [orders, currentPage, itemsPerPage]);

  const handleView = (id: string) => {
    router.push(`/orders/${id}`);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Orders", isActive: true },
  ];

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <OrderHeader />

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {status === "all" ? "All" : ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading orders...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <OrderTable orders={paginatedOrders} onView={handleView} />
          </div>

          <OrderPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={orders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </div>
  );
}
