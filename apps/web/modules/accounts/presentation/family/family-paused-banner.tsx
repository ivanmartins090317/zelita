import Link from "next/link";

import { Button } from "@/components/ui/button";
import { familyContent, familyRoutes } from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";

interface FamilyPausedBannerProps {
  shell: ShellContext;
}

function withDate(template: string, dateLabel: string): string {
  return template.replace("{date}", dateLabel);
}

function FamilyPausedBanner({ shell }: FamilyPausedBannerProps) {
  if (shell.accessNotice.phase !== "paused") return null;

  const copy = familyContent.pausedBanner;
  const isCanceled = shell.accessNotice.isCanceled;
  const dateLabel = shell.accessNotice.endsAtLabel;
  const when = isCanceled
    ? copy.canceledBody
    : dateLabel
      ? withDate(copy.pausedWhen, dateLabel)
      : copy.pausedWhenUnknown;

  return (
    <div className="mb-4 rounded-note border border-amber-line bg-amber-bg px-4 py-3.5 text-amber-ink sm:px-[18px]">
      <p className="text-[15px] font-bold leading-snug">
        {isCanceled ? copy.canceledTitle : copy.pausedTitle}
      </p>
      <p className="mt-2 text-[15px] leading-snug">{when}</p>
      <p className="mt-3 text-[15px] font-bold leading-snug">{copy.stopsTitle}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-snug">
        {copy.stops.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-2 text-[15px] leading-snug">{copy.continues}</p>
      {shell.canManageBilling ? (
        <Button asChild size="sm" className="mt-3">
          <Link href={familyRoutes.plano}>{copy.ctaLabel}</Link>
        </Button>
      ) : (
        <p className="mt-3 text-[15px] font-bold leading-snug">{copy.askAdmin}</p>
      )}
    </div>
  );
}

export { FamilyPausedBanner };
