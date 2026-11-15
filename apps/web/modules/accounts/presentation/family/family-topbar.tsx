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
import { cn } from "@/lib/utils";
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
  const { open } = useFamilyMobileMenu();
  const areaId = resolveNavAreaFromPath(pathname);
  const area = familyContent.areas[areaId];
  const subtitle = formatFamilySubtitle(
    area.subtitle,
    shell.careRecipientDisplayName,
  );
  const copy = familyContent.topbar;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line-2/80 bg-sand/80 px-4 py-2 backdrop-blur-md sm:px-6 md:z-20 md:bg-sand/95 md:py-4 md:backdrop-blur-sm lg:px-8",
        open && "max-md:invisible",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-head text-2xl font-extrabold leading-tight text-brand-900">
            {area.title}
          </h1>
          <p className="mt-0.5 truncate text-secondary text-muted">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <FamilyGuideStartButton variant="outline" size="sm">
              {copy.tourLabel}
            </FamilyGuideStartButton>

            {shell.canManageMedications && !shell.isPaused ? (
              <div
                data-tour={familyGuideTargetIds.shortcuts}
                className="flex items-center gap-2"
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
          </div>

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
          <FamilyMobileMenuButton />
        </div>
      </div>
    </header>
  );
}

export { FamilyTopbar };
