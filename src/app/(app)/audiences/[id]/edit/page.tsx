import { AudienceBuilderContainer } from "@/features/audiences/containers/audience-builder";

interface EditAudiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAudiencePage({
  params,
}: EditAudiencePageProps) {
  const { id } = await params;

  return <AudienceBuilderContainer audienceId={id} />;
}
