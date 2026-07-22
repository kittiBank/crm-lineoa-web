import { RichMenuBuilderContainer } from "@/features/rich-menu/containers/rich-menu-builder";

interface ViewRichMenuPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewRichMenuPage({ params }: ViewRichMenuPageProps) {
  const { id } = await params;

  return <RichMenuBuilderContainer menuId={id} mode="view" />;
}
