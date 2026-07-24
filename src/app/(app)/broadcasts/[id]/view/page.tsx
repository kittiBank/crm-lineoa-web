import { BroadcastBuilderContainer } from "@/features/broadcasts/containers/broadcast-builder";

interface ViewBroadcastPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewBroadcastPage({ params }: ViewBroadcastPageProps) {
  const { id } = await params;

  return <BroadcastBuilderContainer broadcastId={id} mode="view" />;
}
