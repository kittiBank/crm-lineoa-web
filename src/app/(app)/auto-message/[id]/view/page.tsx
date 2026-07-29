import { AutoMessageBuilderContainer } from "@/features/auto-message/containers/auto-message-builder";

interface ViewAutoMessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewAutoMessagePage({ params }: ViewAutoMessagePageProps) {
  const { id } = await params;

  return <AutoMessageBuilderContainer autoMessageId={id} mode="view" />;
}
