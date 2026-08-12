import { EmptyState } from "@/components/ui/empty-state";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";

export default function GuiaPage() {
  const placeholder = familyContent.placeholders.guia;

  return (
    <div className="mx-auto mt-4 max-w-lg space-y-4">
      <EmptyState
        icon={placeholder.icon}
        title={placeholder.title}
        description={placeholder.description}
        className="bg-white"
      />
      <Note tone="info">{familyContent.guia.tourNote}</Note>
    </div>
  );
}
