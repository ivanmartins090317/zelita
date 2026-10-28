import { getElderSurface } from "@/modules/elder-access/application/get-elder-surface";
import { ElderFamilyList } from "@/modules/elder-access/presentation/elder-family-list";

export default async function ElderFamilyPage() {
  const surface = await getElderSurface();
  if (surface.kind !== "ready") return null;

  return <ElderFamilyList calls={surface.calls} />;
}
