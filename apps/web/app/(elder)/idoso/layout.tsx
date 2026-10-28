import type { ReactNode } from "react";

import { getElderPreview } from "@/modules/elder-access/application/get-elder-preview";
import { readElderDisplayFromCookie } from "@/modules/elder-access/application/read-elder-display";
import { ElderShell } from "@/modules/elder-access/presentation/elder-shell";
import { ElderUnlinked } from "@/modules/elder-access/presentation/elder-unlinked";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zelita",
};

interface ElderLayoutProps {
  children: ReactNode;
}

export default async function ElderLayout({ children }: ElderLayoutProps) {
  const preview = await getElderPreview();
  if (preview.kind !== "ready") return <ElderUnlinked />;

  const display = await readElderDisplayFromCookie();
  return <ElderShell display={display}>{children}</ElderShell>;
}
