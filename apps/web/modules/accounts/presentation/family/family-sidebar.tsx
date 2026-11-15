"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { familyGuideTargetIds } from "@/content/family-guide";
import { familyContent } from "@/content/family";
import { cn } from "@/lib/utils";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import { signOut } from "@/modules/accounts/application/auth-actions";
import {
  SIDEBAR_ID,
  useFamilyMobileMenu,
} from "@/modules/accounts/presentation/family/family-mobile-menu";
import {
  buildFamilyNavSections,
  isNavItemActive,
  type FamilyNavItem,
} from "@/modules/accounts/presentation/family/family-nav";
import {
  FAMILY_NAV_ICON_STROKE,
  familyNavIcons,
} from "@/modules/accounts/presentation/family/family-nav-icons";
import { FamilyRecipientPicker } from "@/modules/accounts/presentation/family/family-recipient-picker";
import { FamilyMark } from "@/modules/accounts/presentation/family/family-shell-layout";
import {
  formatNavCountSuffix,
  formatSidebarPlanBadge,
  resolveNavBadgeCount,
} from "@/modules/accounts/presentation/family/family-sidebar-labels";

interface FamilySidebarProps {
  shell: ShellContext;
}

function FamilySidebar({ shell }: FamilySidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useFamilyMobileMenu();
  const sections = buildFamilyNavSections();
  const planLabel = formatSidebarPlanBadge(shell.accountPlan, shell.isPaused);

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label={familyContent.mobileNav.closeLabel}
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id={SIDEBAR_ID}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(100%,288px)] flex-col bg-brand-900 px-3 pb-4 text-on-dark transition-transform duration-200 ease-out motion-reduce:transition-none max-md:pt-(--family-header-offset,1rem) md:static md:z-auto md:w-[272px] md:translate-x-0 md:pt-4 md:shrink-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <FamilyMark planLabel={planLabel} planPaused={shell.isPaused} />
        <div data-tour={familyGuideTargetIds.recipient}>
          <FamilyRecipientPicker shell={shell} />
        </div>
        <nav
          className="mt-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pb-2"
          aria-label="Áreas do painel"
        >
          {sections.map((section) => (
            <div
              key={section.label ?? "principal"}
              className="flex flex-col gap-2"
            >
              {section.label ? (
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-on-dark-muted">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => (
                <FamilyNavLink
                  key={item.id}
                  item={item}
                  active={isNavItemActive(pathname, item.path)}
                  badge={resolveNavBadgeCount({
                    itemId: item.id,
                    activeMedicationCount: shell.activeMedicationCount,
                    openAlertsCount: shell.openAlertsCount,
                  })}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>
        <form action={signOut} className="mt-2 border-t border-white/10 pt-3">
          <button
            type="submit"
            className="border flex min-h-tap w-full items-center justify-center rounded-control px-3 text-left text-sm font-semibold text-on-dark-muted transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-on-dark focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          >
            {familyContent.topbar.signOutLabel}
          </button>
        </form>
      </aside>
    </>
  );
}

interface FamilyNavLinkProps {
  item: FamilyNavItem;
  active: boolean;
  badge: number | null;
  onNavigate: () => void;
}

function FamilyNavLink({
  item,
  active,
  badge,
  onNavigate,
}: FamilyNavLinkProps) {
  const Icon = familyNavIcons[item.id];
  const isEmergency = item.id === "pedidos-de-ajuda";
  const countSuffix = badge ? formatNavCountSuffix(item.id, badge) : null;

  return (
    <Link
      href={item.path}
      data-tour={item.id}
      onClick={onNavigate}
      className={cn(
        "relative flex min-h-tap items-center gap-2.5 overflow-hidden rounded-control px-3 py-2 text-[14px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-on-dark focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900",
        active
          ? "bg-brand-600 text-white"
          : "text-on-dark-soft hover:bg-white/10 hover:text-white",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-pill bg-brand-on-dark"
        />
      ) : null}
      <Icon
        aria-hidden
        strokeWidth={FAMILY_NAV_ICON_STROKE}
        className={cn(
          "size-[18px] shrink-0",
          isEmergency && !active && "text-coral",
        )}
      />
      <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
      {badge && countSuffix ? (
        <span
          className={cn(
            "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-pill px-1.5 text-[12px] font-extrabold leading-none tabular-nums",
            active ? "bg-white text-brand-900" : "bg-white/20 text-white",
          )}
        >
          <span className="sr-only">{countSuffix}</span>
          <span aria-hidden>{badge}</span>
        </span>
      ) : null}
    </Link>
  );
}

export { FamilySidebar };
