import { RichMessageBuilderContainer } from "@/features/rich-message/containers/rich-message-builder";

interface ViewRichMessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewRichMessagePage({
  params,
}: ViewRichMessagePageProps) {
  const { id } = await params;

  return <RichMessageBuilderContainer messageId={id} mode="view" />;
}
