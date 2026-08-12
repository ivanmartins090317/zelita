import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getRemediosPage } from "@/modules/medications/application/get-remedios-page";
import { RemediosPageView } from "@/modules/medications/presentation/remedios-page-view";

interface RemediosPageProps {
  searchParams: Promise<{
    remedio?: string;
    modal?: string;
  }>;
}

export default async function RemediosPage({ searchParams }: RemediosPageProps) {
  const params = await searchParams;
  const result = await getRemediosPage({
    remedioId: params.remedio,
    modal: params.modal,
    replacementMedicationId:
      params.modal === "reposicao" ? params.remedio : null,
  });

  if (!result.ok) {
    return (
      <EmptyState
        icon="💊"
        title={familyContent.remedios.loadError}
        description="Recarregue a página para tentar de novo."
      />
    );
  }

  return <RemediosPageView data={result.data} />;
}
