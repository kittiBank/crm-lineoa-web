"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ProductHeader,
  ProductTable,
  ProductPagination,
} from "@/features/products/components";
import { deleteProduct, fetchProductsAdmin } from "@/features/products/lib/api";
import { Product } from "@/features/products/types";
import { useToast } from "@/lib/hooks/useToast";

export function ProductsListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProductsAdmin();
        if (isCancelled) return;
        setProducts(data);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
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
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleEdit = (id: string) => {
    router.push(`/products/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (product) {
      setProductToDelete(product);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((current) =>
        current.map((item) =>
          item.id === productToDelete.id ? { ...item, isActive: false } : item,
        ),
      );
      setProductToDelete(null);
      toast.success(`"${productToDelete.name}" deactivated successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate product");
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Products", isActive: true },
  ];

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <ProductHeader />

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading products...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ProductTable
              products={paginatedProducts}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </div>

          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setProductToDelete(null);
          }
        }}
        title="Deactivate Product"
        description={
          <>
            Are you sure you want to deactivate{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              &quot;{productToDelete?.name}&quot;
            </span>
            ? It will be hidden from the shop but existing orders keep their data.
          </>
        }
        variant="destructive"
        confirmLabel="Deactivate"
        loadingLabel="Deactivating..."
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        showCloseButton={!isDeleting}
      />
    </div>
  );
}
