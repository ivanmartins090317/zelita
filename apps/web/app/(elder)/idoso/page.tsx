import { getElderPreview } from "@/modules/elder-access/application/get-elder-preview";
import { ElderHome } from "@/modules/elder-access/presentation/elder-home";

export default async function ElderHomePage() {
  const preview = await getElderPreview();
  if (preview.kind !== "ready") return null;

  return (
    <ElderHome
      greeting={preview.greeting}
      dateLabel={preview.dateLabel}
      homeCard={preview.homeCard}
      loadWarning={preview.loadWarning}
    />
  );
}
