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
  /** Reward: points to redeem 1 unit in the LIFF shop; null = not a reward. */
  pointsCost: number | null;
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
  /** null turns the reward off. */
  pointsCost?: number | null;
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
