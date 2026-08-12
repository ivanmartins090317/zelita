import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import type { FamilyNavAreaId } from "@/modules/accounts/presentation/family/family-nav";

interface FamilyPlaceholderViewProps {
  areaId: Exclude<
    FamilyNavAreaId,
    "hoje" | "remedios"
  >;
}

function FamilyPlaceholderView({ areaId }: FamilyPlaceholderViewProps) {
  const placeholder = familyContent.placeholders[areaId];

  return (
    <EmptyState
      icon={placeholder.icon}
      title={placeholder.title}
      description={placeholder.description}
      className="mx-auto mt-4 max-w-lg bg-white"
    />
  );
}

export { FamilyPlaceholderView };
