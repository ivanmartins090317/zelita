import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getConsultasPage } from "@/modules/agenda/application/get-consultas-page";
import { ConsultasPageView } from "@/modules/agenda/presentation/consultas-page-view";

interface ConsultasPageProps {
  searchParams: Promise<{
    semana?: string;
    modal?: string;
    editar?: string;
    editarTarefa?: string;
  }>;
}

export default async function ConsultasPage({
  searchParams,
}: ConsultasPageProps) {
  const params = await searchParams;
  const result = await getConsultasPage({
    semana: params.semana,
    modal: params.modal,
    editar: params.editar,
    editarTarefa: params.editarTarefa,
  });

  if (!result.ok) {
    return (
      <EmptyState
        icon="🗓"
        title={familyContent.consultas.loadError}
        description="Recarregue a página para tentar de novo."
      />
    );
  }

  return <ConsultasPageView data={result.data} />;
}
