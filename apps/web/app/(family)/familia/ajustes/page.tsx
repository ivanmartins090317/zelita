import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getAjustesPage } from "@/modules/care-recipients/application/get-ajustes-page";
import { AjustesPageView } from "@/modules/care-recipients/presentation/ajustes-page-view";

export default async function AjustesPage() {
  const result = await getAjustesPage();

  if (!result.ok) {
    return (
      <EmptyState
        icon="⚙"
        title={
          result.reason === "forbidden"
            ? familyContent.ajustes.errors.accessDenied
            : familyContent.ajustes.errors.loadTitle
        }
        description={result.message}
      />
    );
  }

  return <AjustesPageView data={result.data} />;
}
