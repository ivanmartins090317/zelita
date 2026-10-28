import { getElderSurface } from "@/modules/elder-access/application/get-elder-surface";
import { ElderScheduleList } from "@/modules/elder-access/presentation/elder-schedule-list";

export default async function ElderSchedulePage() {
  const surface = await getElderSurface();
  if (surface.kind !== "ready") return null;

  return (
    <ElderScheduleList items={surface.schedule} loadWarning={surface.loadWarning} />
  );
}
