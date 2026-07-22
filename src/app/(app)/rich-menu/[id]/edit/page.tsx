import { RichMenuBuilderContainer } from "@/features/rich-menu/containers/rich-menu-builder";

interface EditRichMenuPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRichMenuPage({ params }: EditRichMenuPageProps) {
  const { id } = await params;

  return <RichMenuBuilderContainer menuId={id} mode="edit" />;
}
