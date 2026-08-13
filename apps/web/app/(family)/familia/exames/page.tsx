import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getExamesPage } from "@/modules/exams/application/get-exames-page";
import { ExamesPageView } from "@/modules/exams/presentation/exames-page-view";

interface ExamesPageProps {
  searchParams: Promise<{
    modal?: string;
    exame?: string;
    editar?: string;
  }>;
}

export default async function ExamesPage({ searchParams }: ExamesPageProps) {
  const params = await searchParams;
  const result = await getExamesPage({
    modal: params.modal,
    exame: params.exame,
    editar: params.editar,
  });

  if (!result.ok) {
    return (
      <EmptyState
        icon="📄"
        title={familyContent.exames.loadError}
        description={result.message}
      />
    );
  }

  return <ExamesPageView data={result.data} />;
}
