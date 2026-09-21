import { ShopOrderDetailContainer } from "@/features/liff-shop/containers/shop-order-detail";

interface LiffShopOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LiffShopOrderDetailPage({
  params,
}: LiffShopOrderDetailPageProps) {
  const { id } = await params;

  return <ShopOrderDetailContainer orderId={id} />;
}
