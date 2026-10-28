import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { readElderDeviceSubtitle } from "@/modules/elder-access/application/get-install-page";
import { getAjustesPage } from "@/modules/care-recipients/application/get-ajustes-page";
import { AjustesPageView } from "@/modules/care-recipients/presentation/ajustes-page-view";

export default async function AjustesPage() {
  const result = await getAjustesPage();
  const deviceSubtitle = result.ok ? await readElderDeviceSubtitle() : null;

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

  return <AjustesPageView data={result.data} deviceSubtitle={deviceSubtitle} />;
}
