import type { Metadata } from "next";
import type { ReactNode } from "react";

import { webManifestPath } from "@/lib/pwa/web-manifests";
import { getElderSurface } from "@/modules/elder-access/application/get-elder-surface";
import { readElderDisplayFromCookie } from "@/modules/elder-access/application/read-elder-display";
import { showsPreviewBanner } from "@/modules/elder-access/domain/device-link";
import { ElderShell } from "@/modules/elder-access/presentation/elder-shell";
import { ElderUnlinked } from "@/modules/elder-access/presentation/elder-unlinked";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zelita",
  manifest: webManifestPath("idoso"),
  appleWebApp: {
    capable: true,
    title: "Zelita",
    statusBarStyle: "default",
  },
};

interface ElderLayoutProps {
  children: ReactNode;
}

export default async function ElderLayout({ children }: ElderLayoutProps) {
  const surface = await getElderSurface();
  if (surface.kind !== "ready") return <ElderUnlinked />;

  const display = await readElderDisplayFromCookie();
  return (
    <ElderShell display={display} showPreviewBanner={showsPreviewBanner(surface.door)}>
      {children}
    </ElderShell>
  );
}
