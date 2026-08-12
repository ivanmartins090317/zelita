import Link from "next/link";

import { Note } from "@/components/ui/note";
import { familyContent, familyRoutes } from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import { ACCOUNT_STATUSES } from "@/modules/accounts/domain/roles";

interface FamilyPausedBannerProps {
  shell: ShellContext;
}

function FamilyPausedBanner({ shell }: FamilyPausedBannerProps) {
  if (!shell.isPaused) return null;

  const copy = familyContent.pausedBanner;
  const isCanceled = shell.accountStatus === ACCOUNT_STATUSES.canceled;

  return (
    <Note tone="warning" className="mb-4">
      <strong>{isCanceled ? copy.canceledTitle : copy.pausedTitle}</strong>
      {isCanceled ? copy.canceledBody : copy.pausedBody}{" "}
      <Link
        href={familyRoutes.plano}
        className="font-bold text-brand-700 underline-offset-2 hover:underline"
      >
        {copy.ctaLabel}
      </Link>
    </Note>
  );
}

export { FamilyPausedBanner };
