import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getPlanoPage } from "@/modules/billing/application/get-plano-page";
import { PlanoPageView } from "@/modules/billing/presentation/plano-page-view";

export default async function PlanoPage() {
  const result = await getPlanoPage();

  if (!result.ok) {
    return (
      <EmptyState
        icon="💳"
        title={
          result.reason === "forbidden"
            ? familyContent.plano.errors.accessDenied
            : familyContent.plano.errors.loadTitle
        }
        description={result.message}
      />
    );
  }

  return <PlanoPageView data={result.data} />;
}
