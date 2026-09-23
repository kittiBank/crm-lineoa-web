import { RichMessageBuilderContainer } from "@/features/rich-message/containers/rich-message-builder";

interface EditRichMessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRichMessagePage({
  params,
}: EditRichMessagePageProps) {
  const { id } = await params;

  return <RichMessageBuilderContainer messageId={id} mode="edit" />;
}
