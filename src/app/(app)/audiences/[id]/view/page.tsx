import { AudienceBuilderContainer } from "@/features/audiences/containers/audience-builder";

interface ViewAudiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewAudiencePage({
  params,
}: ViewAudiencePageProps) {
  const { id } = await params;

  return <AudienceBuilderContainer audienceId={id} mode="view" />;
}
