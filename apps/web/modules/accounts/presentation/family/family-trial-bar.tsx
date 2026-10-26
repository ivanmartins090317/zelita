import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import {
  familyContent,
  familyRoutes,
  formatTrialBadge,
} from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";

interface FamilyTrialBarProps {
  shell: ShellContext;
}

function withDate(template: string, dateLabel: string): string {
  return template.replace("{date}", dateLabel);
}

function FamilyTrialEndingBar({ shell }: FamilyTrialBarProps) {
  const copy = familyContent.trialBar;
  const dateLabel = shell.accessNotice.endsAtLabel;
  const title =
    dateLabel === null
      ? copy.endingIntro
      : withDate(
          shell.trial ? copy.endingTitle : copy.endingOverdueTitle,
          dateLabel,
        );

  return (
    <div className="mb-4 rounded-note border border-amber-line bg-amber-bg px-4 py-3.5 text-amber-ink sm:px-[18px]">
      <p className="text-[15px] font-bold leading-snug">{title}</p>
      <p className="mt-2 text-[15px] leading-snug">{copy.endingIntro}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-snug">
        {copy.endingStops.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-2 text-[15px] leading-snug">{copy.endingContinues}</p>
      {shell.canManageBilling ? (
        <Button asChild size="sm" className="mt-3">
          <Link href={familyRoutes.plano}>{copy.endingCtaLabel}</Link>
        </Button>
      ) : (
        <p className="mt-3 text-[15px] font-bold leading-snug">
          {copy.endingAskAdmin}
        </p>
      )}
    </div>
  );
}

function FamilyTrialBar({ shell }: FamilyTrialBarProps) {
  if (shell.accessNotice.phase === "ending") {
    return <FamilyTrialEndingBar shell={shell} />;
  }

  if (!shell.trial || shell.accessNotice.phase !== "calm") return null;

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
