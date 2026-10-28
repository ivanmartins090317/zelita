"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { elderContent, elderRoutes } from "@/content/elder";
import { cn } from "@/lib/utils";

const TABS = [
  { href: elderRoutes.home, label: elderContent.tabs.home, emoji: "🏠" },
  { href: elderRoutes.schedule, label: elderContent.tabs.schedule, emoji: "🕐" },
  { href: elderRoutes.family, label: elderContent.tabs.family, emoji: "📞" },
] as const;

function isTabActive(pathname: string, href: string): boolean {
  if (href === elderRoutes.home) return pathname === elderRoutes.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ElderTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App do idoso"
      className="elder-surface grid shrink-0 grid-cols-3 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-tap-elder flex-col items-center justify-center gap-0.5 text-[length:var(--elder-body)] font-bold",
              active ? "text-brand-700" : "text-muted",
            )}
          >
            <span aria-hidden>{tab.emoji}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
