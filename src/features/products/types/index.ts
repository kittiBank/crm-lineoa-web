export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stockQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stockQty: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface UploadedProductImage {
  url: string;
  displayUrl: string;
  key: string;
}
