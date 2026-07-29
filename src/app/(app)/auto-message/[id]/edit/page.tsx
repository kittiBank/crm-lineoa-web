import { AutoMessageBuilderContainer } from "@/features/auto-message/containers/auto-message-builder";

interface EditAutoMessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAutoMessagePage({ params }: EditAutoMessagePageProps) {
  const { id } = await params;

  return <AutoMessageBuilderContainer autoMessageId={id} />;
}
