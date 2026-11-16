import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { webManifestPath } from "@/lib/pwa/web-manifests";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import { FamilyShellLayout } from "@/modules/accounts/presentation/family/family-shell-layout";
import { FamilySidebar } from "@/modules/accounts/presentation/family/family-sidebar";
import { FamilyTopbar } from "@/modules/accounts/presentation/family/family-topbar";
import { FamilyTrialBar } from "@/modules/accounts/presentation/family/family-trial-bar";
import { FamilyPausedBanner } from "@/modules/accounts/presentation/family/family-paused-banner";

export const metadata: Metadata = {
  manifest: webManifestPath("familia"),
  appleWebApp: {
    capable: true,
    title: "Família",
    statusBarStyle: "default",
  },
};

interface FamilyLayoutProps {
  children: React.ReactNode;
}

export default async function FamilyLayout({ children }: FamilyLayoutProps) {
  const shell = await getShellContext();

  if (!shell) {
    redirect("/onboarding");
  }

  return (
    <FamilyShellLayout
      sidebar={<FamilySidebar shell={shell} />}
      topbar={<FamilyTopbar shell={shell} />}
      trialBar={<FamilyTrialBar shell={shell} />}
      pausedBanner={<FamilyPausedBanner shell={shell} />}
    >
      {children}
    </FamilyShellLayout>
  );
}
