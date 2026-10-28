import { getElderPreview } from "@/modules/elder-access/application/get-elder-preview";
import { ElderScheduleList } from "@/modules/elder-access/presentation/elder-schedule-list";

export default async function ElderSchedulePage() {
  const preview = await getElderPreview();
  if (preview.kind !== "ready") return null;

  return (
    <ElderScheduleList items={preview.schedule} loadWarning={preview.loadWarning} />
  );
}
