import { ProductBuilderContainer } from "@/features/products/containers/product-builder";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return <ProductBuilderContainer productId={id} />;
}
