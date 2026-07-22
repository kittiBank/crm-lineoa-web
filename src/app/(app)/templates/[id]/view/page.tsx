import { TemplateBuilderContainer } from "@/features/templates/containers/template-builder";

interface ViewTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewTemplatePage({ params }: ViewTemplatePageProps) {
  const { id } = await params;

  return <TemplateBuilderContainer templateId={id} mode="view" />;
}
