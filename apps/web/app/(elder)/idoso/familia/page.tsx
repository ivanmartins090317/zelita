import { getElderPreview } from "@/modules/elder-access/application/get-elder-preview";
import { ElderFamilyList } from "@/modules/elder-access/presentation/elder-family-list";

export default async function ElderFamilyPage() {
  const preview = await getElderPreview();
  if (preview.kind !== "ready") return null;

  return <ElderFamilyList calls={preview.calls} />;
}
