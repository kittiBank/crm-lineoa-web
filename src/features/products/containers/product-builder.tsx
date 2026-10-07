"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Loader2, Trash2, Upload } from "lucide-react";
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

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
// products.price is DECIMAL(10, 2).
const MAX_PRICE = 99_999_999.99;
const MAX_QTY = 999_999;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const errorInputClassName =
  "border-red-500 focus:ring-red-500 dark:border-red-500";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

type ProductFormErrors = {
  image?: string;
  name?: string;
  price?: string;
  stockQty?: string;
};

function RequiredMark() {
  return <span className="text-red-500">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{message}</p>
  );
}

function fieldClassName(error?: string) {
  return error ? `${inputClassName} ${errorInputClassName}` : inputClassName;
}

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
  const [errors, setErrors] = useState<ProductFormErrors>({});

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

    if (!IMAGE_TYPES.includes(file.type)) {
      setFieldError("image", "Image must be JPG, PNG, GIF or WebP");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFieldError("image", "Image must be 10 MB or smaller");
      return;
    }

    setFieldError("image", undefined);
    setIsUploading(true);
    try {
      const uploaded = await uploadProductImage(file);
      setImageUrl(uploaded.url);
      setImagePreview(uploaded.displayUrl);
    } catch (error) {
      setFieldError(
        "image",
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const setFieldError = (
    field: keyof ProductFormErrors,
    message: string | undefined,
  ) => {
    setErrors((prev) =>
      prev[field] === message ? prev : { ...prev, [field]: message },
    );
  };

  /** Checks every field so all errors show at once. */
  const validateForm = () => {
    const nextErrors: ProductFormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Product name is required";
    }

    const priceText = price.trim();
    const priceNumber = Number(priceText);
    if (!priceText) {
      nextErrors.price = "Price is required";
    } else if (Number.isNaN(priceNumber) || priceNumber < 0) {
      nextErrors.price = "Price must be 0 or more";
    } else if (!/^\d+(\.\d{1,2})?$/.test(priceText)) {
      nextErrors.price = "Price can have at most 2 decimal places";
    } else if (priceNumber > MAX_PRICE) {
      nextErrors.price = "Price must be 99,999,999.99 or less";
    }

    const qtyText = stockQty.trim();
    const qtyNumber = Number(qtyText);
    if (!qtyText) {
      nextErrors.stockQty = "Qty for sale is required";
    } else if (!Number.isInteger(qtyNumber) || qtyNumber < 0) {
      nextErrors.stockQty = "Qty for sale must be a whole number, 0 or more";
    } else if (qtyNumber > MAX_QTY) {
      nextErrors.stockQty = "Qty for sale must be 999,999 or less";
    }

    // Keep an image upload error; it is not re-checked here.
    setErrors((prev) => ({ image: prev.image, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
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
        // Edit sends null to remove an image; create just omits it.
        imageUrl: imageUrl || (isEditMode ? null : undefined),
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
    { label: "LINE Shop" },
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
            ? "Update the details shown in your LINE shop"
            : "Add a new item to your LINE shop"}
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
                {isUploading
                  ? "Uploading..."
                  : imagePreview
                    ? "Change Image"
                    : "Upload Image"}
              </button>
              {imagePreview && !isUploading ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setImagePreview("");
                    setFieldError("image", undefined);
                  }}
                  className="ml-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              ) : null}
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, GIF or WebP, up to 10 MB
              </p>
              <FieldError message={errors.image} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="product-name" className={labelClassName}>
                Name <RequiredMark />
              </label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldError("name", undefined);
                }}
                maxLength={MAX_NAME_LENGTH}
                className={fieldClassName(errors.name)}
                placeholder="e.g. Cold Brew Coffee 500ml"
                aria-invalid={Boolean(errors.name)}
              />
              <FieldError message={errors.name} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="product-description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className={`${inputClassName} resize-none`}
                placeholder="Optional product description"
              />
            </div>
            <div>
              <label htmlFor="product-price" className={labelClassName}>
                Price (฿) <RequiredMark />
              </label>
              <Input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setFieldError("price", undefined);
                }}
                className={fieldClassName(errors.price)}
                placeholder="120.00"
                aria-invalid={Boolean(errors.price)}
              />
              <FieldError message={errors.price} />
            </div>
            <div>
              <label htmlFor="product-qty" className={labelClassName}>
                Qty for Sale <RequiredMark />
              </label>
              <Input
                id="product-qty"
                type="number"
                min={0}
                step="1"
                value={stockQty}
                onChange={(e) => {
                  setStockQty(e.target.value);
                  setFieldError("stockQty", undefined);
                }}
                className={fieldClassName(errors.stockQty)}
                placeholder="50"
                aria-invalid={Boolean(errors.stockQty)}
              />
              {errors.stockQty ? (
                <FieldError message={errors.stockQty} />
              ) : (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Paid orders deduct from this. At 0 the shop shows it as out of
                  stock.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="product-status" className={labelClassName}>
                Status
              </label>
              <select
                id="product-status"
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
