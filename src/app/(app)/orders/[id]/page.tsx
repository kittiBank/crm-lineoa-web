import { OrderDetailContainer } from "@/features/orders/containers/order-detail";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return <OrderDetailContainer orderId={id} />;
}
