import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { familyContent, familyRoutes } from "@/content/family";
import { getLocalizacaoPage } from "@/modules/location/application/get-localizacao-page";
import { LocalizacaoPageView } from "@/modules/location/presentation/localizacao-page-view";

interface LocalizacaoPageProps {
  searchParams: Promise<{
    focus?: string;
    alerta?: string;
  }>;
}

export default async function LocalizacaoPage({
  searchParams,
}: LocalizacaoPageProps) {
  const params = await searchParams;
  const focus = params.focus ?? (params.alerta ? "alert" : undefined);

  const result = await getLocalizacaoPage({ focus });

  if (!result.ok) {
    if (result.reason === "forbidden") {
      redirect(familyRoutes.hoje);
    }

    return (
      <EmptyState
        icon="📍"
        title={familyContent.localizacao.loadError}
        description={result.message}
      />
    );
  }

  return <LocalizacaoPageView data={result.data} />;
}
