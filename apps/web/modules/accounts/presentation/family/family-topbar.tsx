"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FamilyGuideStartButton } from "@/components/family-guide/family-guide-tour";
import { Button } from "@/components/ui/button";
import { Tag, tagVariants } from "@/components/ui/tag";
import { familyGuideTargetIds } from "@/content/family-guide";
import {
  familyContent,
  familyRoutes,
  formatFamilySubtitle,
} from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import {
  FamilyMobileMenuButton,
  useFamilyMobileMenu,
} from "@/modules/accounts/presentation/family/family-mobile-menu";
import { resolveNavAreaFromPath } from "@/modules/accounts/presentation/family/family-nav";

interface FamilyTopbarProps {
  shell: ShellContext;
}

function FamilyTopbar({ shell }: FamilyTopbarProps) {
  const pathname = usePathname();
  const { headerRef } = useFamilyMobileMenu();
  const areaId = resolveNavAreaFromPath(pathname);
  const area = familyContent.areas[areaId];
  const subtitle = formatFamilySubtitle(
    area.subtitle,
    shell.careRecipientDisplayName,
  );
  const copy = familyContent.topbar;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-line-2 bg-sand/95 px-4 py-4 backdrop-blur-sm sm:px-6 md:z-20 lg:px-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3 max-md:basis-full">
          <div className="min-w-0">
            <h1 className="font-head text-2xl font-extrabold text-brand-900">
              {area.title}
            </h1>
            <p className="mt-0.5 text-secondary text-muted">{subtitle}</p>
          </div>
          <FamilyMobileMenuButton />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FamilyGuideStartButton variant="outline" size="sm">
            {copy.tourLabel}
          </FamilyGuideStartButton>

          {shell.canManageMedications && !shell.isPaused ? (
            <div
              data-tour={familyGuideTargetIds.shortcuts}
              className="flex flex-wrap items-center gap-2"
            >
              <Button asChild variant="outline" size="sm">
                <Link href={`${familyRoutes.remedios}?modal=nova`}>
                  {copy.addMedicationLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`${familyRoutes.exames}?modal=exame`}>
                  {copy.addExamLabel}
                </Link>
              </Button>
            </div>
          ) : null}

          {shell.isPaused && shell.canManageBilling ? (
            <Link
              href={familyRoutes.plano}
              className={tagVariants({
                tone: "warning",
                className: "min-h-9 px-3 text-sm no-underline",
              })}
            >
              {familyContent.pausedBanner.badgeLabel}
            </Link>
          ) : null}

          {shell.isPaused && !shell.canManageBilling ? (
            <Tag tone="warning" className="min-h-9 px-3 text-sm">
              {familyContent.pausedBanner.badgeLabel}
            </Tag>
          ) : null}

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
