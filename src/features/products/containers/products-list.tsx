"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AudiencePagination } from "@/features/audiences/components/audience-pagination";
import {
  ProductFilters,
  ProductFilterValues,
  ProductHeader,
  ProductTable,
} from "@/features/products/components";
import {
  deleteProduct,
  fetchProductsAdmin,
  updateProduct,
} from "@/features/products/lib/api";
import { Product } from "@/features/products/types";
import { useToast } from "@/lib/hooks/useToast";

const EMPTY_FILTERS: ProductFilterValues = { search: "", status: "" };

export function ProductsListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [filters, setFilters] = useState<ProductFilterValues>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [productToDeactivate, setProductToDeactivate] =
    useState<Product | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const result = await fetchProductsAdmin({
          page: currentPage,
          limit: itemsPerPage,
          search: filters.search,
          status: filters.status || undefined,
        });
        if (isCancelled) {
          return;
        }

        // A status change can empty the last page of a filtered list.
        if (result.data.length === 0 && currentPage > 1) {
          setCurrentPage(Math.max(1, result.meta.totalPages));
          return;
        }

        setProducts(result.data);
        setTotalItems(result.meta.total);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } catch (error) {
        if (!isCancelled) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load products",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, itemsPerPage, filters, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const handleSearch = (next: ProductFilterValues) => {
    setFilters({ search: next.search.trim(), status: next.status });
    setCurrentPage(1);
  };

  const handleConfirmDeactivate = async () => {
    const product = productToDeactivate;
    if (!product) {
      return;
    }

    setPendingProductId(product.id);
    try {
      await deleteProduct(product.id);
      toast.success(`"${product.name}" is hidden from the shop`);
      setProductToDeactivate(null);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to deactivate product",
      );
    } finally {
      setPendingProductId(null);
    }
  };

  const handleReactivate = async (product: Product) => {
    setPendingProductId(product.id);
    try {
      await updateProduct(product.id, { isActive: true });
      toast.success(`"${product.name}" is visible in the shop again`);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reactivate product",
      );
    } finally {
      setPendingProductId(null);
    }
  };

  const isDeactivating =
    productToDeactivate !== null && pendingProductId === productToDeactivate.id;

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "LINE Shop" },
          { label: "Products", isActive: true },
        ]}
      />

      <ProductHeader />

      <ProductFilters filters={filters} onSearch={handleSearch} />

      <div className="mt-6">
        <ProductTable
          products={products}
          startIndex={(currentPage - 1) * itemsPerPage}
          isLoading={isLoading}
          hasFilters={Boolean(filters.search || filters.status)}
          pendingProductId={pendingProductId}
          onEdit={(product) => router.push(`/products/${product.id}/edit`)}
          onDeactivate={setProductToDeactivate}
          onReactivate={(product) => void handleReactivate(product)}
        />
      </div>

      <AudiencePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        itemLabel="products"
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(nextItemsPerPage) => {
          setItemsPerPage(nextItemsPerPage);
          setCurrentPage(1);
        }}
      />

      <ConfirmDialog
        open={Boolean(productToDeactivate)}
        onOpenChange={(open) => {
          if (!open && !isDeactivating) {
            setProductToDeactivate(null);
          }
        }}
        title="Deactivate Product"
        description={
          <>
            Hide{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              &quot;{productToDeactivate?.name}&quot;
            </span>{" "}
            from the LINE shop? Existing orders keep their data, and you can
            reactivate it any time.
          </>
        }
        variant="destructive"
        confirmLabel="Deactivate"
        loadingLabel="Deactivating..."
        isLoading={isDeactivating}
        onConfirm={handleConfirmDeactivate}
        showCloseButton={!isDeactivating}
      />
    </div>
  );
}
