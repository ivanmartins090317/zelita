import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { familyContent, familyRoutes } from "@/content/family";
import { getPedidosDeAjudaPage } from "@/modules/sos/application/get-pedidos-de-ajuda-page";
import { PedidosDeAjudaPageView } from "@/modules/sos/presentation/pedidos-de-ajuda-page-view";

interface PedidosDeAjudaPageProps {
  searchParams: Promise<{
    alerta?: string;
  }>;
}

export default async function PedidosDeAjudaPage({
  searchParams,
}: PedidosDeAjudaPageProps) {
  const params = await searchParams;
  const result = await getPedidosDeAjudaPage({ alertId: params.alerta });

  if (!result.ok) {
    if (result.reason === "forbidden") {
      redirect(familyRoutes.hoje);
    }

    return (
      <EmptyState
        icon="🆘"
        title={familyContent.pedidosDeAjuda.loadError}
        description={result.message}
      />
    );
  }

  return <PedidosDeAjudaPageView data={result.data} />;
}
