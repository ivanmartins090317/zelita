"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { familyContent } from "@/content/family";
import { cn } from "@/lib/utils";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import { signOut } from "@/modules/accounts/application/auth-actions";
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

const SIDEBAR_ID = "family-sidebar";

function FamilySidebar({ shell }: FamilySidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = buildFamilyNavSections();
  const planLabel = formatSidebarPlanBadge(shell.accountPlan, shell.isPaused);

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 left-4 z-50 flex min-h-tap min-w-tap items-center justify-center rounded-control bg-brand-800 text-white shadow-card md:hidden"
        aria-expanded={mobileOpen}
        aria-controls={SIDEBAR_ID}
        aria-label={
          mobileOpen
            ? familyContent.mobileNav.closeLabel
            : familyContent.mobileNav.openLabel
        }
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? (
          <X aria-hidden className="size-5" strokeWidth={2} />
        ) : (
          <Menu aria-hidden className="size-5" strokeWidth={2} />
        )}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label={familyContent.mobileNav.closeLabel}
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id={SIDEBAR_ID}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(100%,288px)] flex-col bg-brand-900 px-3 py-4 text-on-dark transition-transform duration-200 ease-out motion-reduce:transition-none md:static md:z-auto md:w-[272px] md:translate-x-0 md:shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <FamilyMark planLabel={planLabel} planPaused={shell.isPaused} />
        <FamilyRecipientPicker shell={shell} />
        <nav
          className="mt-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pb-2"
          aria-label="Áreas do painel"
        >
          {sections.map((section) => (
            <div key={section.label ?? "principal"} className="flex flex-col gap-2">
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
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>
        <form action={signOut} className="mt-2 border-t border-white/10 pt-3">
          <button
            type="submit"
            className="flex min-h-tap w-full items-center rounded-control px-3 text-left text-sm font-semibold text-on-dark-muted transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-on-dark focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
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

function FamilyNavLink({ item, active, badge, onNavigate }: FamilyNavLinkProps) {
  const Icon = familyNavIcons[item.id];
  const isEmergency = item.id === "pedidos-de-ajuda";
  const countSuffix = badge ? formatNavCountSuffix(item.id, badge) : null;

  return (
    <Link
      href={item.path}
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
