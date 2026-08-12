"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { familyContent } from "@/content/family";
import type { ShellContext } from "@/modules/accounts/application/shell-context";
import { signOut } from "@/modules/accounts/application/auth-actions";
import {
  buildFamilyNavSections,
  isNavItemActive,
} from "@/modules/accounts/presentation/family/family-nav";
import { FamilyMark } from "@/modules/accounts/presentation/family/family-shell-layout";
import { FamilyRecipientPicker } from "@/modules/accounts/presentation/family/family-recipient-picker";
import { cn } from "@/lib/utils";

interface FamilySidebarProps {
  shell: ShellContext;
}

function FamilySidebar({ shell }: FamilySidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = buildFamilyNavSections();

  const navContent = (
    <>
      <FamilyMark />
      <FamilyRecipientPicker shell={shell} />
      <nav className="flex flex-col gap-0.5" aria-label="Áreas do painel">
        {sections.map((section) => (
          <div key={section.label ?? "principal"} className="contents">
            {section.label ? (
              <p className="mb-1 mt-3 px-3 text-[11px] font-bold uppercase tracking-wide text-on-dark-muted">
                {section.label}
              </p>
            ) : null}
            {section.items.map((item) => {
              const active = isNavItemActive(pathname, item.path);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-tap items-center gap-2.5 rounded-control px-3 py-2.5 text-[13.5px] font-semibold text-on-dark-soft transition-colors",
                    active
                      ? "bg-brand-600 text-white"
                      : "hover:bg-white/10 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span aria-hidden className="w-5 text-center text-base">
                    {item.emoji}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <form action={signOut} className="mt-auto hidden pt-4 md:block">
        <button
          type="submit"
          className="min-h-tap w-full rounded-control px-3 py-2.5 text-left text-sm font-semibold text-on-dark-muted hover:bg-white/10 hover:text-white"
        >
          {familyContent.topbar.signOutLabel}
        </button>
      </form>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 left-4 z-40 flex min-h-tap min-w-tap items-center justify-center rounded-control bg-brand-800 text-white shadow-card md:hidden"
        aria-expanded={mobileOpen}
        aria-label={
          mobileOpen
            ? familyContent.mobileNav.closeLabel
            : familyContent.mobileNav.openLabel
        }
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label={familyContent.mobileNav.closeLabel}
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(100%,280px)] flex-col gap-0.5 overflow-y-auto bg-brand-900 px-3 py-4 text-on-dark transition-transform md:static md:z-auto md:w-[248px] md:translate-x-0 md:flex-shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}

export { FamilySidebar };
