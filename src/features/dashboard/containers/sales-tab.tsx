"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Banknote, Clock, Receipt, Repeat, ShoppingBag } from "lucide-react";
import {
  BuyerTierRevenue,
  DashboardSkeleton,
  FilterBar,
  FilterDefinition,
  KpiCard,
  ORDER_STATUS_META,
  OrderPipeline,
  PeriodSummary,
  RevenueOrdersChart,
  TopProductsTable,
  readFilterParams,
  writeFilterParams,
} from "@/features/dashboard/components";
import { fetchDashboardSales } from "@/features/dashboard/lib/api";
import {
  computeDelta,
  formatBaht,
  formatNumber,
  formatPercent,
} from "@/features/dashboard/lib/format";
import {
  DashboardPeriod,
  DashboardSales,
  DashboardSalesFilters,
  OrderStatus,
} from "@/features/dashboard/types";

type SalesFilterKey = keyof DashboardSalesFilters;

function salesFilters(
  products: DashboardSales["products"],
  selectedProductId?: string,
): FilterDefinition<SalesFilterKey>[] {
  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  // Keep a product from the URL selectable before the list has loaded.
  if (selectedProductId && !products.some((p) => p.id === selectedProductId)) {
    productOptions.push({ value: selectedProductId, label: "Selected product" });
  }

  return [
    {
      key: "status",
      label: "Order status",
      options: [
        { value: "", label: "Paid, Shipped & Completed" },
        { value: "all", label: "All statuses" },
        ...(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((status) => ({
          value: status,
          label: ORDER_STATUS_META[status].label,
        })),
      ],
    },
    {
      key: "productId",
      label: "Product",
      options: [{ value: "", label: "All products" }, ...productOptions],
    },
    {
      key: "tier",
      label: "Buyer tier",
      options: [
        { value: "", label: "All tiers" },
        { value: "Silver", label: "Silver" },
        { value: "Gold", label: "Gold" },
        { value: "Platinum", label: "Platinum" },
        { value: "Member", label: "No tier" },
      ],
    },
    {
      key: "buyerType",
      label: "Buyer type",
      options: [
        { value: "", label: "All buyers" },
        { value: "new", label: "New" },
        { value: "returning", label: "Returning" },
      ],
    },
  ];
}

export function SalesTab({ period }: { period: DashboardPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryString = useSearchParams().toString();

  const [data, setData] = useState<DashboardSales | null>(null);
  const [products, setProducts] = useState<DashboardSales["products"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const params = new URLSearchParams(queryString);
    const productId = params.get("productId") ?? undefined;
    return {
      ...readFilterParams(params, salesFilters([])),
      // Product ids are not known before the first load; the API validates them.
      ...(productId ? { productId } : {}),
    } as DashboardSalesFilters;
  }, [queryString]);
  const filterKey = JSON.stringify(filters);
  const definitions = useMemo(
    () => salesFilters(products, filters.productId),
    [products, filters.productId],
  );

  const setFilters = useCallback(
    (next: DashboardSalesFilters) => {
      const params = writeFilterParams(queryString, definitions, next);
      router.replace(`${pathname}?${params}`, { scroll: false });
    },
    [definitions, pathname, queryString, router],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sales = await fetchDashboardSales(
          period,
          JSON.parse(filterKey) as DashboardSalesFilters,
        );
        if (!cancelled) {
          setData(sales);
          setProducts(sales.products);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [period, filterKey]);

  return (
    <div className="flex flex-col gap-5">
      <FilterBar
        label="Sales filters"
        filters={definitions}
        values={filters}
        onChange={(values) => setFilters(values as DashboardSalesFilters)}
        idleNote="Revenue counts Paid, Shipped & Completed"
      />
      <SalesTabBody data={data} isLoading={isLoading} error={error} filters={filters} />
    </div>
  );
}

function SalesTabBody({
  data,
  isLoading,
  error,
  filters,
}: {
  data: DashboardSales | null;
  isLoading: boolean;
  error: string | null;
  filters: DashboardSalesFilters;
}) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {error ?? "Failed to load dashboard"}
      </div>
    );
  }

  const { kpis } = data;
  const { repeatRate, pendingPayment } = kpis;

  return (
    <div className="flex flex-col gap-5">
      <PeriodSummary period={data.period} range={data.range} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
        <KpiCard
          label="Revenue"
          icon={Banknote}
          value={formatBaht(kpis.revenue.current)}
          delta={computeDelta(kpis.revenue)}
        />
        <KpiCard
          label="Orders"
          icon={ShoppingBag}
          value={formatNumber(kpis.orders.current)}
          delta={computeDelta(kpis.orders)}
        />
        <KpiCard
          label="Avg. order value"
          icon={Receipt}
          value={formatBaht(kpis.avgOrderValue.current)}
          delta={computeDelta(kpis.avgOrderValue)}
          note="per order"
        />
        <KpiCard
          label="Repeat purchase rate"
          icon={Repeat}
          value={repeatRate.current === null ? "—" : formatPercent(repeatRate.current)}
          delta={
            repeatRate.current === null || repeatRate.previous === null
              ? { percent: null, good: true }
              : computeDelta({ current: repeatRate.current, previous: repeatRate.previous })
          }
          note="bought 2+ times"
        />
        <KpiCard
          label="Pending payment"
          icon={Clock}
          value={formatBaht(pendingPayment.amount.current)}
          delta={computeDelta(pendingPayment.amount, false)}
          note={`${formatNumber(pendingPayment.count.current)} orders`}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <RevenueOrdersChart data={data.series} rangeEnd={data.range.end} />
        <OrderPipeline pipeline={data.pipeline} statusFilter={filters.status ?? "revenue"} />
      </div>

      <div className="flex flex-wrap gap-4">
        <TopProductsTable products={data.topProducts} />
        <BuyerTierRevenue
          revenueByTier={data.revenueByTier}
          buyers={data.buyers}
          tier={filters.tier}
        />
      </div>
    </div>
  );
}
