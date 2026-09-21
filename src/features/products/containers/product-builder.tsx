"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import {
  createProduct,
  fetchProductById,
  updateProduct,
  uploadProductImage,
} from "@/features/products/lib/api";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

interface ProductBuilderProps {
  productId?: string;
}

export function ProductBuilderContainer({ productId }: ProductBuilderProps) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(productId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let isCancelled = false;

    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const product = await fetchProductById(productId);
        if (isCancelled) return;

        setName(product.name);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setStockQty(String(product.stockQty));
        setIsActive(product.isActive);
        setImageUrl(product.imageUrl ?? "");
        setImagePreview(product.imageUrl ?? "");
      } catch (error) {
        if (isCancelled) return;
        toast.error(error instanceof Error ? error.message : "Failed to load product");
        router.push("/products");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadProductImage(file);
      setImageUrl(uploaded.url);
      setImagePreview(uploaded.displayUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    const priceNumber = Number(price);
    if (!price || Number.isNaN(priceNumber) || priceNumber < 0) {
      toast.error("Price must be a valid non-negative number");
      return false;
    }
    const stockNumber = Number(stockQty);
    if (stockQty === "" || !Number.isInteger(stockNumber) || stockNumber < 0) {
      toast.error("Stock quantity must be a valid non-negative whole number");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        stockQty: Number(stockQty),
        imageUrl: imageUrl || undefined,
        isActive,
      };

      if (isEditMode && productId) {
        await updateProduct(productId, payload);
        toast.success(`"${name.trim()}" updated successfully`);
      } else {
        await createProduct(payload);
        toast.success(`"${name.trim()}" created successfully`);
      }

      router.push("/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Products", href: "/products" },
    { label: isEditMode ? "Edit" : "Create", isActive: true },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading product...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isEditMode
            ? "Update the details shown in your LIFF shop"
            : "Add a new item to your LIFF shop catalog"}
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Product Image
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload Image"}
              </button>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, GIF or WebP, up to 10 MB
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
                placeholder="e.g. Cold Brew Coffee 500ml"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClassName} resize-none`}
                placeholder="Optional product description"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (฿) *
              </label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClassName}
                placeholder="120.00"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Quantity *
              </label>
              <Input
                type="number"
                min={0}
                step="1"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className={inputClassName}
                placeholder="50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className={inputClassName}
              >
                <option value="active">Active (visible in shop)</option>
                <option value="inactive">Inactive (hidden)</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <FormActionFooter
        mode={isEditMode ? "edit" : "create"}
        cancelHref="/products"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        disabled={isUploading}
        createSaveLabel="Add Product"
        editSaveLabel="Save Changes"
        savingLabel="Saving..."
      />
    </div>
  );
}
