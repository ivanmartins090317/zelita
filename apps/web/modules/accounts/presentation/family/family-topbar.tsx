"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  familyContent,
  familyRoutes,
  formatFamilySubtitle,
} from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import { resolveNavAreaFromPath } from "@/modules/accounts/presentation/family/family-nav";

interface FamilyTopbarProps {
  shell: ShellContext;
}

function FamilyTopbar({ shell }: FamilyTopbarProps) {
  const pathname = usePathname();
  const areaId = resolveNavAreaFromPath(pathname);
  const area = familyContent.areas[areaId];
  const subtitle = formatFamilySubtitle(
    area.subtitle,
    shell.careRecipientDisplayName,
  );
  const copy = familyContent.topbar;

  return (
    <header className="sticky top-0 z-20 border-b border-line-2 bg-sand/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-head text-2xl font-extrabold text-brand-900">
            {area.title}
          </h1>
          <p className="mt-0.5 text-secondary text-muted">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={familyRoutes.guia}>{copy.tourLabel}</Link>
          </Button>

          {shell.canManageMedications ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`${familyRoutes.remedios}?modal=nova`}>
                {copy.addMedicationLabel}
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="outline" size="sm">
            <Link href="/familia/exames">{copy.addExamLabel}</Link>
          </Button>

          <span
            aria-hidden
            className="flex size-[33px] flex-none items-center justify-center rounded-pill bg-brand-600 text-[12.5px] font-extrabold text-white"
            title={shell.profileName ?? undefined}
          >
            {shell.profileInitials}
          </span>
        </div>
      </div>
    </header>
  );
}

export { FamilyTopbar };
