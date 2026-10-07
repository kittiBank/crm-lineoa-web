export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  /** Qty available for sale; paid orders deduct from it. */
  stockQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  /** null removes the image. */
  imageUrl?: string | null;
  stockQty: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface UploadedProductImage {
  url: string;
  displayUrl: string;
  key: string;
}

export type ProductStatusFilter = "active" | "inactive";

export interface ProductQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatusFilter;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
