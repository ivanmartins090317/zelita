import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getParticipantesPage } from "@/modules/accounts/application/get-participantes-page";
import { ParticipantesPageView } from "@/modules/accounts/presentation/participantes-page-view";

interface ParticipantesPageProps {
  searchParams: Promise<{
    modal?: string;
  }>;
}

export default async function ParticipantesPage({
  searchParams,
}: ParticipantesPageProps) {
  const params = await searchParams;
  const result = await getParticipantesPage({ modal: params.modal });

  if (!result.ok) {
    return (
      <EmptyState
        icon="👥"
        title={familyContent.participantes.loadError}
        description="Recarregue a página para tentar de novo."
      />
    );
  }

  return <ParticipantesPageView data={result.data} />;
}
