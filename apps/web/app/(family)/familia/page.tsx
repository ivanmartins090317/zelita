import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getHojeDashboard } from "@/modules/accounts/application/get-hoje-dashboard";
import { HojeMaduroView } from "@/modules/accounts/presentation/family/hoje-maduro-view";
import { PrimeiroAcessoView } from "@/modules/accounts/presentation/family/primeiro-acesso-view";

export default async function FamiliaHojePage() {
  const result = await getHojeDashboard();

  if (!result.ok) {
    if (result.reason === "incomplete") {
      redirect("/onboarding");
    }

    const copy = familyContent.hoje.loadError;
    return (
      <EmptyState
        icon="⚠️"
        title={copy.title}
        description={result.message || copy.description}
        className="mx-auto mt-8 max-w-lg bg-white"
      />
    );
  }

  const { data } = result;

  if (data.mode === "primeiro_acesso") {
    return <PrimeiroAcessoView data={data} />;
  }

  return <HojeMaduroView data={data} />;
}
