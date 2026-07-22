import { TemplateBuilderContainer } from "@/features/templates/containers/template-builder";

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;

  return <TemplateBuilderContainer templateId={id} />;
}
