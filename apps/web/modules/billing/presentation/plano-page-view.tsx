import type { PlanoPageViewModel } from "@/modules/billing/application/get-plano-page";
import { PlanoCurrentCard } from "@/modules/billing/presentation/plano-current-card";
import { PlanoUsageCard } from "@/modules/billing/presentation/plano-usage-card";

interface PlanoPageViewProps {
  data: PlanoPageViewModel;
}

function PlanoPageView({ data }: PlanoPageViewProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-4 lg:grid-cols-2">
        <PlanoCurrentCard data={data} />
        <PlanoUsageCard usageLines={data.usageLines} />
      </div>
    </div>
  );
}

export { PlanoPageView };
