import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import {
  familyContent,
  formatTrialBadge,
} from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import { familyRoutes } from "@/content/family";

interface FamilyTrialBarProps {
  shell: ShellContext;
}

function FamilyTrialBar({ shell }: FamilyTrialBarProps) {
  if (!shell.trial) return null;

  const copy = familyContent.trialBar;
  const badge = formatTrialBadge(
    copy.badgeTemplate,
    shell.trial.currentDay,
    shell.trial.totalDays,
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-note border-[1.5px] border-brand-200 bg-brand-50 px-4 py-3.5 text-body text-brand-800 sm:gap-4 sm:px-[18px]">
      <Tag tone="info" className="font-extrabold">
        {badge}
      </Tag>
      <p className="min-w-[200px] flex-1 text-[15px] leading-snug">
        {copy.body}
        <strong>{copy.bodyBold}</strong>
        {copy.bodySuffix}
      </p>
      <Button asChild variant="outline" size="xs">
        <Link href={familyRoutes.plano}>{copy.ctaLabel}</Link>
      </Button>
    </div>
  );
}

export { FamilyTrialBar };
