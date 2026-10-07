import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import {
  dedupeAsync,
  invalidateDedupe,
  REMOUNT_DEDUPE_TTL_MS,
} from "@/lib/dedupe-async";
import {
  CreateProductPayload,
  Product,
  ProductListResponse,
  ProductQuery,
  UpdateProductPayload,
  UploadedProductImage,
} from "../types";

export async function fetchProductsAdmin(
  query: ProductQuery,
): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.status) {
    params.set("status", query.status);
  }

  const response = await fetch(`${API_ENDPOINTS.PRODUCTS.ADMIN_LIST}?${params}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch products");

  return response.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  return dedupeAsync(
    `products:${id}`,
    async () => {
      const response = await fetch(API_ENDPOINTS.PRODUCTS.ADMIN_DETAIL(id), {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch product");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS },
  );
}

export async function uploadProductImage(
  file: File,
): Promise<UploadedProductImage> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(API_ENDPOINTS.PRODUCTS.MEDIA, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  await assertOkResponse(response, "Failed to upload image");

  return response.json();
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await fetch(API_ENDPOINTS.PRODUCTS.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to create product");

  return response.json();
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to update product");

  invalidateDedupe(`products:${id}`);
  return response.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to deactivate product");
  invalidateDedupe(`products:${id}`);
}
