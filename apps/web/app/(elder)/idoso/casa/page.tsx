import { redirect } from "next/navigation";

import { elderRoutes } from "@/content/elder";
import { getElderSurface } from "@/modules/elder-access/application/get-elder-surface";
import { ElderConfirmHome } from "@/modules/elder-access/presentation/elder-confirm-home";

export default async function ElderConfirmCasaPage() {
  const surface = await getElderSurface();
  if (surface.kind !== "ready" || surface.door !== "device") {
    redirect(elderRoutes.home);
  }

  return <ElderConfirmHome />;
}
