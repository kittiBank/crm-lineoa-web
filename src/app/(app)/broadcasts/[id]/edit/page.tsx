import { BroadcastBuilderContainer } from "@/features/broadcasts/containers/broadcast-builder";

interface EditBroadcastPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBroadcastPage({ params }: EditBroadcastPageProps) {
  const { id } = await params;

  return <BroadcastBuilderContainer broadcastId={id} mode="edit" />;
}
