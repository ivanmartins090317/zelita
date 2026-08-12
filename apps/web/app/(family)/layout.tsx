import { redirect } from "next/navigation";

import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import { FamilyShellLayout } from "@/modules/accounts/presentation/family/family-shell-layout";
import { FamilySidebar } from "@/modules/accounts/presentation/family/family-sidebar";
import { FamilyTopbar } from "@/modules/accounts/presentation/family/family-topbar";
import { FamilyTrialBar } from "@/modules/accounts/presentation/family/family-trial-bar";
import { FamilyPausedBanner } from "@/modules/accounts/presentation/family/family-paused-banner";

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
