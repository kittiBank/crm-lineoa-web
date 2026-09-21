import { ShopCheckoutContainer } from "@/features/liff-shop/containers/shop-checkout";

interface LiffShopCheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function LiffShopCheckoutPage({
  params,
}: LiffShopCheckoutPageProps) {
  const { id } = await params;

  return <ShopCheckoutContainer orderId={id} />;
}
