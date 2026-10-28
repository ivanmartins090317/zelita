import { redirect } from "next/navigation";

import { elderRoutes } from "@/content/elder";
import { getElderSurface } from "@/modules/elder-access/application/get-elder-surface";
import { ElderInstalledGuide } from "@/modules/elder-access/presentation/elder-installed-guide";

export const dynamic = "force-dynamic";

export default async function ElderInstalledPage() {
  const surface = await getElderSurface();
  if (surface.kind !== "ready") return null;
  if (surface.door !== "device") redirect(elderRoutes.home);
  return <ElderInstalledGuide />;
}
